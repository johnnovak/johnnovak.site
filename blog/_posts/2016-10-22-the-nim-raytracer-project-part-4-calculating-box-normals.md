---
layout: post
title:  "The Nim Ray Tracer Project &ndash; Part 4: Calculating Box Normals"
tags: [graphics, ray tracing, Nim]
date: 2016-10-22
---

{: .intro}
[I've been listening to *Shadows of the Heart* from *Dan Pound* all week, it's
just the perfect definition of ambient that, [according to Brian
Eno](http://music.hyperreal.org/artists/brian_eno/MFA-txt.html), "must be as
ignorable as it is interesting". No track highlights this time, this is really
meant to be listened to from beginning to end, over and over again; it's one
singular 55-minute piece of soothing ambient symphony!]

I needed a way to calculate normals for the box primitive in my ray tracer.
Of course, this is trivial if the boxes are represented as a triangle meshes
with stored per vertex normals---just use the triangle intersection routine
and job done! Interestingly, all online resources I could find either suggest
this approach or some naive algorithm that intersects the ray with all the six
planes that define the box... Ughh, we can certainly do better than that!

First of all, because we're not dealing with arbitrary boxes in 3D space here,
we can make certain optimisations. For my case, I wanted to be able to
calculate the normals for [axis-aligned bounded
boxes](https://en.wikipedia.org/wiki/Minimum_bounding_box#Axis-aligned_minimum_bounding_box)
(AABBs) only that are defined just by their two diagonally opposite points.

Why just AABBs? What about boxes that are not parallel to the axes? Well, the
way I'm doing things is that the final world position of an object is
described by its `objectToWorld` transform matrix that can include rotation as
well. Using AABBs for boxes, unit spheres for spheres etc. simplifies the
intersection routines a lot (makes them faster to calculate). Then during
rendering, I'm using the inverse transform `worldToObject` to transform the
ray to object space and do the intersection there[^intersect]. This method is
*vastly* more efficient for triangle meshes as well---we only need to inverse
transform a single ray instead of transforming potentially thousands or
millions of triangles!

[^intersect]: Transforming the *object to world space* with the object-to-world matrix and intersecting it with the world space ray is mathematically equivalent to transforming the *ray to object space* with the world-to-object matrix (which is the simple matrix inverse of the object-to-world matrix) and doing the intersection there. I'm saying "mathematically" because due to floating point inaccuracies the two methods won't yield exactly identical results. But the ray-to-object-space way actually keeps the relative error smaller and more uniform---as long as the object space coordinates have similar scale and are centred around the origin.

This is how our geometry definitions look like in Nim (we're using
[nim-glm](https://github.com/stavenko/nim-glm) for the vector maths stuff).
We're going to use AABBs later for constructing [bounding volume
hierarchies](https://en.wikipedia.org/wiki/Bounding_volume_hierarchy)  (BVH)
as well, hence the separate `AABB` and `Box` types.

{% highlight nimrod %}
import glm

type
  AABB* = ref object
    vmin*, vmax*: Vec4[float]

type
  Geometry* = ref object of RootObj
    objectToWorld*: Mat4x4[float]
    worldToObject*: Mat4x4[float]

  Sphere* = ref object of Geometry
    r*: float

  Plane* = ref object of Geometry
    discard

  Box* = ref object of Geometry
    aabb*: AABB
{% endhighlight %}


## Box normal algorithm

We'll solve the problem for the unit cube first, then we'll find a way to map
the solution from an arbitrary AABB to the unit cube.  For the sake of
simplicity, we're going to illustrate the basic algorithm in 2D only;
extending it to 3D is trivial.

### Solution for the unit cube

Consider the blue \$P\$ points that lie on the rectangle in Figure 1. By
looking at the vectors pointing to these points (blue arrows), we can make the
observation that by taking the integer parts of the vectors' coordinates
(*not* rounding!), we would get the normals we're after (green arrows). And
that's it!

{% include image.html name="box-normals.svg" caption="Figure 1 &mdash; Calculating normals for the unit rectangle in 2D. The vectors pointing to the blue points P are the hit points, and the green vectors N the corresponding normals." captionAlign="center" captionWidth="70%" %}

There are some complications though. This approach yields perfectly correct
results for \$P_1\$, \$P_2\$ and \$P_3\$, but for \$P_4\$ we'd get \$(1,
-1)\$, which firstly is not a normal, and secondly, is diagonal. Strictly
speaking, the diagonal-ness is a bit incorrect, although it can be argued that
the normals are "undefined" at the corners, thus the diagonal could as
well be accepted as a valid answer. Either way, in practice this won't make
any difference---we will very rarely hit the corners exactly, and even if we
did, the "degenerate" normals will be averaged out with the "normal" ones
during multi-sampling. We just need to normalise our resulting vector after
the integer truncation to ensure that the length is always 1.

Of course, we can always put a few if statements at the end to filter out the
diagonals, but that would make the whole algorithm slower. It's also worth
mentioning that in 3D we will have edge cases too in addition to the corner
cases (no pun intended).

### Solution for arbitrary AABBs

Mapping the problem from an AABB to the unit cube is basically a translation
and scaling exercise. Our AABB is defined by its two diagonally opposite
points, \$V_{\min}\$ and \$V_{\max}\$, from which we can easily calculate its
centre point \$C\$ (now in 3D):

\$\$ C=⟨{V_{\min_\x} + V_{\max_\x}} / 2, {V_{\min_\y} + V_{\max_\y}} / 2, {V_{\min_\z} + V_{\max_\z}} / 2⟩\$\$

Next, we'll calculate the vector \$p↖{→}\$ that points from the centre point to
the hit point \$P_{\hit}\$:

\$\$ p↖{→} = P_{\hit} - C \$\$

This vector corresponds to the blue vectors in Figure 1. What we need to do
next is map \$p↖{→}\$ to the unit cube by calculating divisor values
for each of its dimensions:

\$\$ \d_x = {\abs(V_{\min_\x}-V_{\max_\x})} / 2 \$\$
\$\$ \d_y = {\abs(V_{\min_\y}-V_{\max_\y})} / 2 \$\$
\$\$ \d_z = {\abs(V_{\min_\z}-V_{\max_\z})} / 2 \$\$

From \$p↖{→}\$ and the scalar divisors \$\d_x\$, \$\d_y\$ and \$\d_z\$ we can
calculate the normal \$n↖{→}\$ at the hit point (the green vectors in Figure
1):

\$\$ n↖{→} = ⟨\int(p_\x / \d_x), \int(p_\y / \d_y), \int(p_\z / \d_z)⟩ \$\$


## Implementation

Okay, time to have a look at some Nim code!  This is a slightly optimised
version of the above algorithm:

{% highlight nimrod %}
method normal*(b: Box, hit: Vec4[float]): Vec4[float] =
  let
    c = (b.aabb.vmin + b.aabb.vmax) * 0.5
    p = hit - c
    d = (b.aabb.vmin - b.aabb.vmax) * 0.5
    bias = 1.000001

  result = vec(((p.x / abs(d.x) * bias).int).float,
               ((p.y / abs(d.y) * bias).int).float,
               ((p.z / abs(d.z) * bias).int).float).normalize
{% endhighlight %}

Wait a minute, what's that multiplier `bias` doing there? That, my friend, is
**the amount of difference between theory of practice**. For educational
purposes only, this is what we would get if we left it off:

{% include image.html nameSmall="boxes-bad.png" name="boxes-bad.png" caption="Figure 2 &mdash; Boxes rendered with our box normal method omitting the bias multiplier. Due to floating point inaccuracies, we can observe something akin to the self-shadowing phenomena when calculating ray traced shadows." captionAlign="center" %}

Ooops, not exactly the result we were hoping for! What's going on here? The
problem is that because of floating point inaccuracies, our final coordinates
that are supposed to be 1.0 will sometimes end up being a bit less than that,
say 0.999999994, and in the final casting to int step they will become
0 instead of 1. To fix this, we'll need to nudge the points a tiny bit
outwards by scaling them up by a multiplicative epsilon value. The good news
is that this bias value doesn't have to be terribly accurate; we're going to
truncate the decimals away anyway. With this fix in place, we'll get the
correct results:

{% include image.html nameSmall="boxes-ok.png" name="boxes-ok.png" caption="Figure 3 &mdash; Boxes rendered with our box normal method; this time applying the bias multiplier. No weird artefacts can be observed, everything is looking good." captionAlign="center" %}

## Correctness vs real life

As I explained above, although this fast normal calculation method can be
considered incorrect by the mathematician types (and perhaps it is, I don't
know for sure), it seems to work perfectly fine for practical purposes. At
least, I couldn't spot any unwanted artefacts on my test renders, and
theoretically, there's very little chance to run into those diagonal normals,
and even then, their contribution to the final image would be minimal.

In parting, here is a more complex scene to prove my point.  If anyone is
aware of a situation where this algorithm could cause problems, I am
interested to hear about it though!

{% include image.html nameSmall="cube.png" name="cube.png" alt="" caption="Figure 4 &mdash; A cube made up of 64 smaller cubes. Even with our slightly &ldquo;incorrect&rdquo; normal calculation method, no weird artifacts can be observed whatsoever." captionAlign="center" %}


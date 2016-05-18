---
layout: post
title:  "The Nim Ray Tracer Project &ndash; Part 2"
tags: [graphics, ray tracing, Nim]
---

{: .intro}
[I have to tell that even after 34 years, *Brian Eno*'s ambient
music is still so much better than 99.9999% of all recent electronic releases.
Listening to *Ambient 4: On Land* from 1982; track #2 *The Lost Day* has
a wonderfully creepy atmosphere...]

## The Basics

Hello again! In the [initial
post](2016/04/28/the-nim-raytracer-project-part1/) of this series I talked
about ray tracing in general and my reasons for writing my own ray tracing
renderer in the most awesome [Nim](http://nim-lang.org/) language. Before
writing any code though, in this part we'll examine the basic maths required
for such a renderer.

Most of this stuff is a distilled version of the information contained in the
excellent [Scratchapixel 2.0 -- Learn Computer Graphics Programming from
Scratch](http://www.scratchapixel.com/) learning resource, which I highly
recommend to all graphics programming enthusiasts. There's absolutely zero
point in recreating the superb explanations from those lessons here, so just
go and read the original materials if you're interested.

My only problem with Scratchapixel was that while the content is generally of
very high quality, the mathematical notation they use is sometimes a bit
sloppy and a few formulas are actually incorrect (just a *very few*, to be
fair). I tried to supplement Scratchapixel with other random learning
materials found on the Internet but that also proved to be problematic because
of the slightly different notational conventions and assumptions of different
authors (e.g. some people assume a right-handed while others a left-handed
coordinate system, maths folks like their z-axis to point upwards, but in
computer graphics that's usually the y-axis and the z-axis points towards the
viewer, then there's the difference between row and column vector notation and
so on).  While these differences might be laughably trivial to a mathematician
or to someone who is already pretty familiar with the subject, they can surely
confuse the hell out of a newcomer, like myself (or maybe I just get confused
too easily, that might very well be the case...).

I'm not exactly the biggest fan of littering the source code with page-long
explanatory comments  either, so all my development notes will end up in these
blog posts. That way I will have at least a remote chance of understanding
what the hell I was doing here a couple of years down the track, and maybe
others will find my development diary also useful (or amusing, depending on
their perspective...).

Alright, let's get down to business!

### Coordinate system

We are going to use a [right-handed Cartesian coordinate system
](https://en.wikipedia.org/wiki/Cartesian_coordinate_system#In_three_dimensions)
to represents objects in our 3D world, where the *y-axis* points up, the
*x-axis* to the right and the *z-axis* "outward". In right-handed coordinate
systems, positive rotation is
[counter-clockwise](https://www.evl.uic.edu/ralph/508S98/coordinates.html)
about the axis of rotation.

{% include image.html name="coordinate-system.svg" caption="Figure 1 &mdash; The right-handed coordinate system used in our renderer. The circular arrow indicates the direction of positive rotation." captionAlign="center" captionWidth="70%" %}

The choice of coordinate system handedness is nothing more than a convention:
DirectX, Unity, Maya and Pixar's RenderMan use left-handed coordinate systems,
while OpenGL, [pbrt](http://www.pbrt.org/) and most other 3D modelling
software are right-handed. For our purposes, compatibility with OpenGL and
pbrt are the most important. Also, right-handed coordinate systems are the
norm in mathematics, which will also make life a bit easier.

### Notation

As I mentioned, the aim is to use a consistent mathematical notation throughout
the whole series, so let's define that first!

\$\$\cl\"ma-legend-align\"{\table
f, \text\"scalar\";
P, \text\"point\";
(P_x, P_y, P_z), \text\"point (by coordinates)\";
\AB, \text\"segment\";
v↖{→}, \text\"vector\";
⟨\v_\x, \v_\y, \v_\z⟩, \text\"vector (by coordinates)\";
n↖{∧}, \text\"unit vector)\";
{‖v↖{→}‖}, \text\"magnitude (length) of vector\";
a↖{→}·b↖{→}, \text\"dot product\";
a↖{→}×b↖{→}, \text\"cross product\";
\bo M, \text\"matrix\";
}\$\$

Column notation is used for vectors:

\$\$ v↖{→}=[\table x; y; z; w; ] \$\$

{: .note}
If the formulas look like crap in your browser, that means it
sadly doesn't support MathML. Solution? Use a better browser, like
[Firefox](https://www.mozilla.org/en-US/firefox/new/).

### Transform matrices

All the matrix stuff will be eventually handled by a [matrix
library](https://github.com/stavenko/nim-glm) written by someone else, but
it's still useful to know how these transforms look like in our right-handed
coordinate system (for example, for performance purposes we might hand-code
some optimised versions of these transforms later).

#### Translation and scaling

\$\$\bo T=[\table
1, 0, 0, t_x;
0, 1, 0, t_y;
0, 0, 1, t_z;
0, 0, 0, 1;
]
\;\;\;\;\;\;\bo S=[\table
s_x,   0,   0, 0;
  0, s_y,   0, 0;
  0,   0, s_z, 0;
  0,   0,   0, 1;
]\$\$

#### Rotation around a given axis

\$\$\bo R_\x=[\table
1,      0,       0, 0;
0, \cos θ, -\sin θ, 0;
0, \sin θ,  \cos θ, 0;
0,      0,       0, 1;
]
\;\;\;\;\;\;\bo R_\y=[\table
 \cos θ, 0, \sin θ, 0;
      0, 1,      0, 0;
-\sin θ, 0, \cos θ, 0;
      0, 0,      0, 1;
]\$\$

\$\$\bo R_\z=[\table
\cos θ, -\sin θ, 0, 0;
\sin θ,  \cos θ, 0, 0;
     0,       0, 1, 0;
     0,       0, 0, 1;
]\$\$

### Calculating primary rays

Let $(P_x, P_y)$ be the **pixel coordinates** of a pixel of the final image,
$w$ and $h$ the width and the height of the image in pixels and \$r = w / h\$
the image aspect ratio.

{% include image.html name="mappings.svg" caption="Figure 2 &mdash; The relationships between the raster, NDC and screen spaces." captionAlign="center" width="100%" %}

We have to shoot the rays through the middle of the pixels, thus the $(R_x,
R_y)$ **raster coordinates** of a given pixel are as follows:

\$\$\cl\"ma-join-align\"{\table
R_x ,= P_x + 0.5;
R_y ,= P_y + 0.5;
}\$\$

From this follows the formula for calculating the $(N_x, N_y)$
**normalised device coordinates (NDC)**:

\$\$\cl\"ma-join-align\"{\table
N_x ,= R_x / w r;
N_y ,= R_y / h;
}\$\$

And finally the $(S_x, S_y)$ **screen coordinates**:

\$\$\cl\"ma-join-align\"{\table
S_x ,= 2 N_x - r;
S_y ,= -(2 N_y - 1)
}\$\$

To simplify the calculations, let the image plane be -1 distance away from the
origin on the z-axis and let $&alpha;$ be the **vertical field of view
(FOV)** of the camera. From Figure 3 it can be seen that by default the field
of view is 90&deg; (because $\tan 90&deg; / 2 = \tan 45&deg; = 1 = \BC $), and
the length of $\BC$ is actually the $f$ **field of view factor** of the
camera.

{% include image.html name="fov.svg" caption="Figure 3 &mdash; Calculating the vertical field of view (FOV) factor." captionAlign="center" width="100%" %}

\$\$\tan &alpha; / 2 = \BC / \AB = \BC / 1\$\$
\$\$\BC = \tan &alpha; / 2 = f$\$

To obtain the desired field of view, the image surface has to be scaled by
the field of view factor (this is akin to zooming with a traditional camera
lens). Thus we yield the screen coordinates normalised by the field
of view factor:

\$\$\cl\"ma-join-align\"{\table
S_x ,= (2 N_x - r) f;
S_y ,= -(2 N_y - 1) f;
}\$$

After substitutions, the final transform from pixel coordinates to screen
coordinates looks like this:

\$\$\cl\"ma-join-align\"{\table
S_x ,= ({2 (P_x + 0.5) r} / w - r) f;
S_y ,= (1 - {2 (P_y + 0.5)} / h) f;
}\$$

So for each pixel $(P_x, P_y)$ in the image we can now calculate the
corresponding screen coordinates $(S_x, S_y)$ we'll need to shoot the
primary rays through. Since the camera is at the origin, the direction vector
$d↖{∧}$ of the ray corresponding to pixel $(P_x, P_y)$ is simply the vector
$⟨S_x, S_y⟩$ normalised:

\$\$ d↖{∧} = ⟨S_x, S_y⟩ / {‖⟨S_x, S_y⟩‖}\$\$

As the last step, we'll need to multiply the resulting direction vector
$d↖{∧}$ and the camera position $O$ (which is at the origin by default) with
the $\bo C$ camera-to-world transform matrix:

\$\$ d_{\w}↖{∧} = \bo C d↖{∧}\$\$
\$\$ O_{\w} = \bo C O\$\$

Note that assuming 4-component vectors and a 4x4 transform matrix that is used
for both translation and rotation, the above will only work correctly if the
fourth $w$ component of the direction vector $d↖{∧}$ is set to 0, and the $w$
component of the point $O$ is set to 1. Remember that the camera position is
at the origin before the transform, so $O$ will be always equal to this:

\$\$ O=[\table 0; 0; 0; 1; ] \$\$

### Ray-sphere intersection

The implicit equation of a **sphere** with centre point $C\$ and radius $r$:

\$\$(x-C_x)^2 + (y-C_y)^2 + (z-C_z)^2 = r^2\$\$

The parametric equation of a **half-open line segment** (the ray, in our
case), where $\O$ is the starting point, $d↖{∧}$ the direction vector and $P$
a point on the segment for any $t≧0$:

\$\$P = O + d↖{∧}t\$\$

Written component-wise:

\$\$P_x = O_x + d_xt \$\$
\$\$P_y = O_y + d_yt \$\$
\$\$P_z = O_z + d_zt \$\$

To get the ray-sphere intersection points, we'll need to substitute $P_x$,
$P_y$ and $P_z$ into the equation of the sphere:

\$\$(O_x + d_xt - C_x)^2 + (O_y + d_yt-C_y)^2 + (O_z + d_zt-C_z)^2 = r^2\$\$

The first parenthesised expression can be expanded like this:

\$\$\cl\"ma-join-align\"{\table
(O_x + d_xt - C_x)^2 ,= O_x^2 + O_x d_xt - O_xC_x + d_xtO_x + d_x^2t^2 - d_xtC_x - C_xO_x - C_xd_xt + C_x^2;
 ,= O_x^2 + 2O_x d_xt - 2O_xC_x + d_x^2t^2 - 2C_x d_xt + C_x^2;
 ,= d_x^2t^2 + (2O_x d_x - 2C_x d_x)t + (O_x^2 - 2O_xC_x + C_x^2);
 ,= d_x^2t^2 + (2d_x(O_x- C_x))t + (O_x - C_x)^2;
}\$\$

The remaining two expressions can be expanded in a similar way, so the final
equation will have the form of a quadratic equation \$ at^2 + bt + c = 0\$,
where:

\$\$\cl\"ma-join-align\"{\table
a ,= d_x^2 + d_y^2 + d_z^2;
b ,= 2 (d_x(O_x - C_x) + d_y(O_y - C_y) + d_z(O_z - C_z));
c ,= (O_x - C_x)^2 + (O_y - C_y)^2 + (O_z - C_z)^2;
}\$\$

First the discriminant \$\Δ\$ needs to be calculated. If \$\Δ &lt; 0\$, the
ray does not intersect the sphere; if \$\Δ = 0\$, the ray touches the sphere
(one intersection point); and if \$\Δ &gt; 0\$, it intersects the sphere at
two points. The equation can be solved for $t$ by applying the following
formula that takes care of the [loss of
significance](https://en.wikipedia.org/wiki/Loss_of_significance#A_better_algorithm)
floating-point problem:

\$\$\Δ = b^2-4ac\$\$

\$\$t_1 = {-b-\sgn(b)√\Δ} / {4a}\;\;\;,\;\;\;t_2 = c/{a t_1}\$\$


### Ray-plane intersection

A **plane** can be defined by a normal vector $n↖{∧}$ and a point $P_o$,
where $n↖{∧}$ represents the orientation of the plane and $P_o$ how far away
the plane is from the origin. We know that the dot product of two vectors is
zero only if they are perpendicular to each other, from which follows that for
every point $\P$ that lies on the plane defined by $n↖{∧}$ and $P_o$ the
following holds true:

\$\$(P-P_o)·n↖{∧}=0\$\$

To get the ray-plane intersection point, we only need to substitute the
parametric equation of the ray $\P = \O + d↖{∧}t$ into the above equation and
solve it for $t$ :


\$\$(O + d↖{∧}t-P_o)·n↖{∧}=0\$\$
\$\$d↖{∧}t·n↖{∧} + (O -P_o)·n↖{∧}=0\$\$
\$\$t = {(P_o - O)·n↖{∧}} / {n↖{∧}·d↖{∧}}\$\$

As usual, we are interested in positive $t$ values only. If $t$ is zero (or
very close to zero), then there is no intersection because the ray is parallel
with the plane, either away from it or exactly coinciding with it.


## In the next episode...

Believe it or not, that's all we maths we need to implement a very simple
ray tracer capable of rendering planes and spheres! In the next part, we'll
inspect some actual Nim code that generated this singular masterpiece of 80's
CGI art below. (Well, you gotta start somewhere, right?)

{% include image.html name="lame-first-render.jpg" caption="This might look like total crap, but it's 16x MSAA anti-aliased, yo, and it was generated by first ray tracing \"engine\"!" captionAlign="center" width="80%" %}

- - -

{::options parse_block_html="true" /}
<section class="links">

## Suggested reading

{: .compact}
* [Scratchapixel 2.0 -- Learn Computer Graphics Programming from
Scratch](http://www.scratchapixel.com/)

</section>

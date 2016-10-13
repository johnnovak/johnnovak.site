---
layout: post
title:  "The Nim Ray Tracer Project &ndash; Part 3: Lighting & Box Normals"
tags: [graphics, ray tracing, Nim]
date: 2016-10-23
published: false
---

Ok, so last time I ended my post with the cliffhanger that I'm going to show
some actual Nim code in the next episode (which is this). Well, I'll never
make foolish promises like that again, I swear! Now I need to come up with
some good excuses why we're gonna do something slightly different instead...

But seriously, I don't think there's much point in dissecting my code line by
line here, it would be just a colossal waste of time for everyone involved and
the codebase is in constant flux anyway. Anyone who's interested can take
a look at the code in the [GitHub
repository](https://github.com/johnnovak/nim-raytracer). What we'll do instead
from here on is to discuss some of my more interesting observations about ray
tracing on a higher level and maybe present the occasional original trick or
idea I managed to come up with.

## Lighting

The teaser image at the end of the last post used a very simple shading
mechanism called **facing ratio shading** for the spheres. As the name
implies, that just relies on the angle between the ray direction and the
surface normal at the ray hit location. This looks really basic, although it
still might come in handy sometimes for debugging.

A more useful shading mechanism is the so called **diffuse shading** (or
**Lambertian shading**) which simulates how surfaces without any specular
reflections behave in real life. Realistic shaders require light sources
though, so the next thing to implement is some sort of lights. We're doing
a ray tracing kindergarten here, so the first light types to implement will be
idealised **directional** and **point lights**.

A **directional light** is a light source that is infinitely far away, hence
it only has only a light direction but no position, and most importantly, no
falloff. Light sources of this kind are therefore ideal for simulating the
sun, which is "very far away". The shadows cast by a directional light source
are always parallel. This is how the example scene from the previous post
looks like when illuminated by two directional lights (the second one used as
a fill light, also known as The Poor Man's Global Illumination(TM)).

{% include image.html nameSmall="spheres.png" name="spheres.png" caption="Figure 1 &mdash; There's a slightly warm coloured key light right and an even warmer fill light from the left." captionAlign="center" %}

**Point lights** are idealised versions of light sources that are relatively
small in size and emit light in all directions, therefore they only have
a position but no light direction. From this follows that point lights cast
radial shadows. In contrast to directional lights, point lights do have
falloff (light attenuation), which follow the well-known [inverse- square
law](https://en.wikipedia.org/wiki/Inverse-square_law). Good examples of point
lights would be light bulbs, LEDs or the flame of a candle.  Of course, in
real life these light sources do have an actual measurable area, but we're not
simulating that (yet). Note how drastically different the exact same scene
looks like when illuminated by a single point light.

{% include image.html nameSmall="pointlight.png" name="pointlight.png" caption="Figure 1 &mdash; The main light is a strong backlight that matches the colour of the &quot;sky&quot;. There's a very faint front light too, otherwise the faces of the spheres would appear black." captionAlign="center" %}

GAMMA

global illum

Again, all this stuff (and much more) in explained in detail in the [shading
lesson](http://www.scratchapixel.com/lessons/3d-basic-rendering/introduction-to-shading)
at [Scratchapixel](http://www.scratchapixel.com/), so refer to that excellent
article series if you're interested in the technical details.

{% include image.html nameSmall="boxes2.png" name="boxes2.png" caption="Figure 1 &mdash; The main light is a strong backlight that matches the colour of the &quot;sky&quot;. There's a very faint front light too, otherwise the faces of the spheres would appear black." captionAlign="center" %}


### Calculating box normals


{% include image.html name="box-normals.svg" alt="Figure 1 &mdash; The right-handed coordinate system used in our renderer." caption="Figure 1 &mdash; The right-handed coordinate system used in our renderer. The circular arrow indicates the direction of positive rotation." captionAlign="center" captionWidth="70%" %}


blah

{% include image.html nameSmall="boxes-bad.png" name="boxes-bad.png" caption="Figure 1 &mdash; The main light is a strong backlight that matches the colour of the &quot;sky&quot;. There's a very faint front light too, otherwise the faces of the spheres would appear black." captionAlign="center" %}

{% include image.html nameSmall="boxes3.png" name="boxes3.png" caption="Figure 1 &mdash; The main light is a strong backlight that matches the colour of the &quot;sky&quot;. There's a very faint front light too, otherwise the faces of the spheres would appear black." captionAlign="center" %}

{% highlight nimrod %}
type
  AABB* = ref object
    vmin, vmax: Vec4[float]

  Box* = ref object of Geometry
    aabb*: AABB
{% endhighlight %}

whoarg


{% highlight nimrod %}
method normal*(b: Box, hit: Vec4[float]): Vec4[float] =
  let
    c = (b.aabb.vmin + b.aabb.vmax) * 0.5
    p = vec(hit - c)
    dx = abs(b.aabb.vmin.x - b.aabb.vmax.x) * 0.5
    dy = abs(b.aabb.vmin.y - b.aabb.vmax.y) * 0.5
    dz = abs(b.aabb.vmin.z - b.aabb.vmax.z) * 0.5
    bias = 1.0000001

  result = vec(float((p.x / dx * bias).int),
               float((p.y / dy * bias).int),
               float((p.z / dz * bias).int)).normalize
{% endhighlight %}

{% include image.html nameSmall="boxes.png" name="boxes.png" caption="Figure 1 &mdash; The main light is a strong backlight that matches the colour of the &quot;sky&quot;. There's a very faint front light too, otherwise the faces of the spheres would appear black." captionAlign="center" %}


## Vector maths (addendum)

Before we finish for today, here's some additional remarks regarding the basic
vector maths we discussed previously. We're using the
[nim-glm](https://github.com/stavenko/nim-glm) library for all vector maths
stuff, which is a port of [GLM](http://glm.g-truc.net/0.9.8/index.html)
(Open**GL** **M**athematics), which is a maths library based on the
[GLSL](https://www.opengl.org/documentation/glsl/) standard. This means we're
using column vectors (column-major notation) with post-multiplication:

{% highlight nimrod %}
let v: Vec4[float] = vec(1.0, 2.0, 3.0)

let m: Mat4x4[float] = mat4(1.0).translate(vec(-30.0, 0.0, 0.0))
                                .rotate(Y_AXIS, degToRad(60.0))
                                .translate(vec(0.0, 0.0, 5.0))

let v2 = m * v
{% endhighlight %}

In the above example, the vector `v` will be translated by 5 units along the
z-axis first, then rotated by 60 degrees around the y-axis, and finally
translated by -30 units along the x-axis.

{::options parse_block_html="true" /}
<section class="warning">
Be aware that the vector by matrix multiplication is also defined in GLSL but
it means something completely different (see section 5.11 of the
[GLSL](https://www.khronos.org/registry/gles/specs/2.0/GLSL_ES_Specification_1.0.17.pdf)
specification):

<pre>
vec3 v, u;
mat3 m;
u = v * m;

is equivalent to

u.x = dot(v, m[0]); // m[0] is the left column of m
u.y = dot(v, m[1]); // dot(a,b) is the inner (dot) product of a and b
u.z = dot(v, m[2]);
</pre>
</section>
{::options parse_block_html="false" /}

The function `vec` and the constant `Y_AXIS` are just some convience stuff.
We're using the `Vec4[float]` type to denote both points and vectors, and as
mentioned before, points must have their *w* component always set to 1.0
(otherwise translation would not work), and vectors to 0.0 (translation is
undefined for vectors). The following definitions help with the construction
of points and vectors and the conversion of one type into the other:

{% highlight nimrod %}
const X_AXIS* = vec3(1.0, 0.0, 0.0)
const Y_AXIS* = vec3(0.0, 1.0, 0.0)
const Z_AXIS* = vec3(0.0, 0.0, 1.0)

template vec*[T](x, y, z: T): Vec4[T] = vec4(x, y, z, 0.0)
template vec*[T](v: Vec4[T]): Vec4[T] = vec4(v.xyz, 0.0)

template point*[T](x, y, z: T): Vec4[T] = vec4(x, y, z, 1.0)
template point*[T](v: Vec4[T]): Vec4[T] = vec4(v.xyz, 1.0)
{% endhighlight %}

Storing the *w* component is convenient because we don't need to constantly
add it to the vector when multiplying it by a 4x4 matrix. Some people would
introduce a different point and vector type, but I really don't think that's
worth the trouble, it would just complicate the code too much for dubious
benefits. It's still a bit unclear to me whether storing the vectors as
3 floats instead of 4 would actually save anything as I guess they'll need to
be aligned to even addresses anyway. But we'll get to that at the later
optimisation stage, let's just get something on the screen first!

Finally, the following checks can be useful when debugging with asserts
(probably these could be improved by using a delta in the equality checks):

{% highlight nimrod %}
template isVec*[T]  (v: Vec4[T]): bool = v.w == 0.0
template isPoint*[T](v: Vec4[T]): bool = v.w == 1.0
{% endhighlight %}

Well, looks like in the end we *did* inspect some Nim code, after all! :)

- - -

{::options parse_block_html="true" /}
<section class="links">

## Suggested reading

{: .compact}

http://seanmiddleditch.com/matrices-handedness-pre-and-post-multiplication-row-vs-column-major-and-notations/

* [Andrew Kensler &ndash; Correlated Multi-Jittered Sampling](http://graphics.pixar.com/library/MultiJitteredSampling/paper.pdf)

</section>

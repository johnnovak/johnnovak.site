---
layout: post
title:  "Ao Resists the Forces of Darkness"
tags: [Ao, graphics, ray tracing, Nim]
date: 2017-06-15
---

I started reading the awesome [Physically Based Rendering: From Theory to
Implementation](http://www.pbrt.org/) book a few weeks ago, which made me
realise that it's probably for the best if I rewrote my raytracer from the
ground up based on the ideas presented in the book. After all, good coders
borrow, great coders steal, and at the very least we can say that I'm
proficient at stealing---the rest will hopefully follow!

I also got a bit tired with the long titles of my previous [ray tracing
related posts](/tag/ray tracing), so from now on I will call the project just
**Ao**. Why on Earth *that* particular name? Well, first I wanted to call my
ray tracer **Ra** after the [ancient Egyptian sun
god](https://en.wikipedia.org/wiki/Ra), but it looks like some French guy
[had already beaten me to it](http://cheesechess.free.fr/ra/imgbillard.html).
I liked the idea of using the name of some [ancient solar
deity](https://en.wikipedia.org/wiki/List_of_solar_deities) (looks like I'm
[not alone](https://github.com/iat-cener/tonatiuh) with this), but then
[Sol](https://en.wikipedia.org/wiki/Sol_(mythology)) was [kind of
taken](https://www.nrel.gov/csp/soltrace.html), and
[Huitzilopochtli](https://en.wikipedia.org/wiki/Huitzilopochtli) doesn't quite
roll off the tongue... So in the end I chose Ao, which I think is quite cool
and could also stand for [ambient
occlusion](https://en.wikipedia.org/wiki/Ambient_occlusion). Moreover, I live
in Australia, so that's another good reason for choosing a Polynesian god.

> "In the Polynesian mythology of the Maori, Ao ("daylight") is one of the
> primal deities who are the unborn forces of nature. Ao is the
> personification of light and the ordinary world, as opposed to darkness and
> the underworld. He is spoken of under many forms or manifestations,
> including Aoturoa, “enduring day, this world,” Aomarama, “bright day, world
> of light and life”. With his companions, Ata, “morning,” and Whaitua,
> “space,” Ao resists the forces of darkness."
> [(source)](http://everythingunderthemoon.net/forum/comprehensive-list-gods-goddesses-worldwide-t20390.html)

*&lt;ominous sound effects&gt;*

{: .heightened-dramatic-tension}
From henceforth, Ao shall resist the Forces of Darkness!

*&lt;/ominous sound effects&gt;*

Ok, so now that we got that out of the way, here's some words about my plan
and my experience with the book so far. The general idea is to read the book
from start to end and (re)implement everything in Nim as I go.

## Notes on the book

### Vectors, Normals, Points

{% highlight nimrod %}
type Vec2*[T] = object
  x*, y*: T

  Vec2f* = Vec2[FloatT]
  Vec2i* = Vec2[int]
{% endhighlight %}

### Matrix operations

`rigidInverse` (24 FLOPs) general `inverse` (152 FLOPs)

used in `lookAt`

### Ray-box intersection tests

https://tavianator.com/fast-branchless-raybounding-box-intersections-part-2-nans/

# Generates false positives when the ray origin lies exactly on the bounding



## Notes on Nim

### Inlines

{% highlight nimrod %}
proc vec3f*(x, y, z: FloatT): Vec3f {.inline.} =
  result = Vec3f(x: x, y: y, z: z)
  assert(not hasNaNs(result))
{% endhighlight %}


### Unit testing

{% highlight nimrod %}
when isMainModule:
  block:  # vec3f tests
    ...
  block:  # vec3i tests
    ...
{% endhighlight %}

### Calling super methods

{% highlight nimrod %}
type Ray* = object of RootObj
  o*: Vec3f
  d*, dInv*: Vec3f
  tMax*: FloatT
  time*: FloatT
  medium*: ref Medium

proc init(r: var Ray, o, d: Vec3f, tMax, time: FloatT,
          medium: ref Medium) {.inline.} =
  r.o = o
  r.d = d
  r.dInv = vec3f(1/d.x, 1/d.y, 1/d.z)
  r.tMax = tMax
  r.time = time
  r.medium = medium

proc initRay*(o, d: Vec3f, tMax, time: FloatT,
              medium: ref Medium): Ray {.inline.} =
  init(result, o, d, tMax, time, medium)

method hasNaNs*(r: Ray): bool {.base, inline.} =
  hasNaNs(r.o) or hasNaNs(r.d) or isNaN(r.tMax)

{% endhighlight %}

{% highlight nimrod %}
type RayDifferential* = object of Ray
  hasDifferentials*: bool
  rxOrigin*, ryOrigin*: Vec3f
  rxDirection*, ryDirection*: Vec3f

proc initRayDifferential(o, d: Vec3f, tMax, time: FloatT, medium: ref Medium,
                         hasDifferentials: bool,
                         rxOrigin, ryOrigin: Vec3f,
                         rxDirection, ryDirection: Vec3f): RayDifferential =
  init(result.Ray, o, d, tMax, time, medium)
  result.hasDifferentials = hasDifferentials
  result.rxOrigin = rxOrigin
  result.ryOrigin = ryOrigin
  result.rxDirection = rxDirection
  result.ryDirection = ryDirection

method hasNaNs*(r: RayDifferential): bool {.inline.} =
  (procCall hasNaNs(Ray(r))) or
    r.hasDifferentials and (hasNaNs(r.rxOrigin) or hasNaNs(r.ryOrigin) or
                            hasNaNs(r.rxDirection) or hasNaNs(r.ryDirection))
{% endhighlight %}

### Managing circular dependencies


### Modules, access modifiers & read-only properties


{% highlight nimrod %}
proc p(i: Interaction): Vec3f {.inline.} = i.p
proc pError(i: Interaction): Vec3f {.inline.} = i.pError
proc n(i: Interaction): Vec3f {.inline.} = i.n
proc wo(i: Interaction): Vec3f {.inline.} = i.wo
proc time(i: Interaction): FloatT {.inline.} = i.time
{% endhighlight %}

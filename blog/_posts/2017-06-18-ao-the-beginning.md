---
layout: post
title:  "Ao Resists the Forces of Darkness (pbrt meets Nim)"
tags: [ao, graphics, ray tracing, pbrt, nim]
date: 2017-06-18
---

I started reading the awesome [Physically Based Rendering: From Theory to
Implementation](http://www.pbrt.org/) book a few weeks ago, which made me
realise that it's probably for the best if I rewrote [my ray tracer](/tag/ray%20tracing) from the
ground up based on the ideas presented in the book. After all, good coders
borrow, great coders steal, and at the very least we can say that I'm
proficient at stealing---the rest will hopefully follow!

I also got a bit tired with the long titles of my previous [ray tracing
related posts](/tag/ray tracing), so from now on I will call the project just
**Ao**. Why on Earth *that* particular name? Well, first I wanted to use the
name **Ra** after the [ancient Egyptian sun
god](https://en.wikipedia.org/wiki/Ra), but it looks like some French guy [had
already beaten me to it](http://cheesechess.free.fr/ra/imgbillard.html).
I liked the idea of using the name of some [ancient solar
deity](https://en.wikipedia.org/wiki/List_of_solar_deities) (it looks like I'm
[not alone](https://github.com/iat-cener/tonatiuh) with this), but then
[Sol](https://en.wikipedia.org/wiki/Sol_(mythology)) was [kind of
taken](https://www.nrel.gov/csp/soltrace.html), and
[Huitzilopochtli](https://en.wikipedia.org/wiki/Huitzilopochtli) doesn't quite
roll off the tongue either... So in the end, I chose **Ao**, which I think is
quite cool and could also stand for [ambient
occlusion](https://en.wikipedia.org/wiki/Ambient_occlusion) as well. Moreover,
I live in Australia, so that's another good reason for choosing a Polynesian
god in this geographical vicinity.

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

Okay, now that we got that out of the way, here's some words about my
experience with the book so far. The general idea is that I will read the book
from start to end and (re)implement everything in Nim as I go. I am not going
to follow it to the letter though; sometime I might use a different
convention, approach or algorithm either for performance reasons or simply due
to personal preference.

## Notes on the book

I have only read the first two chapters so far, but I can already say that
I am extremely impressed by the book; it's a work of art and very obviously
a labour of love. The topics are well presented, the explanatory texts are
very well written in a somewhat terse but interesting style, and the authors
generally do a good to excellent job at explaining the theory behind the
algorithms.  I say generally because a few times I found myself wanting to do
further research on a given proof, but this is probably more due to me not
exactly being a math genius than the authors' fault...

For example, their less than one page derivation of the rotation transforms
wasn't quite clear to me, so I went googling and finally found [this paper](http://gamma.cs.unc.edu/users/hoff/projects/comp236_ta/rotations/rotations.pdf)
that made everything crystal clear. But then, the book is already 1100+ pages
long and giving more detailed proofs could easily have doubled that I guess,
so I'm okay with having to do some extra reading from time to time. Doing your
own research helps internalising knowledge better anyway.

One good source of computer graphics related information where the proofs are
explained in a bit more detail is
[Scratchapixel](http://www.scratchapixel.com/) which I wholeheartedly
recommend. For the math stuff I found a very good online resource, [Paul's
Online Math Notes](http://tutorial.math.lamar.edu/download.aspx), that seems
very promising (I just prefer reading to watching videos and he provides 
downloadable PDF versions of most of his materials).

### Coordinate system

[pbrt](http://www.pbrt.org/) uses a left-handed coordinate system, which is
the default coordinate system of
[DirectX](https://msdn.microsoft.com/en-us/library/windows/desktop/bb324490(v=vs.85).aspx),
[POV-Ray](http://www.povray.org/documentation/3.7.0/t2_2.html#t2_2_1_1),
[RenderMan](https://renderman.pixar.com/resources/RenderMan_20/interfaceIntro.html#coordinate-systems)
and
[Unity](http://answers.unity3d.com/questions/38924/unity-is-a-left-handed-coordinate-system-why.html),
among many others.  Right-handed coordinate systems, on the other hand (no pun
intended), are the standard in mathematics, physics and engineering.
[OpenGL](https://learnopengl.com/#!Getting-started/Coordinate-Systems) also
uses a right-handed coordinate system by default (although that's been the
source of a perpetual debate for quite some time now, just have a look
[here](https://stackoverflow.com/questions/5168163/is-the-opengl-coordinate-system-right-handed-or-left-handed)
or
[here](https://stackoverflow.com/questions/4124041/is-opengl-coordinate-system-left-handed-or-right-handed)).

In practical terms, most graphics environments allow to switch their default
handedness (OpenGL and DirectX certainly do), but as in the world of science
right-handed is the standard and I'm also interested in OpenGL programming
(plus I have zero interest in DirectX), I am just going to stick with
right-handed.  One consequence of this is that occasionally I'll have to work
a bit harder to correctly implement the algorithms presented in the book.
Well, if nothing else, this will require me to have a really solid
understanding of what I'm doing!

### Vectors, Normals, Points

The book introduces separate vector, normal and point templates, which contain
an awful lot of code duplication, and in my opinion just complicate things for
little gain. Overall, I don't think the better type safety is worth the added
code complexity and the potential performance penalty (because you'd need to
convert data back and forth between different types a lot). Because of this,
many systems just don't bother with making these distinctions
([GLSL](https://www.khronos.org/opengl/wiki/Data_Type_(GLSL)#Vector_constructors)
and [OpenEXR](http://www.openexr.com/) spring to mind) and just define
a single universal vector type instead to keep things simple.  Then it's up to
the actual code to interpret the data in the right context.  That's what I'm
doing here too; all vectors, normals and points are represented by a single
vector type:

{% highlight nimrod %}
type
  Vec2*[T] = object
    x*, y*: T

  Vec3*[T] = object
    x*, y*, z*: T

  Vec2f* = Vec2[FloatT]
  Vec2i* = Vec2[int]
  Vec3f* = Vec3[FloatT]
  Vec3i* = Vec3[int]
{% endhighlight %}

### Matrix inverse

I have introduced a special fast version of the 4x4 matrix inverse operation
called `rigidInverse` that can be used to quickly invert affine transforms
that don't have a scaling component. The optimised version only costs 24 FLOPs
instead of the 152 FLOPs of the general version (6.3x speedup!). I was able to make good use
of this in the `lookAt` procedure for some internal calculations.

### Ray-box intersection tests

The book presents a mostly straightforward implementation of the [slab
method](http://www.siggraph.org/education/materials/HyperGraph/raytrace/rtinter3.htm)
invented by Kay and Kayjia for calculating ray-box intersections (where by box
we mean axis-aligned bounding boxes, or AABBs). The problem with their
algorithm is that it contains a lot of conditional statements which hurt
performance.  AABB tests must be as fast as possible because a large
percentage of the total run time of the renderer will be spent performing
these intersection tests. Luckily, there's an optimised [branchless
version](https://tavianator.com/fast-branchless-raybounding-box-intersections-part-2-nans/)
out there which I ended up adopting. This version reports false hits
for degenerate cases where any of the ray origin's coordinates lay exactly on
the slab boundaries, but this is negligible if the actual ray-object
intersection routines are correct, and well worth the added 15-20%
performance boost compared to the 100% correct version.


## Notes on Nim

The best way to learn the intricacies of any programming language is to write
some non-trivial piece of software in it, and pbrt certainly falls into this
category. Implementing the code from the first two chapters in Nim has taught
me several useful lessons which I am going to summarise below.

### Project structure

Nim doesn't have the concept of access modifiers and packages like Java and
Scala, or namespaces like C++. The only available organisational unit is the
module that can export some of its symbols, otherwise they are private and
unaccessible to the outside world. One file can contain only one module, the
filename minus the extension being the name of the module (although a module
can be split up into several files with the use of `include`). All module
names have to be unique within the same compilation unit.

After much contemplation and experimentation I came up with the following
project structure that mirrors that of pbrt. For brevity, only two main
modules are presented here, `core` and `filter`.

    src/
      core/
        common.nim
        geometry.nim
        shape.nim
        types.nim
      filters/
        box.nim
        gaussian.nim
        types.nim
      main.nim

    test/
      core/
        allCoreTests.nim
        commonTests.nim
        geometryTests.nim
        shapeTests.nim
      filters/
        boxTests.nim
        gaussianTests.nim
      allTests.nim

    nim.cfg
    README.md

As mentioned above, module names must be unique per compilation unit; that's
the reason why I had to call the unit test modules `<modulename>Test`,
otherwise I wouldn't be able to import `<modulename>` into them. This also
means that public submodules that are imported by other modules must have
unique names, for example `core/common` and `filters/common` could not be
imported by the `main` module (remember, the filesystem path is *not* part of
the module name, just the filename).

`nim.cfg` contains the following:

    path="src/core"
    path="src/filters"
    # add a new entry for every module

This way we can conveniently just import submodules by the name of the
submodule, as they are all unique. This is much cleaner and easier to
maintain than using relative paths, especially in the unit tests. For
instance:


    import geometry     # imports src/core/geometry.nim
    import gaussian     # imports src/filters/gaussian.nim

The `types.nim` file inside each main module is a special thing that I am
going to explain [a bit later](#managing-circular-dependencies).

### Inlining

The Nim compiler doesn't do automatic inlining of small functions across
module boundaries; it is the programmer's responsibility to annotate such
functions with the `{.inline.}` pragma like this:

{% highlight nimrod %}
proc vec3f*(x, y, z: FloatT): Vec3f {.inline.} =
  result = Vec3f(x: x, y: y, z: z)
  assert(not hasNaNs(result))
{% endhighlight %}

This is a small thing, but forgetting about it can result in [severe
performance
penalties](/2017/04/22/nim-performance-tuning-for-the-uninitiated/#nim-----vector-module)
in numerical code that needs to be as fast as possible.

### Calling parent methods

Nim doesn't have a convenient `super()` pseudo-method that would allow the
calling of parent methods in a straightforward manner. This left me scratching
my head for a while until I found the answer in the [Nim
forums](https://forum.nim-lang.org/). There are two problems here that require
slightly different solutions, namely **calling parent constructors**
and **calling ordinary parent methods**.

#### Calling parent constructors

Constructor chaining is most easily accomplished by introducing internal
`init` helper procedures for every subclass which then can be called with the
subclass type converted to the parent class type. It's much easier to
understand this by looking at a concrete example:

{% highlight nimrod %}
type
  Shape* = object of RootObj
    x*, y*: float
    visible*: bool

  Circle* = object of Shape
    radius*: float

proc init(self: var Shape, x, y: float, visible: bool) =
  self.x = x
  self.y = y
  self.visible = visible

proc initShape*(x, y: float, visible: bool): Shape =
  init(result, x, y, visible)

proc init(self: var Circle, x, y, radius: float, visible: bool) =
  init(self.Shape, x, y, visible)  # this is the trick, call init on a Shape
  self.radius = radius

proc initCircle*(x, y, radius: float, visible: bool): Circle =
  init(result, x, y, radius, visible)

# Test
var c = initCircle(5, 8, 10.2, true)
echo c
# Prints: (radius: 10.2, x: 5.0, y: 8.0, visible: true)
{% endhighlight %}

The trick is happening in the `init` procedure of `Circle`, where we first
convert the `Circle` to a `Shape` and run the parent `init` procedure on it.

#### Calling ordinary parent methods

For ordinary methods, using
[`procCall`](https://nim-lang.org/docs/system.html#procCall,untyped) that
disables dynamic binding for a given call is the solution:

{% highlight nimrod %}
method draw(self: Shape) {.base.} =
  echo "Shape.draw enter"
  echo "Shape.draw exit"

method draw(self: Circle) =
  echo "Circle.draw enter"
  procCall self.Shape.draw  # or Shape(self).draw
  echo "Circle.draw exit"

c.draw
# Prints:
# Circle.draw enter
# Shape.draw enter
# Shape.draw exit
# Circle.draw exit
{% endhighlight %}

### Managing circular dependencies

Nim allows recursive module dependencies, as described [in the
manual](https://nim-lang.org/docs/manual.html#modules). They are a bit tricky
to work with in more complex scenarios, and different techniques are involved
when dealing with **circular procedure calls** versus **circular type
dependencies**.  (Perhaps there are even more cases when dealing with more
complex language features like macros, but I haven't got so far yet with my
use of Nim.)

#### Circular procedure calls

Not sure if this is the proper name for this pattern, but the example below
should make it clear what I'm referring to. Let's try to define two functions
in two separate modules that call each other co-routine style (blowing up the
stack, eventually). It turns out that we need to use forward proc declarations
to be able to accomplish this:

{% highlight nimrod %}
# bar.nim
proc barProc*()     # (1) forward declaration (there's no proc body)

import foo          # (2) stop parsing bar.nim & continue with foo.nim

proc barProc*() =   # (5) parsing foo.nim completed, continue from here
  echo "bar"
  fooProc()

when isMainModule:
  barProc()
{% endhighlight %}

{% highlight nimrod %}
# foo.nim
import bar      # (3) only the already known symbols in bar.nim are imported,
                #     which is only the forward declaration of barProc

proc fooProc*() =
  echo "foo"
  barProc()     # (4) this works because of the forward declaration
{% endhighlight %}

Running the code with `nim c -r bar` will print out `bar` and `foo` on
alternating lines until we hit a stack overflow. If we wanted to be able to
compile `foo.nim` separately as well, we'd need to put a forward declaration
at the top of the `foo` module too (should be obvious why after following the
path of execution in the above listings):

{% highlight nimrod %}
proc fooProc*()

import bar

proc fooProc*() =
  echo "foo"
  barProc()
{% endhighlight %}

#### Circular type dependencies

Nim only allows the forward declaration of procedures; for types, we'll need
a different approach. Moreover, there's a further limitation that [mutually
recursive
types](https://nim-lang.org/docs/tut2.html#object-oriented-programming-mutually-recursive-types)
need to be declared within a single type section (this is so to keep
compilation times low).

Sufficiently complex applications usually have quite complex type graphs where
certain types reference each other. Initially, I had a number of "submodules"
inside my `core` module, each of them defining a number of types.  Many of
these types have references to types defined in other submodules. Attempting
to tackle these type dependencies on a case by case basis is just a lot of
extra mental overhead and boring work, so the generic solution I ended up with
was moving all my top-level types into a new `core/types.nim` submodule (using
the `core` module as an example) which would then be imported by all `core`
submodules. All the types in `core/types.nim` are defined in a single type
section---this way I don't even need to think about circular type
dependencies anymore.

As a concrete example, `core/geometry.nim` would start like this:

{% highlight nimrod %}
import common, types
import math

export types.Vec2f, types.Vec2i, types.Vec3f, types.Vec3i
export types.Box2f, types.Box2i, types.Box3f, types.Box3i
export types.Ray
export types.RayDifferential
{% endhighlight %}

The `export` statements ensure that the public types of this submodule will be
available to the importing module. Private types that are used only internally
between the submodules simply don't get exported anywhere.

First I was averse to the idea of moving all the types into a single file,
away from the actual method implementations, but then I grew to like it. It's
not a bad thing to see all types from all submodules in one place, especially
when there are lots of complex interdependencies between them. As an
interesting note, Haskell, F# and OCaml have the same limitation regarding
circular type dependencies.

One drawback with this approach is that all properties defined in `types.nim`
must be public (exported with `*`), otherwise the submodules themselves
wouldn't be able to access them. This breaks encapsulation and can be
a problem for bigger projects with many developers working on the
code. In reality, I don't think this is a big deal though for people who
know what they are doing. Even the original pbrt authors made a good point
about exposing the internal data structures of most of their objects; doing
"proper encapsulation" by the book would just add lots of extra cruft that is
kind of unnecessary for small to medium sized projects developed by a single
person or a handful of people.[^small]

[^small]: My personal opinion is that it is actually a good thing that Nim has not been designed for assembly-line style large-scale software development... just look at the macro system and imagine how much havoc a 30+ person VB.NET team could wreak even just by looking at it!

## Conclusion

So long for today folks, hope you have enjoyed today's session. You can check
out the current state of Ao in the [GitHub
repository](https://github.com/johnnovak/ao). The takeaway message is that

* Nim is great; if you're interested in a cute language with C-like performance
characteristics that is a joy to use, you should definitely check it out, and

* pbrt is not just one of the best books on computer graphics that I ever
  had the pleasure of reading, but also one of the best technical books
  overall!  If you are interested in computer graphics and don't have
  it yet, it deserves a place on your bookshelf! It's a steal for the asking
  price.

{: .noline }
- - -

{::options parse_block_html="true" /}
<section class="links">

## Further links of interest

{: .compact}
* [pbrt](http://www.pbrt.org/)
* [Nim](http://nim-lang.org/)
* [Scratchapixel](http://www.scratchapixel.com/)
* [Kenneth E. Hoff III -- Deriving 2D and 3D Rotations](http://gamma.cs.unc.edu/users/hoff/projects/comp236_ta/rotations/rotations.pdf)
* [Paul's Online Math Notes](http://tutorial.math.lamar.edu/download.aspx)


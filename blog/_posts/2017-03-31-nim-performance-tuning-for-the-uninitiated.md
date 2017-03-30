---
layout: post
title:  "Nim performance tuning for the uninitiated"
tags: [coding, Nim, C++, performance]
---

## Overview

This post documents the trials and tribulations I encountered during my foray
into the wonderful world of low-level performance optimisation. For those
intimately familiar with modern optimising compilers and CPU architectures,
this will be kindergarten stuff. Although I have done my share of low-level
C and assembly coding in my high-spirited teenager years, that was more than
20 years ago on a 486, so naturally it didn't prevent me from running into
some quite embarassing mistakes as things are vastly different today, as we'll
shortly see...

Some of you might know that I'm writing a [ray tracer](/tag/ray%20tracing/)
(veeeeeery slowly), so it's no surprise that I'm quite a bit obsessed with raw
numerical performance. Don't bother with what people tell you about Moore's
Law, falling GFLOP prices, programmer productivity and the "evils" of
optimisation--anybody who writes or uses ray tracing software can tell you
that *nothing* is ever fast enough for this task (we'll come back to this at
the end in more detail). The de facto language choice for writing such
high-performance software has always been C++, potentially with some assembly
thrown in for good measure. One of the main reasons why I have chosen Nim for
this project was that it promises C-level performance without having to resort
to any weird tricks. I have a very annoying habit that I don't just believe
other people's statements unless I can verify them myself, so I thought it was
high time to put Nim's efficiency claims to test... which, as we'll see, led
me into some trouble.

## First attempts

The whole performance test idea came up when I was implementing the
ray-triangle intersection routine in my ray tracer.
My plan was simple: implement the same algorithm in C++ and Nim and measure if
there's any performance penalty for using Nim. Theoretically, there would be
very little to no difference in runtime speed as Nim code gets transformed to
plain C first, which then gets run through the same optimising C++ compiler.
I was a bit unsure though if Nim objects would map directly to C structs and
what magnitude of performance degradation (if any) would the GC introduce.

As my first slightly misguided attempt I tried to execute the intersection
routine with the same static input a few million times, then calculate an
average intersections per second figure from that. To my greatest
shock, the C++ version measured to be about 40-50 times faster!

Now, there were a couple of serious problems with this naive approach.
Firstly, I used a simple direct implementation of the [Möller–Trumbore
intersection
algorithm](https://en.wikipedia.org/wiki/M%C3%B6ller%E2%80%93Trumbore_intersection_algorithm);
notice that the algorithm can terminate early in multiple places.  Therefore,
it would make much more sense to test with a dataset large and varied enough
so that the different execution paths would be exercised with roughly the same
probability, allowing for a meaningful average to be calculated for the whole
algorithm. Secondly---and this is the worse problem!---by using static data
defined at the time of compilation, we're giving the compiler a free license
to optimise the whole code away and just replace it with a constant!  This
might come as a suprise to some, and it certainly *did* surprise me a lot, but
it turns out that modern optimising compilers like **gcc** and **clang** are
*really* good at [constant
folding](https://en.wikipedia.org/wiki/Constant_folding)!

So why don't we just turn the compiler optimisations off for the tests then?
Well, that would defeat the whole purpose of the performance measurements, so
that's not an option. We must always use the optimised release builds for such
tests.  But then how can we be ever certain that the compiler hasn't pulled
some tricks behind our backs, rendering the whole test scenario invalid?
Well, the only way to do that reliably is to inspect the final output, namely
the resulting binary. Luckily, we don't have to do exactly that as most
compilers can be instructed to emit post-optimisation assembly
sources that are directly used for generating the final binary.

This might sound intimidating for non-assembly programmers (which is probably
at least 99.99% of all programmers in the world today), but in practice we
don't need to be expert assembly coders to assert whether the compiler has
done what we wanted. This is definitely a useful skill to have because
sometimes we can "nudge" the compiler into the right direction to come up with
more efficient assembly-level structures by re-arranging the high-level code
a bit and maybe adding a few inlining hints here and there. Again, the only
foolproof way to see if such tricks have worked is to inspect the assembly
output.

## Test setup

- Precalculate *T* number of random triangles so that all three points of each
  triangle lie on the surface of the unit sphere.

- Precalculate *R* number of random rays so that each ray goes through two
  randomly selected points on the surface of the unit sphere.

- Intersect each ray with the whole set of triangles, so there will be *T*
  ✕ *R* intersection tests in total.


All tests were performed on a MacBook Pro (Mid 2014), 2.2 GHz Intel Core i7,
16 GB RAM running OS X El Capitan 10.11.6.

## Round 1 --- Nim vs C++

TODO
Clang 7.3.0 and Nim 0.16.1 (built from the develop branch).

### 0. C++

The "gold standard" for our daring enterprise will be the performance of the
single-threaded [orthodox
C++](https://gist.github.com/bkaradzic/2e39896bc7d8c34e042b) implementation.
You can check out the source code
[here](https://github.com/johnnovak/raytriangle-test/blob/master/cpp/perftest.cpp).
As we can see in the results below, our testing method gives us a roughly 5%
hit rate. The exact hit rate does not actually matter as long as it's not too
close to zero and if it hovers around the same value in all tests.

    Total intersection tests:  100,000,000
      Hits:                      4,994,583 ( 4.99%)
      Misses:                   95,005,417 (95.01%)

    Total time:                       1.93 seconds
    Millions of tests per second:    51.87

So ~51.9 millions of ray-triangle tests per second it is. I guess that's not
too bad for a straightforward C implementation! It turns out that Nim can
easily match that, but you have to know exactly what you're doing to get
there, as I'll show below.

#### Memory layout

One very important thing to note is how the triangle data is laid out in
memory. For every ray we're mowing through all the triangles in a linear
fashion, checking for intersections, so we must store the triangles
contiguously in a big chunk of memory to best utilise the CPU data caches:

{% highlight cpp %}
struct Vec3
{
  float x;
  float y;
  float z;
};

Vec3 *allocTriangles(int numTriangles)
{
  return (Vec3 *) malloc(sizeof(Vec3) * numTriangles * 3);
}
{% endhighlight %}


#### Inspecting the assembly output

Before progressing any further, let's take a quick look at a typical number
crunching function in assembly form! This is the command to compile the C++
source into the final executable:

    clang -std=c++11 -lm -O3 -o perftest perftest.cpp

And the command to emit the corresponding assembly output:

    clang -S -std=c++11 -O3 -o perftest.s perftest.cpp

Now we can do a full text search in the resulting `.s` file for the function
we want to inspect (`rayTriangleIntersect` in our case). As I said, we don't
really need to understand assembly on a deep level for our purposes; it's
enough to know that a healthy-looking number crunching function should
resemble something like this:

{% highlight asm %}
    .globl  __Z20rayTriangleIntersectP3RayP4Vec3S2_S2_
    .align  4, 0x90
__Z20rayTriangleIntersectP3RayP4Vec3S2_S2_:   # decorated function name
    .cfi_startproc            # function starts here
    pushq   %rbp              # some init stuff
Ltmp15:
    .cfi_def_cfa_offset 16
Ltmp16:
    .cfi_offset %rbp, -16
    movq    %rsp, %rbp
Ltmp17:
    .cfi_def_cfa_register %rbp
    movq    (%rdx), %xmm14
    movq    (%rsi), %xmm15

    ...

    mulss   %xmm6, %xmm11
    movaps  %xmm1, %xmm2
    mulss   %xmm0, %xmm2
    subss   %xmm2, %xmm11
    movaps  %xmm13, %xmm4     # actual function body
    mulss   %xmm0, %xmm4
    movaps  %xmm5, %xmm2
    mulss   %xmm7, %xmm2
    addss   %xmm7, %xmm2

    ...

    jmp LBB5_9                # some cleanup stuff
LBB5_2:
    movss   LCPI5_0(%rip), %xmm6
    jmp LBB5_9
LBB5_4:
    movss   LCPI5_0(%rip), %xmm6
    jmp LBB5_9
LBB5_6:
    movss   LCPI5_0(%rip), %xmm6
LBB5_9:
    movaps  %xmm6, %xmm0
    popq    %rbp
    retq
    .cfi_endproc              # the end
{% endhighlight %}

The init and cleanup stuff we're not really interested about, but the fact
that they are there is actually a good sign; this means that the compiler has
not optimised away the whole function. The function body for numerical
calculations involving floating point numbers will be basically lots of
mucking around with the SSE registers[^sse] (XMM1 to XMM15). For those who
have never seen assembly listings before, `movaps` moves values between
registers, `mulss` multiplies two registers, `addss` adds them and so on. Even
for a relatively short function like ours, the function body will go on for
pages.  This is good, this is what we wanted---it looks like we have the real
function here, not just a constant folded version of it.

For those wanting to delve further into the dark art of assembly programming,
make sure to check out the two excellent articles in the further reading
section.

[^sse]: The [SSE2](https://en.wikipedia.org/wiki/SSE2) instruction set was introduced in 2001 with the [Pentium 4](https://en.wikipedia.org/wiki/Pentium_4), so virtually every x86 family processor supports it today.  Note that this is 64-bit code, which you can easily spot because registers XMM8 through XMM15 are only available for 64-bit.


### 1. Nim --- using GLM

I started out with [nim-glm](https://github.com/stavenko/nim-glm) in my ray
tracer, which is more or less a port of the
[GLM](https://github.com/g-truc/glm)  OpenGL mathematics library. The
[original
version](https://github.com/johnnovak/raytriangle-test/blob/master/nim/perftest1.nim)
of the code used nim-glm's `Vec3[float32]` type and its associated methods for
vector operations.

To my greatest shock, the performance of my initial Nim code was quite
abysmal:

    Total intersection tests:  100,000,000
      Hits:                      4,703,478 ( 4.70%)
      Misses:                   95,296,522 (95.30%)

    Total time:                      19.86 seconds
    Millions of tests per second:     5.04

Yeah, that's a 10-fold performance degradation compared to the C++ version!
After much head scratching and debugging it turned out that nim-glm was the
culprit: the vector component getter and setter methods were not inlined by
the compiler. After a few strategically placed [inline
pragmas](https://github.com/stavenko/nim-glm/commit/aebc0ee68f6d3ed5ccc4fcc89dd81716af708c6e)
the situation got much better, but at this point I decided to give up on
nim-glm altogether and write my own vector routines. The thing is, nim-glm is
a fine *general purpose* vector maths library, but when it's time to get into
serious performance optimisggation mode, you want complete control over the
codebase, and using an external component that heavily uses macros is just
asking for pain.


### 2. Nim --- custom vector class (object refs)

Okay, so using [my own vector maths
code](https://github.com/johnnovak/raytriangle-test/blob/master/nim/perftest2.nim#L3-L32)
resulted in some improvement, but not by much:

    Total intersection tests:  100,000,000
      Hits:                      5,718,606 ( 5.72%)
      Misses:                   94,281,394 (94.28%)

    Total time:                      11.41 seconds
    Millions of tests per second:     8.76

What went wrong here? It turns out that for some reason I used object
references instead of plain objects for my `Vec3` and `Ray` types:

{% highlight nimrod %}
type Vec3 = ref object
  x, y, z: float32

type Ray = ref object
  dir, orig: Vec3
{% endhighlight %}

Inspecting the corresponding C code in the `nimcache` directory makes the
problem blatantly obvious (I cleaned up the generated symbol names a bit for
clarity):

{% highlight c %}
struct Vec3ObjectType {
  NF32 x;
  NF32 y;
  NF32 z;
};

struct RayObjectType {
  Vec3ObjectType* dir;    // indirection
  Vec3ObjectType* orig;   // indirection
};

struct SeqVec3Type {
  TGenericSeq Sup;
  Vec3ObjectType* data[SEQ_DECL_SIZE];  // indirection, array of pointers
};

SeqVec3Type* vertices;
{% endhighlight %}

So instead of having a contiguous block of triangle data, we ended up with
a contiguous block of *pointers* to each of the points making up the
triangles. This has disastrous performance implications: all the points are
randomly scattered around in memory so we'll get abysmal cache utilisation as
we can see it from the results.

### 3. Nim --- custom vector class (objects)

Fortunately, [the
fix](https://github.com/johnnovak/raytriangle-test/blob/master/nim/perftest3.nim#L3-L7)
is very simple; we only need to remove the `ref` keywords:

{% highlight nimrod %}
type Vec3* = object
  x*, y*, z*: float32

type Ray* = object
  dir*, orig*: Vec3
{% endhighlight %}

This will make the resulting type definitions be in line with our original C++
code:

{% highlight c %}
struct RayObjectType {
  Vec3ObjectType dir;
  Vec3ObjectType orig;
};

struct SeqVec3Type {
  TGenericSeq Sup;
  Vec3ObjectType data[SEQ_DECL_SIZE];  // array of structs
};
{% endhighlight %}

And the moment of truth:

    Total intersection tests:  100,000,000
      Hits:                      5,206,370 ( 5.21%)
      Misses:                   94,793,630 (94.79%)

    Total time:                       1.96 seconds
    Millions of tests per second:    50.93

Awww yeah! This is basically the same performance we had with the C++ version.
Comparing the assembly outputs of the Nim and C++ versions (exercise to the
reader) reveals that they are basically the same, which is no great suprise as
ultimately we're using the same compiler to generate the binaries.

### 4. Nim --- vector module

Alright, so time to extract the vector maths stuff into its [own
module](https://github.com/johnnovak/raytriangle-test/blob/master/nim/vector.nim).
Pretty trivial task, right? Let's run the tests again:

    Total intersection tests:  100,000,000
      Hits:                      5,237,698 ( 5.24%)
      Misses:                   94,762,302 (94.76%)

    Total time:                       2.89 seconds
    Millions of tests per second:    34.55

Shit, what went wrong here?

To understand this, we'll need to understand first how the Nim compiler works.
First Nim generates a single C file for every module in the project, then from
that point everything gets compiled and linked as if it were a regular
C codebase (which technically it is): C files get compiled into objects files
which then get linked together into the final binary. Most compilers do not
support link time optimisations, at least not by default, and even of they do,
Nim doesn't make use of such features yet (by the way, this is the reason why
inlined functions should be placed in the header files in C++). So if we want
to inline functions across module boundaries, we need to explicitly tell the
Nim compiler about so it can "manually" inline them into the resulting
C files.

### 5. Nim --- vector module (with inlines)

Fixing this is very easy; we'll just need to [decorate every
method](https://github.com/johnnovak/raytriangle-test/blob/master/nim/vectorfast.nim)
in our module with `{.inline.}` pragmas. For example:

{% highlight nimrod %}
proc `-`*(a, b: Vec3): Vec3 {.inline.} =
  result = vec3(a.x - b.x, a.y - b.y, a.z - b.z)
{% endhighlight %}

And we're done, the performance of version 3 has been restored:

    Total intersection tests:  100,000,000
      Hits:                      4,640,926 ( 4.64%)
      Misses:                   95,359,074 (95.36%)

    Total time:                       1.96 seconds
    Millions of tests per second:    51.12


## Round 2 --- Nim vs Java, JavaScript & Python

At this point I got really curious about how some other languages I use
regularly would stack up against our current benchmarks kings (look, there's
even a crown in the [Nim logo](https://nim-lang.org/), surely that can't be
just a coincidence!). I didn't try to do any nasty tricks to increase
performance in any of these tests (e.g. using simple arrays of primitives
instead of objects in Java); I just did a straightforward idiomatic port in
each case (you can check out the code [in the
repo](https://github.com/johnnovak/raytriangle-test)). Here's the final
results:

<table style="width: 80%">
  <tr>
    <th>Language</th>
    <th style="text-align: center">Mtests/s</th>
    <th style="text-align: center">Rel. performance</th>
    <th style="text-align: center">Total time (s)</th>
  </tr>
  <tr style="font-weight: bold">
    <td>C++</td>
    <td style="text-align: center">51.9</td>
    <td style="text-align: center">1.00x</td>
    <td style="text-align: center">1.93</td>
  </tr>
  <tr style="font-weight: bold">
    <td>Nim</td>
    <td style="text-align: center">51.1</td>
    <td style="text-align: center">0.98x</td>
    <td style="text-align: center">1.96</td>
  </tr>
  <tr>
    <td>Java</td>
    <td style="text-align: center">31.3</td>
    <td style="text-align: center">0.60x</td>
    <td style="text-align: center">3.20</td>
  </tr>
  <tr>
    <td>JavaScript</td>
    <td style="text-align: center">29.2</td>
    <td style="text-align: center">0.56x</td>
    <td style="text-align: center">3.43</td>
  </tr>
  <tr>
    <td>PyPy</td>
    <td style="text-align: center">10.5</td>
    <td style="text-align: center">0.20x</td>
    <td style="text-align: center">9.51</td>
  </tr>
  <tr>
    <td>CPython2</td>
    <td style="text-align: center">0.20</td>
    <td style="text-align: center">0.004x</td>
    <td style="text-align: center">508.68</td>
  </tr>
  <tr>
    <td>CPython3</td>
    <td style="text-align: center">0.15</td>
    <td style="text-align: center">0.003x</td>
    <td style="text-align: center">673.66</td>
  </tr>
</table>

The following compiler/runtime versions were used for the tests:

<table style="width: 50%">
  <tr>
    <th style="width: 40%">Language</th>
    <th style="width: 60%">Version</th>
  </tr>
  <tr>
    <td>C++</td>
    <td>Apple LLVM 7.3.0</td>
  </tr>
  <tr>
    <td>Nim</td>
    <td>0.16.1</td>
  </tr>
  <tr>
    <td>Java</td>
    <td>Oracle JVM 1.8.0_112-b16</td>
  </tr>
  <tr>
    <td>NodeJS</td>
    <td>4.4.7</td>
  </tr>
  <tr>
    <td>CPython2</td>
    <td>2.7.13</td>
  </tr>
  <tr>
    <td>CPython3</td>
    <td>3.5.2</td>
  </tr>
  <tr>
    <td>PyPy</td>
    <td>2.7.13</td>
  </tr>
</table>

I'm quite disappointed with the Java results, only 60% of the performance of
C++/Nim. JavaScript, on the other hand, did surprise me a lot; it's basically
on par with the performance of Java---I expected much less numerical
performance from JavaScript. Taking into consideration that JavaScript has
only doubles while in Java I was able able to switch to floats for a slight
performance bump makes this result even more impressive.

The Python results are, however, quite depressing.



### Java

<table style="width: 60%">
  <tr>
    <th># of tests</th>
    <th style="text-align: center">Mtests/s</th>
    <th style="text-align: center">Rel. performance</th>
  </tr>
  <tr>
    <td>100K</td>
    <td style="text-align: center">11.1</td>
    <td style="text-align: center">0.21x</td>
  </tr>

  <tr>
    <td>1M</td>
    <td style="text-align: center">25.7</td>
    <td style="text-align: center">0.49x</td>
  </tr>
  <tr>
    <td>10M</td>
    <td style="text-align: center">37.4</td>
    <td style="text-align: center">0.72x</td>
  </tr>
  <tr>
    <td>100M</td>
    <td style="text-align: center">31.3</td>
    <td style="text-align: center">0.60x</td>
  </tr>
</table>


### JavaScript

<table style="width: 60%">
  <tr>
    <th># of tests</th>
    <th style="text-align: center">Mtests/s</th>
    <th style="text-align: center">Rel. performance</th>
  </tr>
  <tr>
    <td>100K</td>
    <td style="text-align: center">9.0</td>
    <td style="text-align: center">0.17x</td>
  </tr>

  <tr>
    <td>1M</td>
    <td style="text-align: center">20.5</td>
    <td style="text-align: center">0.39x</td>
  </tr>
  <tr>
    <td>10M</td>
    <td style="text-align: center">29.7</td>
    <td style="text-align: center">0.57x</td>
  </tr>
  <tr>
    <td>100M</td>
    <td style="text-align: center">29.2</td>
    <td style="text-align: center">0.56x</td>
  </tr>
</table>


### Python

<table style="width: 60%">
  <tr>
    <th># of tests</th>
    <th style="text-align: center">Mtests/s</th>
    <th style="text-align: center">Rel. performance</th>
  </tr>
  <tr>
    <td>100K</td>
    <td style="text-align: center">1.0</td>
    <td style="text-align: center">0.02x</td>
  </tr>

  <tr>
    <td>1M</td>
    <td style="text-align: center">3.8</td>
    <td style="text-align: center">0.07x</td>
  </tr>
  <tr>
    <td>10M</td>
    <td style="text-align: center">9.2</td>
    <td style="text-align: center">0.18x</td>
  </tr>
  <tr>
    <td>100M</td>
    <td style="text-align: center">10.5</td>
    <td style="text-align: center">0.20x</td>
  </tr>
</table>


## Conclusion

TODO



## Further links of interest

{: .compact}
* [Gwynne Raskind --- Disassembling the Assembly, Part 1](https://www.mikeash.com/pyblog/friday-qa-2011-12-16-disassembling-the-assembly-part-1.html)

* [Gwynne Raskind --- Disassembling the Assembly, Part 2](https://www.mikeash.com/pyblog/friday-qa-2011-12-23-disassembling-the-assembly-part-2.html)

* [Compiler Explorer](https://godbolt.org/)


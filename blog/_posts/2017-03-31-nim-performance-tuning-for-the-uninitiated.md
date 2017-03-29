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
You can check out the source code [here](). As we can see in the results
below, our testing method gives us a roughly 5% hit rate. The exact hit rate
does not actually matter as long as it's not too close to zero and if
it hovers around the same value in all tests.

    Total intersection tests:  100,000,000
      Hits:                      4,994,583 ( 4.99%)
      Misses:                   95,005,417 (95.01%)

    Total time:                       1.93 seconds
    Millions of tests per second:    51.87

So ~51.9 millions of ray-triangle tests per second it is. I guess that's not
too bad for a straightforward C implementation! It turns out that Nim can
easily match that, but you have to know exactly what you're doing to get
there, as I'll show below.

#### Inspecting the assembly output

Before progressing any further, let's take a quick look at a typical number
crunching function in assembly form! This is the command to compile the C++
source into the final executable:

    clang -std=c++11 -lm -O3 -o perftest perftest.cpp

The command to emit the corresponding assembly output:

    clang -S -std=c++11 -O3 -o perftest.s perftest.cpp

Now we can do a full text search in the resulting `.s` file for the function
we want to inspect (`rayTriangleIntersect` in our case). As I said, we don't
really need to understand assembly on a deep level for our purposes; it's
enough to know that a healthy-looking function should resemble something like
this:

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
that they are there is actually a good sign that the compiler did not optimise
away the whole function. The function body for numerical calculations
involving floating point numbers will be
basically lots of mucking around with the SSE registers (XMM1 to XMM15)

`movaps` moves values between registers, `mulss` multiplies two registers,
`addss` adds them and so on.


[^sse]
You'll usually soo lots of mucking around in the
SSE registers (XMM1 to XMM15). 

[^sse]: The [SSE2](https://en.wikipedia.org/wiki/SSE2) instruction set was introduced in 2001 with the [Pentium 4](https://en.wikipedia.org/wiki/Pentium_4), so virtually every x86 family processor supports it today.  Note that this is 64-bit code, which you can easily spot because registers XMM8 through XMM15 are only available for 64-bit.



### 1. Nim --- using GLM

I started out with [nim-glm](https://github.com/stavenko/nim-glm) in my ray
tracer, which is more or less a port of the
[GLM](https://github.com/g-truc/glm)  OpenGL mathematics library. The
[original version]() of the code used nim-glm's `Vec3[float32]` type and its
associated methods for vector operations.

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
nim-glm and write my own vector routines. The thing is, nim-glm is a fine
*general purpose* vector maths library, but when it's time to get into serious
performance optimisation mode, you want complete control over the codebase,
and using an external component that heavily uses macros is just asking for
pain.


### 2. Nim --- custom vector class (object refs)

TODO

{% highlight nimrod %}
type Vec3 = ref object
  x, y, z: float32

type Ray = ref object
  dir, orig: Vec3
{% endhighlight %}

TODO

    Total intersection tests:  100,000,000
      Hits:                      5,718,606 ( 5.72%)
      Misses:                   94,281,394 (94.28%)

    Total time:                      11.41 seconds
    Millions of tests per second:     8.76


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

### 3. Nim --- custom vector class (objects)

TODO

{% highlight cpp %}
struct Vec3
{
  float x;
  float y;
  float z;
};

struct Ray
{
  Vec3 orig;
  Vec3 dir;
};
{% endhighlight %}

one big contiguous memory block

{% highlight cpp %}
Vec3 *allocTriangles(int numTriangles)
{
  return (Vec3 *) malloc(sizeof(Vec3) * numTriangles * 3);
}
{% endhighlight %}

TODO

{% highlight nimrod %}
type Vec3* = object
  x*, y*, z*: float32

type Ray* = object
  dir*, orig*: Vec3
{% endhighlight %}

TODO

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

TODO

    Total intersection tests:  100,000,000
      Hits:                      5,206,370 ( 5.21%)
      Misses:                   94,793,630 (94.79%)

    Total time:                       1.96 seconds
    Millions of tests per second:    50.93

Awww yeah!

### 4. Nim --- vector module

TODO

    Total intersection tests:  100,000,000
      Hits:                      5,237,698 ( 5.24%)
      Misses:                   94,762,302 (94.76%)

    Total time:                       2.89 seconds
    Millions of tests per second:    34.55

Shit, what went wrong here?

### 5. Nim --- vector module (with inlines)

{% highlight nimrod %}
proc `-`*(a, b: Vec3): Vec3 {.inline.} =
  result = vec3(a.x - b.x, a.y - b.y, a.z - b.z)
{% endhighlight %}

TODO

    Total intersection tests:  100,000,000
      Hits:                      4,640,926 ( 4.64%)
      Misses:                   95,359,074 (95.36%)

    Total time:                       1.96 seconds
    Millions of tests per second:    51.12


## Round 2 --- Nim vs Java, JavaScript & Python

TODO

<table style="width: 60%">
  <tr>
    <th>Language</th>
    <th style="text-align: center">Mtests/s</th>
    <th style="text-align: center">Rel. performance</th>
  </tr>
  <tr>
    <td>C++</td>
    <td style="text-align: center">51.9</td>
    <td style="text-align: center">1.00x</td>
  </tr>
  <tr>
    <td>Nim</td>
    <td style="text-align: center">51.1</td>
    <td style="text-align: center">0.98x</td>
  </tr>
  <tr>
    <td>Java</td>
    <td style="text-align: center">31.3</td>
    <td style="text-align: center">0.60x</td>
  </tr>
  <tr>
    <td>JavaScript</td>
    <td style="text-align: center">29.2</td>
    <td style="text-align: center">0.56x</td>
  </tr>
  <tr>
    <td>PyPy</td>
    <td style="text-align: center">10.7</td>
    <td style="text-align: center">0.21x</td>
  </tr>
  <tr>
    <td>CPython2</td>
    <td style="text-align: center">0.21</td>
    <td style="text-align: center">0.004x</td>
  </tr>
  <tr>
    <td>CPython3</td>
    <td style="text-align: center">0.15</td>
    <td style="text-align: center">0.003x</td>
  </tr>
</table>

The following language versions were used:

<table style="width: 50%">
  <tr>
    <th style="width: 50%">Language</th>
    <th style="width: 50%">Version</th>
  </tr>
  <tr>
    <td>Clang</td>
    <td>7.3.0</td>
  </tr>
  <tr>
    <td>Nim</td>
    <td>0.16.1</td>
  </tr>
  <tr>
    <td>Java</td>
    <td>1.8.0_112-b16</td>
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


---
layout: post
title:  "Nim performance tuning for the uninitiated"
tags: [coding, Nim, C++, performance]
---

{: .intro}
UPDATE 2017-06-04: Corrected some slight misinformation regarding
link time optimisations and the {.inline.} pragma, some stylistic
improvements, added more references.

## Overview

This post documents the trials and tribulations I encountered during my foray
into the wonderful world of low-level performance optimisation. For those
intimately familiar with modern optimising compilers and CPU architectures,
this will be kindergarten stuff. Although I have done my share of low-level
C and assembly coding in my high-spirited teenager years, that was more than
20 years ago on a then-state-of-the-art 486 DX-2/66, so naturally it didn't
prevent me from running into some quite embarrassing mistakes as things are
vastly different today, as we'll shortly see...

Some of you might know that I'm writing a [ray tracer](/tag/ray%20tracing/)
(veeeeeery slowly), so it's no surprise that I'm quite a bit obsessed with raw
numerical performance. Don't bother with what people tell you about Moore's
Law, falling GFLOP prices, programmer productivity and the "evils" of
optimisation---anybody who writes or uses ray-tracing software can tell you
that *nothing* is ever fast enough for this task (we'll come back to this at
the end in more detail). The de facto language choice for writing such
high-performance applications has always been C++, potentially with some
assembly thrown in for good measure. One of the main reasons why I have chosen
Nim for this project was that it promises C-level performance without having
to resort to any weird tricks (and, of course, it prevents me from having to
use C++). I have a very annoying habit that I don't just believe other
people's statements unless I can verify them myself, so I thought it was high
time to put Nim's efficiency claims to test... which, as we'll see, led me
into some trouble.

## First attempts

The whole performance test idea came up when I was implementing the
ray-triangle intersection routine in my ray tracer. My plan was simple:
implement the same algorithm in C++ and Nim and measure if there's any
performance penalty for using Nim. Theoretically, there would be very little
to no difference in runtime speed as Nim code gets transformed to plain
C first, which then gets run through the same optimising C++ compiler.  I was
a bit unsure though if Nim objects would map directly to C structs and what
magnitude of performance degradation (if any) would the GC introduce.

As my first slightly misguided attempt I tried to execute the intersection
routine with the same static input a few million times, then calculate an
average intersections per second figure from that. To my greatest shock, the
C++ version measured to be about 40-50 times faster!

Now, there were a couple of serious problems with this naive approach.
Firstly, I used a simple direct implementation of the [Möller–Trumbore
intersection
algorithm](https://en.wikipedia.org/wiki/M%C3%B6ller%E2%80%93Trumbore_intersection_algorithm).
Notice that the algorithm can terminate early in multiple places? Therefore,
it would make much more sense to test with a dataset large and varied enough
so that the different execution paths would be exercised with roughly the same
probability, allowing for a meaningful average to be calculated for the whole
algorithm. Secondly---and this is the worse problem!---by using static data
defined at the time of compilation, we're giving the compiler a free license
to optimise the whole code away and just replace it with a constant! This
might come as a surprise to some---and it certainly *did* surprise me!---but
it turns out that modern optimising compilers like **gcc** and **clang** are
*really* good at [constant
folding](https://en.wikipedia.org/wiki/Constant_folding)!

So why don't we just turn the compiler optimisations off for the tests then?
Well, that would defeat the whole purpose of the performance measurements, so
that's out of the question. We must always use the optimised release builds
for such tests.  But then how can we ever be certain that the compiler hasn't
pulled some tricks behind our backs, rendering the whole test scenario
invalid?  Well, the only way to do that reliably is to inspect the final
output produced by the compiler, namely the resulting binary. Luckily, we
don't have to do exactly that, as there's a second-best (and much more
convenient) option: most compilers can be instructed to emit the
post-optimisation stage assembly sources that are used for generating the
final binary.

While this might sound a little intimidating for non-assembly programmers
(which is probably at least 99.9999% of all programmers in the world today), in
practice we don't need to be expert assembly coders to assert whether the
compiler has done what we wanted. Moreover, this is definitely a useful skill
to have because sometimes we can "nudge" the compiler into the right direction
to come up with more efficient assembly-level structures by re-arranging the
high-level code a bit and maybe adding a few inlining hints here and there.
Again, the only foolproof way to see if such tricks have really worked is to
inspect the assembly output.

## Test setup

The two most obvious solutions to prevent constant folding is to either load
the test data from a file or to generate it at runtime. I chose the latter
because I'd have to write the test data generation code anyway, so why not do
it at runtime then.

The tests execute the following steps:

- Precalculate *T* number of random triangles so that all points of 
  the triangles lie on the surface of the unit sphere.

- Precalculate *R* number of random rays so that each ray goes through two
  points randomly selected on the surface of the unit sphere.

- Intersect each ray with the whole set of triangles, so there will be *R*
  ✕ *T* intersection tests in total.

The only tricky thing is to make sure that the random points we pick on the
sphere are uniformly distributed. A straightforward solution to this problem
can be found [here](https://math.stackexchange.com/a/1586185).

All tests were performed on a MacBook Pro (Mid 2014), 2.2 GHz Intel Core i7,
16 GB RAM running OS X El Capitan 10.11.6.

## Round 1 --- Nim vs C++

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
memory. For every single ray we're going to mow through all the triangles in
a linear fashion, checking for intersections, so we must store the triangles
contiguously in a big chunk of memory to best utilise the CPU data caches.
This is straightforward to do in C:

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

    clang -std=c++11 -S -O3 -o perftest.s perftest.cpp

Now we can do a full text search in the resulting `.s` file for the function
we want to inspect (`rayTriangleIntersect` in this case). As I said, we don't
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

    ...                       # omitted

    mulss   %xmm6, %xmm11
    movaps  %xmm1, %xmm2
    mulss   %xmm0, %xmm2
    subss   %xmm2, %xmm11
    movaps  %xmm13, %xmm4     # actual function body
    mulss   %xmm0, %xmm4
    movaps  %xmm5, %xmm2
    mulss   %xmm7, %xmm2
    addss   %xmm7, %xmm2

    ...                       # omitted

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
registers, `mulss` multiplies two registers, `addss` adds them together and so
on. Even for a relatively short numerical function like ours, the function
body will go on for pages. This is good, this is what we wanted---it looks
like we have the real function here, not just some constant folded version of
it.

For those wanting to delve further into the dark art of assembly programming,
make sure to check out the two excellent articles in the further reading
section at the end of the article.

[^sse]: The [SSE2](https://en.wikipedia.org/wiki/SSE2) instruction set was introduced in 2001 with the [Pentium 4](https://en.wikipedia.org/wiki/Pentium_4), so virtually every x86 family processor supports it today.  Note that this is 64-bit code, which you can easily spot because registers XMM8 through XMM15 are only available for 64-bit.


### 1. Nim --- using GLM

I started out with [nim-glm](https://github.com/stavenko/nim-glm) in my ray
tracer, which is more or less a port of the
[GLM](https://github.com/g-truc/glm) OpenGL mathematics library.  The
[original
version](https://github.com/johnnovak/raytriangle-test/blob/master/nim/perftest1.nim)
of the code used nim-glm's `Vec3[float32]` type and its associated methods for
vector operations.

To my greatest shock, the performance of my initial Nim code was quite
abysmal, barely 1-2 millions of tests per second! After much head scratching
and debugging it turned out that nim-glm was the culprit: the vector component
getter and setter methods were not inlined by the compiler. After a few
strategically placed [inline
pragmas](https://github.com/stavenko/nim-glm/commit/aebc0ee68f6d3ed5ccc4fcc89dd81716af708c6e)
the situation got somewhat better, but still a 10-fold performance degradation
compared to the C++ version:

    Total intersection tests:  100,000,000
      Hits:                      4,703,478 ( 4.70%)
      Misses:                   95,296,522 (95.30%)

    Total time:                      19.86 seconds
    Millions of tests per second:     5.04


At this point I decided to give up on nim-glm altogether and write my own
vector routines. The thing is, nim-glm is a fine *general purpose* vector
maths library, but when it's time to get into serious performance optimisation
mode, you want complete control over the codebase, and using an external
component that heavily uses macros is just asking for trouble.


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
problem blatantly obvious (I cleaned up the generated symbol names for
clarity):

{% highlight c %}
struct Vec3ObjectType {
  NF32 x;
  NF32 y;
  NF32 z;
};

struct RayObjectType {
  Vec3ObjectType* dir;    // indirection!
  Vec3ObjectType* orig;   // indirection!
};

struct SeqVec3Type {
  TGenericSeq Sup;
  Vec3ObjectType* data[SEQ_DECL_SIZE];  // indirection! (array of pointers)
};

SeqVec3Type* vertices;
{% endhighlight %}

So instead of having a contiguous block of triangle data, we ended up with
a contiguous block of *pointers* to each of the points making up the
triangles. This has disastrous performance implications: all the points are
randomly scattered around in memory so the cache utilisation will be really
terrible as it is evident from the results.

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
reader) reveals that they are basically the same, which is no great surprise
as ultimately we're using the same compiler to generate the binaries.

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

To figure this out, we'll need to understand how the Nim compiler works.
First Nim generates a single C file for every module in the project, then from
that point everything gets compiled and linked as if it were a regular
C codebase (which technically it is): C files get compiled into objects files
which then get linked together into the final binary. Inlining functions
across objects files at link time is generally not performed by default by
most compilers, and although gcc and clang can be instructed to do link time
optimisations (LTO) by specifying the `-flto` flag, Nim doesn't use this flag
by default. Therefore, if we want to inline functions across module boundaries
in a robust way---even when LTO is turned off---we need to explicitly tell the
Nim compiler about it with the `{.inline.}` pragma. This pragma will force the
inlining of the functions decorated with it into all generated C files where
the functions are referenced on the Nim compiler (preprocessor) level.

### 5. Nim --- vector module (with inlines)

Fixing this is very easy; as explained above, we'll just need to [decorate
every
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

At this point I was really curious how some other languages I use
regularly would stack up against our current benchmarks kings (look, there's
even a crown in the [Nim logo](https://nim-lang.org/), surely that can't be
just a coincidence!). I didn't try to do any nasty tricks to increase
performance in any of these tests (e.g. using simple arrays of primitives
instead of objects in Java); I just did a straightforward idiomatic port in
each case (you can check out the code [here](https://github.com/johnnovak/raytriangle-test)). Let's see the final results:

<figure style="width: 100%">

<table>
  <tr>
    <th>Language</th>
    <th>Version</th>
    <th style="text-align: center">Mtests/s</th>
    <th style="text-align: center">Rel. performance</th>
    <th style="text-align: center">Total time (s)</th>
  </tr>
  <tr style="font-weight: bold">
    <td>C++</td>
    <td>Apple LLVM 7.3.0</td>
    <td style="text-align: center">51.9</td>
    <td style="text-align: center">1.00x</td>
    <td style="text-align: center">1.93</td>
  </tr>
  <tr style="font-weight: bold">
    <td>Nim</td>
    <td>0.16.1</td>
    <td style="text-align: center">51.1</td>
    <td style="text-align: center">0.98x</td>
    <td style="text-align: center">1.96</td>
  </tr>
  <tr>
    <td>Java</td>
    <td>Oracle JVM 1.8.0_112-b16</td>
    <td style="text-align: center">31.3</td>
    <td style="text-align: center">0.60x</td>
    <td style="text-align: center">3.20</td>
  </tr>
  <tr>
    <td>JavaScript</td>
    <td>NodeJS 4.4.7</td>
    <td style="text-align: center">29.2</td>
    <td style="text-align: center">0.56x</td>
    <td style="text-align: center">3.43</td>
  </tr>
  <tr>
    <td>PyPy</td>
    <td>2.7.13</td>
    <td style="text-align: center">10.5</td>
    <td style="text-align: center">0.20x</td>
    <td style="text-align: center">9.51</td>
  </tr>
  <tr>
    <td>CPython2</td>
    <td>2.7.13</td>
    <td style="text-align: center">0.20</td>
    <td style="text-align: center">0.004x</td>
    <td style="text-align: center">508.68</td>
  </tr>
  <tr>
    <td>CPython3</td>
    <td>3.5.2</td>
    <td style="text-align: center">0.15</td>
    <td style="text-align: center">0.003x</td>
    <td style="text-align: center">673.66</td>
  </tr>
</table>

<figcaption>Table 1 — Performance comparison of different language
implementations of the Möller–Trumbore intersection algorithm executing 100M
ray-triangle intersections.
</figcaption>

</figure>


I was quite disappointed with the Java results at only 60% of the performance
of C++/Nim. JavaScript, on the other hand, did surprise me a lot; it's
basically on par with the performance of Java. I expected much less numerical
performance from JavaScript! Taking into consideration that JavaScript has
only doubles while in Java I was able to switch to floats for a slight
performance bump makes this result even more impressive. Another surprise was
that running the tests as standalone programs with NodeJS or in a browser
(Chrome and Firefox was tested) yielded basically the same results. (Of
course, all this doesn't make JavaScript suddenly a good language, but it's
good to know that at least it's not horribly slow!)

The CPython figures are, however, rather pathetic. I like Python a lot, it's
one of my favourite languages, but it's clearly in no way suited to numerical
computing (note we're talking about the core language here, not
[NumPy](http://www.numpy.org/) and such). Fortunately, PyPy brings the
performance back from absolutely abysmal (0.4% of the speed of the C code) to
quite reasonable for a dynamic interpreted language (20% of the C code).
That's an impressive *~50x speedup (!)* achieved by just switching from
CPython to PyPy!  Interestingly, CPython3 is about 30% slower than CPython2 in
these tests.  I don't know if this a general trend with CPython3's
performance, but it's discouraging, to say the least...

### JIT warmup

There's another thing to note that can confuse rookie benchmarkers and has
implications on runtime performance, namely that JIT compiled languages need
a "warm up" period before they can reach peak performance. In our current
benchmark, that's Java, JavaScript and PyPy (CPython employs no JIT
whatsoever). While the performance of C++ and Nim scale linearly with the size
of the dataset, for JITed languages the performance is roughly a logarithmic
function of the dataset size, as summarised by the below table:

<figure style="width: 75%; margin-left: auto; margin-right: auto;">

<table>
  <tr>
    <th>Language</th>
    <th style="text-align: right"># of tests</th>
    <th style="text-align: right">Mtests/s</th>
    <th style="text-align: center">Rel. performance</th>
  </tr>

  <tr>
    <td rowspan="4">Java</td>
    <td style="text-align: right">100K</td>
    <td style="text-align: right">11.1</td>
    <td style="text-align: center">0.21x</td>
  </tr>
  <tr>
    <td style="text-align: right">1M</td>
    <td style="text-align: right">25.7</td>
    <td style="text-align: center">0.49x</td>
  </tr>
  <tr>
    <td style="text-align: right">10M</td>
    <td style="text-align: right">37.4</td>
    <td style="text-align: center">0.72x</td>
  </tr>
  <tr>
    <td style="text-align: right">100M</td>
    <td style="text-align: right">31.3</td>
    <td style="text-align: center">0.60x</td>
  </tr>

  <tr>
    <td rowspan="4">JavaScript</td>
    <td style="text-align: right">100K</td>
    <td style="text-align: right">9.0</td>
    <td style="text-align: center">0.17x</td>
  </tr>
  <tr>
    <td style="text-align: right">1M</td>
    <td style="text-align: right">20.5</td>
    <td style="text-align: center">0.39x</td>
  </tr>
  <tr>
    <td style="text-align: right">10M</td>
    <td style="text-align: right">29.7</td>
    <td style="text-align: center">0.57x</td>
  </tr>
  <tr>
    <td style="text-align: right">100M</td>
    <td style="text-align: right">29.2</td>
    <td style="text-align: center">0.56x</td>
  </tr>

  <tr>
    <td rowspan="4">PyPy</td>
    <td style="text-align: right">100K</td>
    <td style="text-align: right">1.0</td>
    <td style="text-align: center">0.02x</td>
  </tr>
  <tr>
    <td style="text-align: right">1M</td>
    <td style="text-align: right">3.8</td>
    <td style="text-align: center">0.07x</td>
  </tr>
  <tr>
    <td style="text-align: right">10M</td>
    <td style="text-align: right">9.2</td>
    <td style="text-align: center">0.18x</td>
  </tr>
  <tr>
    <td style="text-align: right">100M</td>
    <td style="text-align: right">10.5</td>
    <td style="text-align: center">0.20x</td>
  </tr>
</table>

<figcaption>Table 2 — JIT warmup characteristics of different runtimes;
relative performance is relative to the performance of the C++
implementation.
</figcaption>

</figure>


## Conclusion

Unsurprisingly, Nim is capable of reaching C/C++ performance when you know
what you're doing. Because there's an extra layer of indirection when using
Nim (Nim source code needs to be translated to C first) and Nim in general is
further from the "metal" than C (in other words, it's more high-level and less
of a portable assembly language like C), one needs to be careful. But the most
important thing to note is that Nim *allows* the programmer to take control
over low-level details such as memory layout when necessary. This is in stark
contrast with other high-level languages such as Java, Python and JavaScript
which do not give the programmer this freedom. Having said that, the
aforementioned languages have fared quite admirably in the benchmarks,
JavaScript being the biggest surprise with a numerical performance on par with
Java.

The greatest lesson for me in this experiment was that with modern compilers
and CPU architectures a naive approach to benchmarking is almost always bound
to fail. For performance critical applications one must establish a suite of
robust automated performance tests and run them periodically as it's very easy
to introduce quite severe performance degradations even with the most innocent
looking refactorings (e.g. think of the inlining problem after we extracted
the vector operations into a module). Without a systematic approach to
performance regression testing, such problems can be quite frustrating and
time consuming to locate and fix (or even just detect, in case on non-trivial
applications!). Also, when benchmarking there's nothing like inspecting the
actual assembly output; that's the only foolproof way to catch the compiler
red-handed at optimising away your test code.

## Does it all matter?

I already hear some people repeating the common wisdom that hardware is cheap,
programmers (and their time) are expensive, and with so much power to spare on
modern CPUs, all this micro-optimisation exercise is just waste of time,
right?  Well, that depends. I tend to agree that performance is not so
critical for lots (maybe even the majority) of programming tasks and in those
cases it makes sense (commercially, at least) to optimise for programmer
productivity by using a high-level language[^nim] . But when speed matters,
you are definitely going to hit a brick wall with a language that doesn't make
low-level optimisations possible.

Let's pretend for a moment that our relative performance results would be
valid for the entire ray-tracer (oversimplification, but not entirely
impossible). Then if it would take 3 hours for the C and Nim implementations
to render a single frame, the Java and JavaScript versions would require
5 hours, the PyPy version 15 hours, and finally the CPython implementations
*over 30 and 40 days (!)* for versions 2 and 3, respectively. Java and
JavaScript seem to be worthy contenders at first---until we start looking into
taking advantage of multiple CPU cores and SIMD instructions. Only Java, C/C++
and Nim have proper multi-threading support, so assuming 4 CPU cores (fairly
typical nowadays) and a very conservative 2x speedup by introducing
multi-threading, the performance gap widens. From our list of languages only
Nim and C/C++ make utilising SIMD instructions possible, so assuming another
2x speed bump thanks to this (again, staying quite conservative), the final
figures would look like this:

<table style="width: 80%">
  <tr>
    <th>Language</th>
    <th>Time to render a single frame</th>
    <th>Relative performance</th>
  </tr>
  <tr>
    <td>Nim / C++</td>
    <td>45 minutes</td>
    <td>1.00x</td>
  </tr>
  <tr>
    <td>Java</td>
    <td>2 hours 30 minutes</td>
    <td>0.30x</td>
  </tr>
  <tr>
    <td>JavaScript</td>
    <td>5 hours</td>
    <td>0.15x</td>
  </tr>
  <tr>
    <td>PyPy</td>
    <td>15 hours</td>
    <td>0.05x</td>
  </tr>
  <tr>
    <td>CPython2</td>
    <td>30 days</td>
    <td>0.001x</td>
  </tr>
  <tr>
    <td>CPython3</td>
    <td>40 days</td>
    <td>0.0008x</td>
  </tr>
</table>

This is actually more in-line with real-life experience; a well-optimised C++
renderer can easily outperform a similarly well-optimised Java implementation
by a factor of 2 to 3, and JavaScript and Python basically don't even have
a chance. As I said, this is not a Python bashing contest, I really like the
language and use it all the time for writing scripts and small tools, but one
needs to have a solid understanding of the limitations of one's tools and
sometime do a reality check... I always find it amusing when people attempt to
"defend" their favourite inefficient high-level languages by saying that
algorithmic optimisations are the most important. Well, of course, no sane
person would agrue with that! But if you took the same optimal algorithm and
implemented it in a language that offered greater low-level control over the
hardware (well, or had multi-threading and SIMD support *at all!*), it is not
unrealistic at all for the performance gain factor to be in the 2 to 1000
range!

As for myself, I will happily continue using Nim, safe in the knowledge that
I won't hit an insurmountable brick wall in the future, because whatever is
possible in C in terms of performance, there's a way to replicate that in Nim
too, and with careful coding the runtime efficiency of both languages can be
virtually identical.


[^nim]: Not that I would consider Nim a low-level language, quite on the contrary! It's as enjoyable and fast to code in Nim as in Python, but with the added benefit of type safety which is not a hassle thanks to Nim's excellent type inference. I think of Nim as a high-level language with the *possibility* of going low-level when necessary, which is exactly what I want from a general purpose programming language.


## Further links of interest

{: .compact}
* [Gwynne Raskind --- Disassembling the Assembly, Part 1](https://www.mikeash.com/pyblog/friday-qa-2011-12-16-disassembling-the-assembly-part-1.html)

* [Gwynne Raskind --- Disassembling the Assembly, Part 2](https://www.mikeash.com/pyblog/friday-qa-2011-12-23-disassembling-the-assembly-part-2.html)

* [Andreas on Coding --- Optimizable Code](https://deplinenoise.wordpress.com/2013/12/28/optimizable-code/)

* [Richard Fabian --- Data-Oriented Design](http://www.dataorienteddesign.com/dodmain/dodmain.html)

* [Compiler Explorer](https://godbolt.org/)


---
layout: post
title:  The Quest for a Programming Language That Doesn't Suck
tags:
---


https://github.com/def-/nimes


A programming language is a means to do something useful on a computer.
The goal of a programming language is to get in the way as little as possible
and help the programmer accomplish its goals as quickly as possible.
the finished pro

Raise your arm and drink a glass of water
DO you think about the individual steps?

It does matter how the tool feels
Syntax matters, the general feel of the language should be fun, malleable,
that encourages experimentation.
Different guitars might make the same sounds 90% but there's a big difference
in how it feels playing them etc

Go use [Brainfuck](https://en.wikipedia.org/wiki/Brainfuck) for a day and
you'll quickly realise what I mean.[^bf]


In real-time systems while speed is obviously important, deterministic
perfomance matters more than absolute raw speed.


[^bf]: Brainfuck is an extremely minimalistic but Turing-complete programming language,
so theoretically any program written in most mainstream programming
languages could be rewritten in it.

According to some sources, C++ has been going through some sort of "renaissaince" lately and apparently some people are even trying to use it as a scripting language.
https://www.reddit.com/r/cpp/comments/369lcn/can_c_become_your_new_scripting_language://www.reddit.com/r/cpp/comments/369lcn/can_c_become_your_new_scripting_language/


https://github.com/dom96/nimkernel

https://github.com/charliesome/rustboot



OOC
https://ooc-lang.org/about/#why-use-ooct 



https://en.wikipedia.org/wiki/Greenspun%27s_tenth_rule


no compromise language the two ends of the spectrum
very high-levels of abstraction, runtime dynamism and code generation
combined with bare metal hardware access when i need it
ideally with the ability to do inline assembly or at least simd intrinsics

fast compilation times and the ability to create statically linked, small native executables

GC with soft-realtime guarantees that can be turned off, plus the option of
having complete control over the memory layout while running the GC in
parallel for other tasks




Example

imagine you have a set of vertexes that you need to perform some
transformations on before you pipe them into the gpu quickly

figurint out what exact transformations to do in what order and what
parameters might be done more conveniently with a very dynamic language
thatthen compiles a list of transform commands at runtime (in the case of
a dynamic language these command could be directly ast that is generated at
runtime)

then your highly optimized transform code (using simd instructions and inline
assembly) does the transformations



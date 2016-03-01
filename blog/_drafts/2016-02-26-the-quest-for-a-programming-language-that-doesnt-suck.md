---
layout: post
title:  The Quest for a Programming Language That Doesn't Suck &ndash; Part 1
tags:
date: 2016-02-28
---

*[Listening to: **Aglaia -- Three Organic Experiences**. Track #3, **Seven
Ancient Glaciers** is a definite stand-out!]*

*Welcome, stranger! This series is a journal that attempts to document my
trials and tribulations as I embark on the impossible journey of finding the
perfect programming language that I can use with great joy on my hobby
projects. An epic quest of unfathomable difficulty, indeed!*

*In this episode: after a somewhat lacklustre introductory meandering on the
merits of the multi-language approach in software development, things get
heated up quite a bit with some good old-fashioned C++ bashing, after which
the hero calms down and finally sets some GOALs. A rare Greek mythological
creature also makes an appearance midway.*


## Performance vs Productivity

A good programmer is a good programmer in any language.  Yet the choice of
language has significant effects on both programmer productivity and the
runtime performance of the resulting software. The "universally accepted
truth" appears to be that these two concepts form a sort of a dichotomy.
Low-level languages allow ultimate control over the hardware, thus yielding
the best possible performance (assuming the programmer knows what he's doing)
and traversing up towards the high-level end of the scale languages gain
progressively more expressive power which results in improved programmer
productivity (more "impact" per lines of code), albeit at the cost of runtime
speed. Programmer and program efficiency are widely believed to be mutually
exclusive goals---you just can't achieve both within the confines of a single
language.

One solution to this problem has traditionally been the two-language approach,
which boils down to combining a highly expressive but slow high-level language
with a primitive but speedy low-level one as an attempt to gain the best
benefits of both worlds. There are generally two ways to go about this: by
**embedding** or **extending**.

### Extending

When extending, the bulk of the program is written in a high-level language
(either interpreted or statically compiled) to get the benefit of higher
programmer productivity and then performance critical parts simply get swapped
out with more efficient lower-level implementations. Thus the high-level
language gets **extended** with special purpose modules or libraries that
handle the performance critical duties.

Certain languages, such as Python, are more suitable for extending than
embedding. Arguably, one of the best mainstream examples for extending Python
is the hugely popular sci-fi space MMORPG game [EVE
Online](https://en.wikipedia.org/wiki/Eve_Online). The EVE client is written
in [Stackless Python](https://en.wikipedia.org/wiki/Stackless_Python) that is
extended with custom coded C++ modules to handle platform-specific graphics,
sound, network I/O and other performance-sensitive tasks.

This method might work fine from a performance optimisation point of view, but
it's not without drawbacks. First of all, there is very likely going to be an
"impedance mismatch" between the two languages, which will necessitate to
devise some sort of bridging mechanism to allow the interchange of data
structures and bi-directional control flow between the two layers. This can
quickly result in lots of glue code and data duplication, especially if the
two languages were not designed to co-operate with each other. Also,
the high-level language might have some quite rigid ideas about how the data
should be laid out in memory that might further complicate the low-level
performance optimisation efforts (e.g. misaligned data, difficulty of
achieving SOA ([Struct of Arrays](https://software.intel.com/en-us/articles/memory-layout-transformations)) layouts for SIMD operations etc.) While it's
certainly possible to speed the program up this way, the time gained by using
a high-level language can be easily amortised by having to build a custom (and
potentially suboptimal) bridging solution and the increased general complexity
of the development workflow.

### Embedding

The second variant is writing a high-performance core in a low-level language
(usually a statically compiled one, such as C or C++) and then **embedding**
a high-level language into the program (usually an interpreted dynamic
scripting language). The core would typically expose its functionality as an
API and the application logic would be implemented in the scripting language
by making calls to the core through this API. In this scenario, the high-level
scripting language is relegated to an orchestrator role. Another related but
slightly different usage pattern for embedding is to
enable the end-user to extend the application via scripts and plugins,
or in the case of games, to allow modding.

[Lua](http://www.lua.org/) is very well suited for embedding; over the years,
it has almost become the de-facto scripting language of choice for C/C++
[applications](https://en.wikipedia.org/wiki/Lua_(programming_language)#Applications),
especially since the advent of [LuaJIT](http://luajit.org/). Due to it's very
small memory footprint and high runtime efficiency, it has gained
a [widespread
adoption](https://en.wikipedia.org/wiki/Category:Lua-scripted_video_games) in
the C/C++ dominated gaming industry over the last two decades, and it has
found it's way into a wide variety of applications and [embedded
systems](http://www.eluaproject.net/) as well, such as high-performance [web
servers](http://nginx.org/) and [in-memory databases](http://redis.io/),
[routers](https://openwrt.org/) and [audio
software](https://www.renoise.com/).

On the desktop application front, the best high-profile commercial example is
undeniably [Adobe Photoshop
Lightroom](https://en.wikipedia.org/wiki/Adobe_Photoshop_Lightroom).  More
than 60% of the Lightroom code was [written in
Lua](http://www.troygaul.com/LrExposedC4.html) (basically the whole UI logic),
C++ was only used for the speed-critical image-manipulation routines and some
platform-specific glue code.

Of course, the downside of this approach is that bulk of the application still
has to be written in C/C++, which leads right into my next topic...

### Life is too short for C++

I can almost hear some people murmuring in the back row at this point: *"But
we already have a language that combines ultimate bare-metal performance
with high-level productivity: it's called C++!"*

Um, no. That couldn't be further from the truth. For a start, read the
preceding section again---if C++ was so awesome at everything, why would
people want to embed high-level scripting languages into their applications?
(Apart from plugin support and giving gameplay scripters a much simpler
language to use, which are some very good reasons, but let's focus on
developer productivity here.)

C++ is a *total disaster* of a language, a bloated and overcomplicated
monstrosity. Its only redeeming quality is its (almost) full
backwards-compatibilty with C. That may sound overly harsh, but look at a few
successful C++
[open-source](http://wiki.scummvm.org/index.php/Coding_Convention)
[projects](http://www.troygaul.com/LrExposedC4.html) and check out some
[blog]()
[posts]() written by AAA console game developers who are forced to use this
abomination on a daily basis, due to reasons outside of their control. You'll
quickly see that the general best practice is just to stick to a very narrow,
restricted subset of the language and stay away from its so-called "high-level
abstractions"--- the existence of which should normally be *the* main reason
for choosing it over C in the first place.

{% include image.html name="hydra_by_ruth_tay.jpg" caption="Contrary to popular belief, C++ was well-known and feared among the ancient Greeks. The hellish abomination was commonly depicted as a fiendish, many-headed water serpent rising from the dark depths of the sea, each head representing a different programming paradigm totally incompatible with the rest of the language. The actual number of fully functional heads varies greatly and depends on the target platform, the compiler vendor, the exact version of the C++ standard being depicted and the favourite food of the chief compiler implementor's pet baby wombat. (Illustration by <a href=\"http://ruth-tay.deviantart.com/\">Ruth Taylor</a>)" %} 

So what happens with C++ on a successful project? The shitty
standard library flies right out of the window (along with other aberrations
like Boost), operator overloading is basically *streng verboten* at the risk
of capital punishment, templates are best left untouched (but only if you want
to preserve your sanity and get a working build out of the miserable compiler
on the same day), so in the end what you're left with is pretty much plain old
C with some extra bells-and-whistles tacked on its back.

> C++; the attempt to create an octopus by nailing extra tentacles to a dog.
> <footer>&mdash; <cite>Anonymous Author</cite></footer>

Let's remember that C is ultimately nothing more than a clever
cross-platform optimizing macro assembler (plus a somewhat usable standard
library). I do like C, it's a nice minimal system-programming language that's almost perfect at
what it aims to do, and I have no problems using it for *low-level work*.
But using it as a high-level language is just a futile exercise in
frustration.

(Let me also quickly add that I have the *utmost respect* for all
C++ coders out there who are able to produce useful software using this
monster of a language, despite all the odds (e.g. most game developers). I am
criticising the *language*, not the people using it. Just to set the record
straight.)


## Um, is this the best we got?

Ok, back on track after this slight C++ bashing detour. The thing is, as long as C++ is still
[alive](http://pypl.github.io/PYPL.html) and
[well](http://www.tiobe.com/index.php/tiobe_index), I think it rightfully
deserves all the bashing it can get. And if you really love it,
congratulations, you're one happy programmer, a content user of one of the
most popular languages in existence on this planet today! That's awesome,
I wish you all the best, have fun and fare well!

Meanwhile, on our side, things are not looking exactly spectacular. It seems
that there's nothing we can possibly do about this rather unfortunate
situation if we want both ultimate programmer productivity and the best
runtime efficiency, right?  This is just the way it is, so we'd better suck it
up and prepare to mount ourselves onto the back of our strange two-language
mule. Being the astute reader of this fine piece of publication that
you certainly are, you must have no doubt figured it out by now that there
*must be a better way...*

## Redefining the GOAL

One day I came across an [interesting post]() on HackerNews about
a most unusual language called [GOAL]() that the game studio [Naughty Dog]()
created for the development of their older PlayStation titles. Now,
**GOAL** stands for **Game Oriented Assembly Lisp**, and as the name implies,
it allowed the programmer to *seamlessly intermix* high-level Lisp code with
down-to-the-metal assembly in the same lexical environment.  Of
course, it also supported all the killer features commonly associated with Lisp, such
as changing the program while it's running, runtime
inspection, macros and all that sort of stuff (check out the [code
example](http://web.archive.org/web/20070127022728/http://lists.midnightryder.com/pipermail/sweng-gamedev-midnightryder.com/2005-August/003804.html)
in this forum post by one of the Naughty Dog devs).

I found this idea extremely cool! A language that integrates the two opposite
extremes of the language abstraction spectrum into a single form! Assembly
code would be written as S-expressions, so it could be generated using macros
or manipulated as data just like Lisp code. No more messing around with
language bridges, it's all a single package

The concept just got stuck in my head and I sort of got obsessed with the
topic. I had been trying to seek out all information I could on GOAL, but
sadly there was not too much to be found on the internet.  The original
sources are now owned by Sony, so it's a safe bet that we'll never get
a chance to take a peek into them. In all likelihood, this was an in-house
language specifically developed for the PlayStation architecture anyway.
Luckily, Andy Gavin, the genius who created GOAL had written up a quite nice
overview on it which is definitely worth reading, and these two articles also
contain some interesting snippets info about the system.

{% include image.html name="goal.jpg" caption="After Sony had acquired the company, the Naughty Dog team was forced abandon Lisp and move to C++. Question: What will become of Lisp code after Sony has bought your company? Answer: A comment." %}

It is also important to note that  GOAL was not just simply a language but
a whole interactive system that allowed rapid prototyping and exploratory
programming, as described in [this
post](https://software.intel.com/en-us/articles/memory-layout-transformations)
by a  veteran Naughty Dog developer.

Well, this all sounds very much like what I would my ideal programming
language to be. So the question is, does such a language exist today
somewhere, silently waiting to be discovered? We'll find it out in the next
part!


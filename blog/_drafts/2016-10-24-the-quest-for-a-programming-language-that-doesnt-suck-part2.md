---
layout: post
title:  The Quest for a Programming Language That Doesn't Suck &ndash; Part 2
tags:
---

## My GOAL

It turns out there are far too many interesting looking languages than I would
have time to evaluate. I need to come up with some criteria to do the initial
culling. So what should my ideal programming language be like?

Fun to use
: This cannot be emphasized enough. All the remaining points are worthless if
the language is not genuinely fun to use.

Minimal, elegant syntax
: Too much syntax puts me off. I want the syntax to stay invisible. The more
it looks like pseudo-code, the better! Python comes very close to that, and
yes, I am a fan of significant whitespace. Lispy syntax is good too. I can't
tolerate funny looking "sigils"---if the code reminds me of bad ASCII art or
raises even the slightest suspicion that it could pass as a syntactically
valid Perl script, I'm not interested.

Clean core language
: Languages that bend over backwards to please everybody usually end up being
a colossal mess. A good language should make up its mind and have firm
opinions on how things should be accomplished. While it's fine to provide
multiple mechanisms to do similar things (to a point), when you have every
programming paradigm ever invented by man (or woman) crammed into in a single
language, I think we have a problem.

High productivity
: The language should have all sorts of high-level building blocks that allow
to experiment with new ideas quickly. A REPL would be good, or at least very
fast compilation times. I'm not the biggest fan of static type systems, so the
more dynamic, the better (although sparingly used type hints are ok). Ideally,
there woudl be a mechanism to muck around with the code while it's running for
rapid iterations.

High performance
: Even if the high-level language facilities are not the quickest, there
should be a way to drop down into low-level mode to do fast numeric stuff
without having to use C via some FFI. There should be some mechanism to handle
concurrency and scale up to all CPU cores without setting your hair on fire.
Bullshit like [GIL](https://en.wikipedia.org/wiki/Global_interpreter_lock) is
not tolerated. Built-in support for SIMD is a big plus.

Self-contained native executable support
: a

Optional garbage collector
: s

Metaprogramming
: s

Open-source & cross-platform
: w


### The Contenders

After much 

*[About two weeks and a few hundred blog posts/articles later...]*

The final list of interesting looking languages was:

> D, Rust, Go, Nim, OOC, cmacro, Vala, Julia, OCaml, Racket, Gambit
  Scheme, CHICKEN Scheme, BONES, PicoLisp, Shen, Clojure, ClojureScript,
  Haxe, Lua, LuaJIT, Terra, Idris, Elixir, Erlang, Io, Ioke, None

...of which my finalists were **Nim**, **LuaJIT**, **Terra**, **Clojure** and **Racket**.

Below is a quick overview of my rationale for picking these exact
lanuages.

#### Nim

The syntax is very clean, very much Python and Pascal inspired with a healthy
dose of Scala thrown in. 

Direct "competitors" were D, Rust and Go, all statically typed system
programming style languages that can produce standalone native executables.
Some short notes about my impressions:

* Go fell out pretty quickly, there's no way to disable the GC and mess around
with the memory directly and the folks at Google seem to want to shoehorn it into
the scripting language box.
* D seemed pretty uninteresting too; it basically aims to be a "corrected"
version of C/C++ but the core language already looks
quite bloated, the garbage collector supposedly sucks and frankly, looking at
some examples just left me completely cold.  Quite obviously, they're aiming
to be a C++ replacement so they're trying to make the switch for C++ people as
seamless as possible. In short, nope.
* Rust seemed to be better, but still a tad overcomplicated and the syntax was
just too verbose for my tastes.  Also, there's no GC and their idea of memory
management just freaks me out (some reference-counting variant).
Still, superficially Rust seemed to be the best contender of the bunch, but
I'm really unsure about the memory management.


#### LuaJIT / Terra



#### Clojure / ClojureScript



#### Scheme

Racket



## Visual debugging

Let me tell you a concrete story that happened during the development of my
tree visualisation tool [twyg](http://www.johnnovak.net/twyg). I was
prototyping an algorithm that was supposed to flow text into
arbitrary convex polygons in [NodeBox
1](https://www.nodebox.net/code/index.php/Home). If you don't happen to know NodeBox, it is
a remarkable visualisation tool quite similar to
[Processing](http://processing.org/) that lets you create 2D images in an
interactive fashion in Python. The basic principle is very simple: you have
a window vertically split in half, on the right is a code editor and on the
left your canvas. In the editor you can write regular Python code
mixed with Nodebox specific drawing commands, which
are essentially a bunch of Python functions defined in a module that's
imported by default. Whenever you press **Cmd+R**, the embedded Python
interpreter executes the code and updates the image on the canvas. This in
itself is a pretty efficient setup so far that allow you to work very quickly.
Just enter some code, hit **Cmd+R** and bamm!---you immeditately see the
results of your code changes.[^cssworkflow]

But wait, it gets much better! You can also "throttle" any numeric value in
your code---just command-click it, start dragging the mouse around and watch
the image on the canvas being updated *in realtime* while you're adjusting the
number in the code window! This deceptively simple little feature proved to be
invaluable during testing the text flowing code. Just grab the `fontsize`,
`lineheight` or whatever other parameter you might have and observe how the
algorithm reacts to the adjustments with instant visual feedback. This is an
extremely powerful technique that helped me squash a number of bugs that would
have been very difficult to anticipate or even discover by chance if I was
using a statically compiled language that enforces a rigid edit-compile-test
way of doing things. It also enabled me to test the code on the "time-axis" as
well, to see how the layout changes when a parameters is being gradually
incremented or decremented (or effectively randomized by wildly jerking the
mouse around---now *that* is what I'd call a proper stress test!).

Solving this problem in Java/C/C++ (or, as a matter of fact, in any other
compiled language) would have taken much longer with more hidden bugs
uncovered. The immediacy and grasping the workings of algorithm on an intuitive
level would not have been possible.








{::options parse_block_html="true" /}
<div class="references">

https://news.ycombinator.com/item?id=6635303


LighTable supports
Clojure, ClojureScript, Javascript, Python, HTML, and CSS

https://www.youtube.com/watch?v=52SVAMM3V78


Interactive programming - Clojure and OpenGL
https://vimeo.com/14709925


https://howistart.org/posts/nim/1


https://en.wikipedia.org/wiki/Self-modifying_code


We just switched from Rust to Nim for a very large proprietary project
https://news.ycombinator.com/item?id=9050114


Remote Agent
http://ti.arc.nasa.gov/tech/asr/planning-and-scheduling/remote-agent/

Lisping at JPL
http://www.flownet.com/gat/jpl-lisp.html





## References

### Memory management

[1] Pedriana, Paul (2007-04-27). [EASTL -- Electronic Arts Standard Template Library
 (Electronic Arts)](http://www.open-std.org/jtc1/sc22/wg21/docs/papers/2007/n2271.html).

[2] [Custom allocators used in game development](https://gamedev.stackexchange.com/questions/25782/custom-allocators-used-in-game-development).

[3] Gaul, Randy (2014-07-30). [Memory
Management](http://www.randygaul.net/2014/07/30/memory-management/)

[4] Kenwright, Ben (2012-01-10). [Fast Efficient Fixed-Sized Memory Pool](https://www.thinkmind.org/download.php?articleid=computation_tools_2012_1_10_80006)

[5] [Memory management in various languages](http://www.memorymanagement.org/mmref/lang.html)

[6] [Why are the game developers still using C++ if it's so awful?](https://hero.handmadedev.org/forum/code-discussion/788-questions-and-answers)

[Unreal Engine / Garbage Collection](https://wiki.unrealengine.com/Garbage_Collection_Overview)

### Game Oriented Assembly Lisp

"99% written in my Scheme dialect GOAL, including all the assembly"
https://news.ycombinator.com/item?id=2475639

Wikipedia (n.d.). [Game Oriented Assembly Lisp](https://en.wikipedia.org/wiki/Game_Oriented_Assembly_Lisp)

[Raising the Paradigm of Video Gaming  AgainThanks to Lisp and Allegro
CL Franz Inc.](http://franz.com/success/customer_apps/animation_graphics/naughtydog.lhtml)

Gregory, Jason. [State-Based Scripting in Uncharted 2 - Amond Thieves](http://www.slideshare.net/naughty_dog/statebased-scripting-in-uncharted-2-among-thieves)

White, Stephen. [Postmortem: Naughty Dog's Jak and Daxter: the Precursor Legacy](http://www.gamasutra.com/view/feature/131394/postmortem_naughty_dogs_jak_and_.php?page=2)

Liebgold, Dan, [Functional MzScheme DSLs in Game Development](https://www.youtube.com/watch?v=Z8Xamkb-J2k). Naughty Dog Inc.

### Python

[Stackless Python in EVE](http://www.slideshare.net/Arbow/stackless-python-in-eve)

[How Lua Brought the Dead to Life](http://www.lua.org/wshop05/Mogul.pdf). [PDF]

### Lua

Wikipedia (n.d.). [Lua-scripted video games](https://en.wikipedia.org/wiki/Category:Lua-scripted_video_games)

### Racket

[John Carmack Scheme VR scripting
language](https://groups.google.com/forum/#!msg/racket-users/RFlh0o6l3Ls/8InN7uz-Mv4J)
[forum post]

Liebgold, Dan (2013). [RacketCon 2013: Dan Liebgold - Racket on the 
Playstation 3? It's Not What you
Think!](https://www.youtube.com/watch?v=oSmqbnhHp1c) [video]

### D

Evans, Manu (2013). [DConf 2013 Day 1 Talk 5: Using D Alongside a Game Engine
by Manu Evans](https://www.youtube.com/watch?v=FKceA691Wcg) [video].

Evans, Manu (2013). [DConf 2013 Day 3 Talk 5: Effective SIMD for Modern Architectures by Manu Evans](https://www.youtube.com/watch?v=q_39RnxtkgM)
[video].

https://con.racket-lang.org/2013/danl-slides.pdf [PDF]

https://news.ycombinator.com/item?id=9813280


### C+

Kreinin, Yossi (2009-10-17). [C++ FQA Lite](http://yosefk.com/c++fqa/index.html).

DEADC0DE (2011-02-26). [Surviving C++](http://c0de517e.blogspot.ca/2011/02/surviving-c.html).

DEADC0DE [Where is my C++ replacement?](http://c0de517e.blogspot.nl/2014/06/where-is-my-c-replacement.html).

Sonmez, John (2012-12-01). [Why C++ Is Not "Back"](http://simpleprogrammer.com/2012/12/01/why-c-is-not-back/).

Zane, Ashby (2011-04). [C Eval Hell yes](http://demonastery.org/2011/04/c-eval-hell-yes/).

Whiting, Jonathan (n.d.). [Games in C](http://jonathanwhiting.com/writing/blog/games_in_c/).

Wikipedia (n.d.). [List of game engines](https://en.wikipedia.org/wiki/List_of_game_engines).

[The Next Mainstream Programming Languages: A Game Developer's Perspective](http://www.cs.princeton.edu/~dpw/popl/06/Tim-POPL.ppt)

<div>


I thought that would be a quite strong title for a first post (well, sans the
obligatory introductory one).


Disclaimer: C++ will get some serious (and in my opinion, well deserved)
bashing here. So if you *really* love C++ and get easily upset by people
expressing negative emotions towards your favourite programming language,
better stop reading now. On the other hand, if you are a discontent C++ user
wondering if there are any better alternatives out there, you might get some
useful info out of this article (I hope so!). Just to make this crystal clear (because
I know this is a sensitive topic for many): when I'm stating that C++ is
a horrible language, I *do not* think that *people* who like (or have to use)
C++ are idiots, nor that *software* written in C++ is crap---not even that
Bjarne Stroustrup is stupid! All my criticism is geared towards C++, the
programming language. 

[^cssworkflow]: This actually a more streamlined version of the classic, time-honored webdesigner workflow, where you're editing the CSS file in your text editor and then Ctrl-Tab + Ctrl-R in quick succession the see the updated results in the browser.



### Language candidates

http://lispyscript.com/tryit/

http://www.idris-lang.org/

http://learnyouanagda.liamoc.net/pages/introduction.html

elixir


https://tessel.io/

https://hacks.mozilla.org/2015/12/bringing-the-power-of-simd-js-to-gl-matrix/

http://hookrace.net/blog/what-is-special-about-nim/

http://www.drdobbs.com/mobile/facebook-adopts-d-language/240162694

http://goran.krampe.se/2014/10/20/i-missed-nim/

http://lambda-the-ultimate.org/node/4749

https://www.quora.com/Of-the-emerging-systems-languages-Rust-D-Go-and-Nim-which-is-the-strongest-language-and-why

Programming language development: the past 5 years
blog.fogus.me/2011/10/18/programming-language-development-the-past-5-years/

http://encode.ru/threads/1881-Nimrod-a-new-quot-better-C-quot-class-language

http://www.drdobbs.com/open-source/nimrod-a-new-systems-programming-languag/240165321

https://togototo.wordpress.com/2013/08/23/benchmarks-round-two-parallel-go-rust-d-scala-and-nimrod/

https://github.com/kostya/benchmarks



PAWN

http://www.compuphase.com/pawn/pawn.htm



SCHEME

http://www.call-cc.org/
http://www-sop.inria.fr/indes/fp/Bigloo/
http://dynamo.iro.umontreal.ca/wiki/index.php/Main_Page

https://code.google.com/archive/p/ypsilon/


The Implementation of Scheme Programming Language for Real-Time Applications
http://www.littlewingpinball.net/mediawiki/index.php/Ypsilon

https://en.wikipedia.org/wiki/GNU_Guile


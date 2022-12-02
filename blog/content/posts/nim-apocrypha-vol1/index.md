---
title: "Nim Apocrypha, Vol. I"
date:  2020-12-21
tags:  [coding, nim]
---

{{< toc >}}


## Intro

Greetings fellow Nim adventurers! Below you will find 16 handy Nim tips
& tricks I came across while developing a medium-sized GUI program this year,
[Gridmonger](https://github.com/johnnovak/gridmonger)
([and](https://github.com/johnnovak/koi)
[related](https://github.com/johnnovak/nim-riff)
[libraries](https://github.com/johnnovak/nim-binstreams)).  Some of them are
about less known or undocumented Nim features or standard library functions,
a few are workarounds for some rough edges of the language, and there's also
a handful of useful techniques I read about in forums or have invented on my
own.

All tips are for Nim 1.4.2 and beyond, and most are applicable to the
C backend. I hope you'll find something useful here that will make your time
with Nim more enjoyable and productive!


## I --- The Not-So-Obvious

### 1 &nbsp; Reducing executable size by stripping debug symbols

Nim touts itself as a language capable of generating small native binaries.
But just naively compiling some program with `nim c -d:release` and looking at
the file sizes will make you wonder about the validity of that claim!

A release build of [Gridmonger](https://github.com/johnnovak/gridmonger)
weighs around 12 megs. Anything but small, if you ask me![^small] Sure, it
statically links [GLFW](https://github.com/johnnovak/nim-glfw) and
[NanoVG](https://github.com/johnnovak/nim-nanovg) and a bunch of other Nim
libraries, but to put things into perspective, [REAPER](https://reaper.fm/) (a
highly-advanced and complex DAW written in C/C++) is about the same size at
~13 megs! Surely, my program is much simpler than REAPER, so what's going on
here?

It turns out that gcc debug symbols are included in Nim binaries by default,
which can account for a quite substantial 2-to 5-fold size increase! Luckily,
we can remove them easily with the `strip` command which comes with gcc.

How about trying to optimise for a small executable with `--opt:size`?  Sure,
that would yield about 30% smaller binaries, but at the expense of some
potential runtime performance loss. So while it might not always be the best
option, but you can always it *and* strip the debug symbols for even bigger
savings.

Finally, if you're hell-bent on producing smallest possible binary,
compressing it with an executable packer like [UPX](https://upx.github.io/)
could be just the ticket.

The below table summarises my findings with some concrete data:

<figure>
  <table>
    <tr>
      <th rowspan="2" style="width: 40%">Compiler flags</th>
      <th rowspan="2" style="width: 15%">File</th>
      <th colspan="2" style="width: 45%; text-align: center">Binary size</th>
    </tr>
    <tr>
      <th style="width: 25%; text-align: right">Bytes</th>
      <th style="width: 20%; text-align: right">Ratio</th>
    </tr>
    <tr>
      <td rowspan="3"><code>-d:release<br/>--gc:arc --deepCopy:on</code></td>
      <td>original</td>
      <td style="text-align: right">12,177,797</td>
      <td style="text-align: right">1.00</td>
    </tr>
    <tr>
      <td>stripped</td>
      <td style="text-align: right">2,269,696</td>
      <td style="text-align: right">0.18</td>
    </tr>
    <tr>
      <td>compressed</td>
      <td style="text-align: right">806,912</td>
      <td style="text-align: right">0.07</td>
    </tr>
    <tr class="sep">
      <td rowspan="3"><code>-d:release --opt:size<br/>--gc:arc --deepCopy:on</code></td>
      <td>original</td>
      <td style="text-align: right">7,959,126</td>
      <td style="text-align: right">1.00</td>
    </tr>
    <tr>
      <td>stripped</td>
      <td style="text-align: right">1,655,296</td>
      <td style="text-align: right">0.21</td>
    </tr>
    <tr>
      <td>compresed</td>
      <td style="text-align: right">623,104</td>
      <td style="text-align: right">0.08</td>
    </tr>
  </table>

  <figcaption>
    Table 1 — Comparison of compiled executable sizes for Gridmonger
    (with and without debug symbols, and without debug symbols and compressed
    with UPX)
  </figcaption>
</figure>

I had repeated the experiment with the following minimal Nim program:

```nim
echo "I'm small!"
```

<figure>
  <table>
    <tr>
      <th rowspan="2" style="width: 40%">Compiler flags</th>
      <th rowspan="2" style="width: 15%">File</th>
      <th colspan="2" style="width: 45%; text-align: center">Binary size</th>
    </tr>
    <tr>
      <th style="width: 25%; text-align: right">Bytes</th>
      <th style="width: 20%; text-align: right">Ratio</th>
    </tr>
    <tr class="sep">
      <td rowspan="3"><code>-d:release</code></td>
      <td>original</td>
      <td style="text-align: right">125,068</td>
      <td style="text-align: right">1.00</td>
    </tr>
    <tr>
      <td>stripped</td>
      <td style="text-align: right">73,728</td>
      <td style="text-align: right">0.59</td>
    </tr>
    <tr>
      <td>compresed</td>
      <td style="text-align: right">31,232</td>
      <td style="text-align: right">0.25</td>
    </tr>
    <tr class="sep">
      <td rowspan="3"><code>-d:release --opt:size</code></td>
      <td>original</td>
      <td style="text-align: right">87,812</td>
      <td style="text-align: right">1.00</td>
    </tr>
    <tr>
      <td>stripped</td>
      <td style="text-align: right">36,352</td>
      <td style="text-align: right">0.41</td>
    </tr>
    <tr>
      <td>compresed</td>
      <td style="text-align: right">18,944</td>
      <td style="text-align: right">0.22</td>
    </tr>
  </table>

  <figcaption>Table 2 — Comparison of compiled executable sizes for a minimal
  Nim program (with and without debug symbols, and without debug symbols and
  compressed with UPX)</figcaption>
</figure>


It is important to note that the presence of debug symbols in a binary *does
not* affect its runtime performance whatsoever. This is because debug symbols
are not even loaded into memory during normal use, only when debugging. So
really it only affects the space the executable takes up on disk.

In case you're wondering, you'll still get nice Nim stack traces with
a stripped binary if you compiled it with `-d:debug` or `--stacktrace=on
--linetrace=on` (more on that in the next tip).

[^small]: Unless if you're one of those NodeJS wielding kids who thinks
  Electron is a good idea and the web is the ultimate application development
  platform... Ignorance is bliss!


### 2 &nbsp; Release builds with exception logging

Creating a release build with `-d:release` gives you a speed boost, but at
the price of turning off stack traces (among other things). This can be a problem
if you're trying to implement a crash-reporting mechanism for end-users,
which involves surrounding your main method with a `try/except` block and
writing exceptions with stack traces to a log file.

Luckily, you don't need to ship debug builds to your users just to be able to
do that; you can still use `-d:release` to get most optimisation benefits
while turning stack traces back on with `--stacktrace=on --linetrace=on`. The
performance of the resulting binary might be a bit slower, but you know, life
is all about the right trade-offs.

### 3 &nbsp; Switching to ARC/ORC

Nim defaults to the `refc` garbage collector (deferred reference counting with
a mark & sweep phase for cycle collection), which works very well, even for
soft-realtime requirements. But did you know that there has been a brand new
GC introduced in 1.2.x that offers reduced memory footprint and even better
performance in most cases?

This is ARC, the fully deterministic Automatic Reference Counting garbage
collector. Switching to ARC is as easy as supplying the `--gc:arc` option to
the compiler. It's a drop-in replacement for most programs. Depending on your
program, you might want to use it with the `--deepcopy:on
--hint[Performance]:off` options.

ARC has many other benefits, including hard realtime support, shared heaps
between threads, and simplifying the C FFI.  Mind you, ARC cannot handle
cyclic data structures. But it has a big brother called ORC, which adds support
for that.

You can learn more about ARC and ORC in this [excellent blog
post](https://nim-lang.org/blog/2020/10/15/introduction-to-arc-orc-in-nim.html)
on the Nim website.

### 4 &nbsp; Executable icons on Windows (MinGW)

Setting the icon for Windows executables is probably easier with Visual
Studio, but anyhow, here are the instructions for gcc/MinGW that I'm using.

1. First, you'll need to generate an `.ico` file that contains your icon image
   in multiple resolutions. There's lots of online tools for that, and there's
   also ImageMagick---this is outside the scope of this article.

2. Once you have your image, you'll need to create a resource definition `.rc`
   file that references your icon file. I used `appicon` here for the ID, but
   you can use any other string, it doesn't matter:

    ```
    appicon ICON "gridmonger.ico"
    ```

3. The next step is to create the resource object file from the `.rc` file
   (`windres` is included in MinGW):

    ```
    windres gridmonger.rc -O coff -o gridmonger.res
    ```

4. Finally, we need to instruct the compiler to link the resource file
   into our program:

    ```nim
    when defined(windows):
      {.link: "icons/gridmonger.res".}
    ```

### 5 &nbsp; Debug echo in Windows GUI programs (MinGW)

This will be a rather short one but it took me a while to figure it out. It
turns out that when you link against the Windows libraries by passing
`-mwindows` to the linker (`-L:-mwindows`), you won't be able to print stuff
the console with `echo` anymore.

"But this is a useless tip, of course you need to link against the Windows
libs in a GUI program!", I hear you say. Well, not necessarily. In GLFW apps,
for example, you can get away with not linking against the Windows libs in
many cases. For instance, in Gridmonger I only need `-mwindows` so I can open
the standard open and save system dialogs. In my debug builds, I don't link
against the Windows libs and I conditionally turn the calls to the dialog
functions to no-ops, and then I can do my debug printing to the console.


## II --- The Hidden

### 6 &nbsp; 'using' keyword

The
[using](https://nim-lang.org/docs/manual.html#statements-and-expressions-using-statement)
keyword is a very useful, but often forgotten language feature. It helps to
cut down on redundancy when creating method call style APIs, or when passing
context objects around.

```nim
# Without `using`
proc getFloor*(l: Level, row, col: Natural, a: var AppContext): Floor = ...
proc setFloor*(l: Level, row, col: Natural, f: Floor, a: var AppContext) = ...

# With `using`
using l: Level
using a: var AppContext

proc getFloor*(l; row, col: Natural; a): Floor = ...
proc setFloor*(l; row, col: Natural, f: Floor; a) = ...
```

### 7 &nbsp; Opening URLs in the default browser

Did you know that the standard library has
a [browsers](https://nim-lang.org/docs/browsers.html) module for the sole
purpose of opening URLs in the OS default browser in a cross-platform way?
In fact, I've been using Nim for 4 years and I've learned about this just
recently!

This is very handy if you want to navigate the user to a program's website
from a desktop app, or to open local HTML documentation.

### 8 &nbsp; Cross-platform home and config directories

Similarly, [getHomeDir()](https://nim-lang.org/docs/os.html#getHomeDir) and
[getConfigDir()](https://nim-lang.org/docs/os.html#getConfigDir) from the
[os](https://nim-lang.org/docs/os.html) module are super handy if you need to
handle configuration files or program data in a cross-platform way.


### 9 &nbsp; Debug dumping expressions

However sophisticated modern development tools might be, just echoing stuff to
the console is still one of the easiest and quickest ways to debug a program.
But writing things like `echo "foo: ", foo` for the hundredth time gets old
really fast. The [dump](https://nim-lang.org/docs/sugar.html#dump.m%2Cuntyped)
macro in the standard [sugar](https://nim-lang.org/docs/sugar.html) module
helps with exactly that.

Make sure to check out the other useful additions the module introduces!

```nim
import sugar

var
  a = 42
  s = "frobnicate"
  x = 7

dump(a)
dump(s)
dump(a + x)

# prints:
# a = 42
# s = frobnicate
# a + x = 49
```

### 10 &nbsp; Measuring elapsed time

Although you can use the regular [times](https://nim-lang.org/docs/times.html)
module to measure elapsed time, to do it properly you really need a monotonic
timer. Such a thing has been added to the standard library recently in the
form of [std/monotimes](https://nim-lang.org/docs/monotimes.html).

```nim
import os
import std/monotimes
import times

proc durationToFloatMillis*(d: Duration): float64 =
  inNanoseconds(d).float64 * 1e-6

let t0 = getMonoTime()
sleep(10) # do something for a while
let d = getMonoTime() - t0

echo durationToFloatMillis(d)
```

### 11 &nbsp; Dealing with openarrays

[Openarrays](https://nim-lang.org/docs/manual.html#types-open-arrays)
are a handy Nim feature that allow you to write procedures that can accept
either arrays or sequences through a unified `openArray` type. What the
manual forgets to tell you though is that there's a bunch of overloaded 
[toOpenArray](https://nim-lang.org/docs/system.html#toOpenArray%2Cptr.UncheckedArray%5BT%5D%2Cint%2Cint)
and
[toOpenArrayByte](https://nim-lang.org/docs/system.html#toOpenArrayByte%2Ccstring%2Cint%2Cint)
methods in the [system](https://nim-lang.org/docs/system.html) module to help
create openarray "slices" from arrays, seqs, strings and (surprise!) other
openarrays.

One particularly useful function is [this
one](https://nim-lang.org/docs/system.html#toOpenArray%2Cptr.UncheckedArray%5BT%5D%2Cint%2Cint)
that operates on
[UncheckedArray](https://nim-lang.org/docs/system.html#toOpenArray%2Cptr.UncheckedArray%5BT%5D%2Cint%2Cint)s---this
is very useful for treating blocks of memory from C libraries as
openarrays in your Nim code.

Speaking of the system module, it's full of useful stuff that's not mentioned
anywhere in the documentation. Make sure to go through the function list once
in a while, I'll guarantee you'll find something of interest every time.


## III --- The Crafty

### 12 &nbsp; Easy pointer manipulations

Sometimes you must resort to C-style pointer arithmetics (especially when
interfacing with C libraries and data structures), and the type-safe nature of
Nim doesn't exactly make that easy. The following templates make such tasks
a lot easier (of course, many other variants could be introduced; that's an
exercise for the reader).

```nim
template `++`[A](a: ptr A, offset: int): ptr A =
  cast[ptr A](cast[int](a) + offset)

template `--`[A](a, b: ptr A): int =
  cast[int](a) - cast[int](b)
```


### 13 &nbsp; Taming circular type dependencies

One of Nim's Achilles' heels is the relative inflexibility of the module
system when dealing with circular type dependencies. In a project of
sufficient complexity, where you break up your code into multiple submodules,
you'll hit this issue sooner or later almost invariably. [Long story
short](/2017/06/18/ao-resists-the-forces-of-darkness-pbrt-meets-nim/#circular-type-dependencies),
the best workaround is to create a `common` module early on that
contains all such circular type definitions. Then you can just include this
common module in all other submodules.

The biggest drawback of this approach is that everything defined in common
must be public. But hey, who told you that there's anything perfect in this
world?


### 14 &nbsp; 'with' macro

The tiny [with](https://github.com/zevv/with) macro is super useful for
reducing redundancy by lifting parts of an object or tuple into the
current scope. Probably easier to show than to explain:


```nim
import with

type
  Widget = object
    backgroundColor: string
    foregroundColor: string

  Window = object
    title: string
    inputField: Widget

# Without `with`
var mainWindow = Window()
mainWindow.inputField.backgroundColor = "black"
mainWindow.inputField.foregroundColor = "red"

# Using `with`
with mainWindow.inputField:
  backgroundColor = "black"
  foregroundColor = "red"

# You can nest it too!
with mainWindow:
  title = "Qux"
  with inputField:
    backgroundColor = "black"
    foregroundColor = "red"
```


### 15 &nbsp; Aliases

Even when armed with the above macro, often there's a need to set up some
aliases (references) to some parts of a nested object hierarchy to improve
readability. This comes up quite often in real-world application and UI
programming.  Consider the following:

```nim
var g_app: AppContext

g_app.doc.map.levels[g_app.doc.currLevel].setFloor(row, col, fEmpty)
```

Now imagine that most of the program basically operates on this app context in
some way or another. It all becomes horribly redundant and unreadable pretty
quickly. And you can't set up C++ style references because of Nim's copy
semantics (unless you keep using `ref object`s everywhere, which is not always
the best choice).

Alias template to the rescue! 

```nim
template alias*(newName: untyped, call: untyped) =
  template newName(): untyped = call

alias(doc, g_app.doc)
alias(map, doc.map)

map.levels[doc.currLevel].setFloor(row, col, fEmpty)
```

That's much more readable! (Of course, normally you would use those aliases
more than just once or twice like in this simple example.)

Another option for introducing proper C++ style references is the recently
added (and totally undocumented)
[byaddr](https://nim-lang.org/docs/decls.html#byaddr.t%2C%2C%2C) pragma:

```nim
import std/decls

var a = 5
var b {.byaddr.} = a

b = 3
echo a  # prints 3
```



## IV --- The Grand Finale

### 16 &nbsp; Saving memory by object field reordering

You should save the best for last, or so they say. Well, this one is about
saving memory, big time! More experienced C/C++ programmers can go home now as
they should know all about this already---the rest of the class stays.

#### The Enigma

Let's say we have an object in our program to hold the properties of
a cell of a large(ish) grid/matrix:

```nim
type Cell* = object
  b: byte
```

Being the sort of resource conscious developers we are, we are dutifully
keeping an eye on our total memory footprint:

```nim
echo sizeof(Cell)  # prints 1

var a: array[500 * 500, Cell]
echo sizeof(a)     # prints 250000
```

Nothing surprising here. Let's add an enum to the mix:

```nim
type
  Direction = enum
    East, West, North, South

type Cell* = object
  b: byte
  d: Direction
 
echo sizeof(Cell)  # prints 2

var a: array[500 * 500, Cell]
echo sizeof(a)     # prints 500000
```

Still completely uninteresting. Enums are represented by the smallest possible
integer type, hence our enum is 1 byte long, which doubles our total memory
requirements.

Okay, time to be a bit more adventurous! We'll insert a string between the
byte and the enum:

```nim
type Cell* = object
  b: byte
  s: string
  d: Direction
```

A Nim string is just a pointer to a sequence of characters, which means we're
expecting our object to grow by `sizeof(string) == sizeof(pointer) == 8` bytes
(on 64-bit). Right?  Right???!! I expect people who had been socialised on
nice, cushy high-level languages to vehemently agree with me at this point.

So, again, `sizeof(Cell)` will be 10 now, correct?

Yes?

![LOL THIS GUY](img/lol-this-guy.webp)

Let's see if the machine agrees with us:

```nim
echo sizeof(Cell)  # prints 24
echo sizeof(a)     # prints 6000000
```

**WAT???!!!!11** That's **2.4x the size** of what we expected!

![Woman spitting out coffee](img/spit.webp)


Not exactly the answer we wanted, is it? In good old time-tested coder
tradition, let's start changing shit randomly in the hope of improving the
situation somewhat!


```nim
type Cell* = object
  s: string
  b: byte
  d: Direction

echo sizeof(Cell)  # prints 16
echo sizeof(a)     # prints 400000
```

Um, we just reduced our total memory footprint by 1/3 by putting the
string first. WTF is going on here?


#### The Explanation

Nim objects compile down to C structs (with the C backend), which are governed
by strictly defined ordering and memory alignment requirements in the
standard. The exact story varies a bit on each CPU architecture, but on
x86/x64 the following main rules hold true:

- Data types must be aligned according to their bit-width for optimal access.
  So 64-bit values must be aligned on 8-byte boundaries (addresses evenly
  divisible by 8), 32-bit values on
  4-byte boundaries, and so on.

- Structs must be padded at the end so when they're placed in contiguous
  arrays, all their members are aligned optimally as per the above. In
  practical terms this means that the total size of the struct is padded
  to the nearest integer multiple of the widest data type it contains.

- The compiler is not allowed to reorder struct fields under any circumstance
  (to optimise padding or for any other reason), the reason being that this
  would break a lot of low-level code.

- Unaligned access is supported on x86/x64 (meaning it won't crash the
  program), but at a significant performance penalty.

Another important piece of background information is that C99 stipulates that
blocks of memory allocated with `malloc` must be correctly aligned for any
data type supported by the implementation. Hence, padding is never required
before the first element of a struct. In practice, you can assume the
allocated memory blocks are always 8-byte aligned on x86, and 16-bit aligned
on x64, regardless of the OS.

So, armed with this arcane knowledge, it's not too hard to figure out what's
going on:

```nim
# worst case (string in the middle) - 24 bytes with padding
type Cell* = object
  b: byte         # 1 byte + 7 pad bytes
  s: string       # 8 bytes (8-byte aligned)
  d: Direction    # 1 byte + 7 pad bytes (to ensure that the next array
                  # element is 8-byte aligned)

# better (string at start) - 16 bytes with padding
type Cell* = object
  s: string       # 8 bytes (8-byte aligned because of malloc)
  b: byte         # 1 byte
  d: Direction    # 1 byte + 6 pad bytes (to ensure that the next array
                  # element is 8-byte aligned)
```

One interesting consequence of the padding requirements is that we might as
well store something useful in those otherwise unused padding bytes (as long
as we're careful not to overshoot):

```nim
type Cell* = object
  s: string       # 8 bytes
  b: byte         # 1 byte
  d: Direction    # 1 byte
  x: int16        # 2 bytes (offset 10, 2-byte aligned)
  y: int32        # 4 bytes (offset 12, 4-byte aligned)

echo sizeof(Cell)  # still 16 bytes!
```

Then there's the [packed
pragma](https://nim-lang.org/docs/manual.html#foreign-function-interface-packed-pragma)
too that you can apply to objects to effectively disable padding, but this
should be restricted to low-level code or situations where you must interface
with C libraries because it doesn't work that well with GC'd memory (the
manual explains why this is so).

This is definitely a very interesting subject, check out the following
articles if you would like to explore it further:

* [The Lost Art of Structure Packing](http://www.catb.org/esr/structure-packing/)
* [The Nim memory model](https://zevv.nl/nim-memory/)
* [Data structure alignment](https://en.wikipedia.org/wiki/Data_structure_alignment)
{class="compact"}


## Outro

So long folks, hope you found something interesting here. Wash your hands,
wear face masks, don't drink and drive during the festive season, and keep
Nimming! (Is that even a word? I guess it is now...)


---
layout: post
title:  "Cross-platform GUI Toolkit Trainwreck, 2016 Edition"
tags: [coding, gui, imgui]
published: false
---

{: .intro}
Ok, I'm not too sure in what direction this post will go, an informative
article, a rant, or both. Probably a bit of both, with an emphasis on the rant
part, given my current not-quite-positive emotional involvement with the
topic. Gentlemen (and gentlewomen), please fasten your seatbelts!

## Buttons and pixels

In 2016, developing a program in entirety on one particular platform, for
example OS X, and then succesfully compiling and running it on another, say
Windows, with zero or minimal modifications required, is no longer an
utopistic dream. In fact, users of dynamic, interpreted or scripting languages
(however you like to call them today) have been enjoying the luxuries of easy
cross-platform development for many decades now so they won't even raise an
eyebrow on such trivial matters. But even the lowly C and C++ plebs are able
to perform this feat with relative ease nowadays---at least if they sticked to
their respective language standards religiously and turned their compiler
warnings up to nuclear-strength...

Being able to use a single codebase for multi-platform applications is an
important thing. After all, who wants to maintain two or three (or more)
mostly similar but not quite applications? I sure don't. And then there's the
convenience and flexibility factor too: you can happily develop on your Debian
VM on your desktop PC at home, then maybe fix some bugs on your MacBook while
sitting on the train, with the confidence that your program will work
flawlessly on Windows too. Not having to deal with platform differences and
idiosyncracies takes off a huge burden of a developer's shoulders that is not
to be underestimated.

Some compiled languages like Nim give you such cross-platform guarantees by
design. This is all good, this is all well, this is precisely how things
should be. The world is such a wonderful place, after all. Write once, run
anywhere (and don't go near the JVM). Excellent! The universe is smiling at
you. Infinity co creates karmic balance. Freedom unfolds into intrinsic
actions. Your consciousness manifests through quantum reality. [^bullshit]

[^bullshit]: The last three new age wisdoms courtesy of the [Wisdom of Chopra](http://wisdomofchopra.com/) bullshit generator.

Except for one litle thing. You must not under any circumstance try to open
a window, attempt to change the color of a single pixel in it, or---god
forbid!---fantasise about using native (or any kind of, for the matter) GUI
controls in a cross-platform (and non-hair loss inducing) manner! If you
disregarded my sage advice and foolishly ventured to accomplish any of the
above tasks, the bliss would be over in an instant and you'd find yourself
rudely transported back to the early days of computing where making anything
just simply work at all on different OSes would take inordinate amounts of
time and effort.


## Solution to a problem

I'm not just talking in the abstract here, I am merely describing my trials
and tribulations when attempting to extend my ray tracer I'm developing in Nim
with a very minimalistic GUI. My ambitions were fairly modest: I only wanted
to open a window and then split it into a canvas and a control area.  Onto the
canvas I would just blit some pixel data periodically and the control area
would contain some buttons and some static text (maybe a progress bar too if
I felt particularly bold and adventurous). I wanted this to work on Windows,
Linux and OS X without having to write any platform specific code. And that's
it!

So next step, let's investigate what cross-platform libraries are available
for Nim.  I was looking for something really minimal and I would have
perfectly been happy with native controls, so the Nim bindings to the IUP GUI
library--a cross-platform toolkit in C for creating GUI applications in
Lua--looked very promising... until I found out that it does not support OS
X at all. Oh well.

The next obvious candidate was the GTK2 bindings for Nim. I am not a fan of
GTK on Windows at all and especially not on OS X (despite the fact that
I really love Inkscape on Windows, but let's just write that off as an
anomaly).  Anyway, why not give it shot, it doesn't cost any money after all.
Well, after having spent about half an hour foraging for the GTK2 Windows
binaries on the Internet (because the official GTK+ Project website is of not
much help at all in that regard, apart from some kinda vague instructions on
where to try to find them), the poor directory containing my ~300K executable
got suddenly about 20 megabytes bigger in the form of the cheerful company of
10+ DLL files. The thing surely worked just fine (to the extent that GTK2 is
capable of doing so), but this is a very bad start already as I wanted
something small that can be statically linked. Adding a 20 MB fat to my cute
little 300K renderer is an idea that I find quite obscene to be honest (as in
obscenely obese), so in short, no thanks. Executive summary: GTK2 + non-Linux
platform = avoid.

Some people might want to point out now that I'm way too picky, this is merely
a solution to a problem, it works, so I should just suck it up and live with
the over 60-fold increase of my total binary size. Well this is a solution to
a problem too:

{% include image.html name="headphones.jpg" caption="Warning: putting up with lots external dependency crap just to make things work somehow is a straight road to this to happen to you!" width="72%" %}

And with that move I had practically exhausted all the readily available GUI
options for Nim. (Note that this is not a rant against Nim at all;
I absolutely love that language, (in fact, it's my favourite language at the
moment), and it's not Nim's fault that most--if not all--cross platform GUI
toolkits suck in one way or another (having been written in C++ is one major
source of such suckage)). [^lisp]

[^lisp]: Note the nested parenthesis---a true telltale sign of my latent LISP tendencies!

At this point the needle of my stress-o-meter was already hovering in the
orange zone. Luckily enough, I then found something interesting...


## IMGUI to the rescue

I haven not heard about immediate mode graphical UIs (IMGUI) before, so in my
initial excitement I tought this could be the answer to all my woes. For
anyone not familiar with the concept, the general idea is that with an IMGUI
the UI does not live in memory and manage it's own state as it is the case
with traditional retained mode GUIs (RMGUI), but it gets "recreated" and
redrawn on the fly on every frame at 60 FPS (or whatever your framerate is).
From an implementation perspective, an IMGUI essentially boils down to one
function per widget type, where that single function performs all duties
related to the correct functioning of that particular widget (event handling,
drawing, reporting the current state, etc.) The construction of an IMGUI based
UI thus becomes a series of simple procedure call which makes it an attractive
option from a simplicity and iteration speed standpoint. Also, because the
whole interface gets fully redrawn on every frame, there's no messing with
dirty regions at all, just redraw the whole thing intoto a buffer, overlay it
on the top of the current frame and the job's done. Easy!

It turns out while such an approach makes a lot of sense for a game that needs
to redraw the whole screen at a constant framerate anyway, it's not that great
choice for a traditional desktop applications where such frequent redraws
would be too wasteful.

(At least, that was my simplistic understanding of the whole IMGUI concept,
which is not quite true, but I'll just leave it here because by judging some
threads on the topic most people seem to misinterpret the concept in a very
similar fashion to myself. What I described above is one particular IMGUI
implementation that is very well suited to applications that redraw the screen
at a constant rate using accelerated graphics (read, games). But the actual
definition of an IMGUI is much simpler: the UI is just a function of the
current application state, the application should not be responsible for . There's nothing preventing you from only redrawing
when necessary in response to some user events. The forum thread is very
enlightening TODO, so please read the linked materials in the suggested
reading section if you're interested.)

### Enter (then quickly exit) NanoVG

Ok, so my idea was to build a simple IMGUI user interface myself using the
[NanoVG](https://github.com/memononen/nanovg) 2D vector graphics library.
NanoVG uses OpenGL as its rendering backend, so the plan was to use it in
conjunction with GLFW to shield me from any platform specific drawing and
window handling stuff. That part actually worked out quite nicely; after a few
days of hacking I had a window showing a bitmap image that's constantly
updated from the internal render framebuffer and some GUI elements laid on top
of it with transparency and whatnot.

So far so good, cross-platform custom GUI proof-of-concept, tick, but
I suddenly found myself facing two new problems:

  * The constant redrawing of the whole UI on every frame was burning up about
10-15% CPU on my Intel Core i7 4790 4.0 GHz (8 logical cores). That means
1 core out of the total 8 was running at almost 100% all the time!

  * The text rendering quality of NanoVG made me really depressed.

The first problem is easy to fix. The abysmal performance has nothing to do
with NanoVG or OpenGL, it's just because of the constant 60fps redrawing. The
solution was to redraw only when needed: as a quick hack I introduced a global
boolean `doRedraw` and set it to true only when an input event was received or
the internal application state has changed (e.g. the framebuffer has been
updated). Then the drawing would only happen when `doRedraw` is set to true.
Surely this can be done in a nicer way, but the concept is the same.

The second issue with the text rendering is a harder nut to crack. NanoVG uses
the tiny
[stb_truetype](https://github.com/nothings/stb/blob/master/stb_truetype.h)
single-header C font rasterizer to create the font atlases used for text
output. This is all well, but the quality of sbt_truetype at small font sizes
is not that great at all (not great enough the annoy the hell out of me). Now,
NanoVG seems to have optional support FreeType, but even if that works, it
only has quite rudimentary support for handling text layouts (which is quite
buggy, by the way). I really have zero inclination to neither start hacking
the C code, nor come up with my own font layout engine... I know there's stuff
like Pango and HarfBuzz, but I really don't want to [do a Donald E.
Knuth](https://signalvnoise.com/posts/3183-the-art-of-computer-typography)
here and spend too much time on a problem that has already been solved on the
OS graphics library level. I just want to call `drawText()` and be done with
it!

My subjective mental state at this point could be visualised pretty much spot
on as follows:

{% include image.html name="fail.jpg" caption="FAIL" captionAlign="center" width="80%" %}

## State of the art

Ok, after putting the problem aside for a few days in order to calm down,
I realised that the best way to go about this is to take a few quality
cross-platform applications that I know well and analyse how they solved the
custom GUI problem.

I have included a mini-breakdown for each app on the sizes of their various
components (e.g. main executable, libraries, additional resources etc.), in an
attempt to get a feel for what is considered acceptable in 2016. I have used
the 64-bit Windows versions except where noted otherwise.

### REAPER

{: .properties}
Version|5.12
Main executable|11 MiB
Resources|23 MiB
Plugins|30 MiB
Total install size|68 MiB

[REAPER](http://www.reaper.fm/) is a highly advanced cross-platform digital
audio production workstation (DAW) for Windows and Mac OS X originally
developed by the same guy who wrote the original WinAmp. REAPER is written in
C++ and it uses the open-source [WDL](http://www.cockos.com/wdl/) library
(from the same developer) for cross-platform graphics, audio and UI tasks.

It is a very much no-bullshit app, just look at the 11 MiB executable size! By
examining the WDL sources it becomes pretty clear that it uses a mixture of
native software rendering (GDI on Windows, because it still supports XP) and
an anti-aliased software rasterizer for some tasks. The GUI is skinnable but
non-scalable because the skins are completely bitmap based, so a good
proportion of the GUI drawing consists of blitting operations, presumably.
There are some font rendering differences between the OS X and Windows
versions, so it clearly uses OS native text rendering under the hood. The menu
bar and all dialog windows (e.g. file dialogs, preferences) are OS-native.

It is evident that REAPER's strategy in terms of the UI is to use as much OS
provided functionality as possible and resort to custom code only when
necessary.

{% include image.html name="reaper.png" caption="This is REAPER 5 in fullscreen mode. Note the standard Windows menu bar on top. By the way, that nice looking skin (well, I think it's nice) was designed by yours truly (unreleased to the public yet)." width="100%" %}

### Renoise

{: .properties}
Version|3.1.0|
Executable| 26 MiB
DLL files|1.3 MiB
Resources|19 MiB
Library (presets, samples)|131 MiB
Total install size|195 MiB

[Renoise](https://www.renoise.com/) is probably the best cross-platform modern
tracker in existence today. It runs on Windows, OS X and Linux and it has
a completely custom single-window UI. Everything is custom drawn, including
the menus, dialogs, the file browser and so on. The graphics backend uses
DirectX on Windows, OpenGL on OS X and presumably X directly on Linux. The UI is non-scalable and non-skinnable,
the fonts are bitmap based (I think) and most of the drawing seems to be
simple blitting. They also must have developed some custom drawing routines
for anti-aliased cross-platform graphics of the dynamic UI elements (e.g. the
waveform and envelope displays)

Renoise is closed source, so unfortunately we cannot inspect how they did all
this, but very likely they had to come up with their own UI and graphics
wrappers to maintain a single codebase for all three platforms.

{% include image.html name="renoise.png" caption="Renoise 3 in fullscreen. Everything is custom drawn, such as the menu bar and the preferences dialog in the middle of the screen. Again, that theme was done by me, hope you like it." width="100%" %}

### Tracktion

{: .properties}
Version|7.1.1
Main executable|57 MiB
DLL files|2.3 MiB
Total install size|60 MiB

[Tracktion](https://www.tracktion.com/) is another cross-platform DAW
targeting the Windows, Mac OS X and Linux platforms. The single-window GUI is
fully custom drawn, just like in Renoise, but what sets it apart from it is
that the drawing here is much more dynamic: instead of having mostly
fixed-size UI elements, all widgets in Tracktion shrink and enlarge as their
respective containers change in size.

Tracktion is written in C++ and it uses the
[JUCE](https://github.com/julianstorer/JUCE) library for all cross-platform
duties (again, written by the same single person responsible for all Tracktion
development). JUCE supports anti-aliased vector graphics and text output
through a number of wrapper classes that can use either JUCE's internal
software rasterizer or platform specific graphics APIs as their backends.
There's support for the usual suspects, e.g. Direct2D and DirectWrite on
Windows and CoreGraphics on OS X. All platform-specific event and window
handling is abstracted away in a similar fashion.

The JUCE library is available for free for open-source projects, but
a commercial license will make the wallets of enterprising developers exactly
$999 lighter.

{% include image.html name="tracktion7.jpg" caption="Tracktion 7 in it's fully anti-aliased single-window glory. Previous versions might have looked somewhat less sleek, but the UI was designed to be highly scaleable right from the very first release." width="100%" %}

{% include image.html name="tracktion7-small.jpg" caption="Still Tracktion 7, but now on a smaller screen. Contrast this screenshot with the one above: all common UI elements are still there but their sizes are vastly different. Tracktion has the most adaptable dynamic interface of all applications presented in this article, thanks to JUCE's extensive anti-aliased vector graphics support. " width="100%" %}

### Blender

[Blender](https://www.blender.org/) doesn't need much introduction, being the
most well-known open-source 3D package for Windows, OS X and Linux. On the UI
front it uses a completely different approach to all the previous examples:
the contents of the whole window, including the render view and the user
interface, are drawn using pure OpenGL. There's no fallback to any
other rendering backends---Blender simply doesn't run on systems without OpenGL
support.

This makes certain interesting things possible, such as semi-transparent user
interface elements overlaid on top of OpenGL views, as shown on the screenshot
below.  The UI is scaleable and quite dynamic, and it's also worth noting that
it's fully defined in the form of Python scripts (hence the bundled Python
interpreter).

Displaying text elements is accomplished via glyphs pre-rendered into
[texture atlases](https://en.wikipedia.org/wiki/Texture_atlas) with
[FreeType](https://www.freetype.org/) (possibly a modified version). One of
the biggest weaknesses of OpenGL based UI drawing is the difficulty of
rendering crisp and clear looking anti-aliased text, as evidenced by [these
notes](https://wiki.blender.org/index.php/Dev:Source/Text/Rendering) from the
Blender developer wiki.

In theory, it would be possible to re-use Blender's cross-platform UI layer
written in C in other applications, but because its tight coupling to
Blender's internals, no one has been able to do so yet in practice.

{: .properties}
Version| 2.77
Main executable|94 MiB
DLL files|29 MiB
Python|53 MiB
Data|49 MiB
Scripts|34 MB
Total install size|305 MiB

{% include image.html name="blender.jpg" caption="Blender's OpenGL-based interface is quite sleek and modern looking. Notice the semi-transparent widgets on top of the 3D views." width="100%" %}

### Cinema 4D

I cannot provide any detailed info on Cinema 4D because I'm not using it
personally (and I couldn't bring myself to download the 3 GB demo installer
just to check the filesizes...) It's still worthwhile to include it in this
discussion because a) the UI looks good, b) most other commercial 3D packages
follow a very similar approach.

We can deduce a lot from the screenshot included below. First, note the image
dimensions: 2880-by-1714. The display resolution of a 15" 2015 Retina MacBook
Pro is 2880-by-1800, so this is a screenshot of the Mac version. Also note
that at 1:1 magnification the text and the large icons are very crisp looking,
but the rest of the UI, including the render view, is made up of double-sized
(2x2) pixels. This suggests that they're using native text rendering, taking
advantage of high-resolution displays whenever possible, but the rest of the
UI probably consists of simple bitmaps only.  Having a look at some random
Windows screenshots further validates this assumption; on those images the
text looks very much like a standard 9px Tahoma rendered with ClearType.

It looks like similarly to REAPER, Cinema 4D uses native graphics and text
rendering to draw its UI, probably via some custom wrapper libraries.

{% include image.html name="cinema4d.png" caption="Cinema 4D on a Retina display MacBook Pro. Note that the fonts and the big icons are drawn at actual pixel resolution, while the rest of the UI is rendered at 2x2. " width="100%" %}

### NodeBox3

{: .properties}
Version|3.0.44
Main executable (JAR)|22 MiB
Libraries (ffmpeg)|12 MiB
Java runtime|172 MiB
Python interpreter|4.4 MiB
Examples|8.3 MiB
Total install size|220 MiB

[NodeBox3](https://www.nodebox.net/node/) is a quite interesting node-based
generative graphics tool that runs on Windows, Mac OS X and Linux. Contrary to
all previously discussed applications, NodeBox is not a native executable
written in C++ but a Java program. The UI is probably built with the help of
Swing (that's the standard Java GUI library) plus a custom look and feel
(that how they call a skin in Swing-land).

Relying on the cross-platform Java runtime is certainly very convenient from
the developers' perspective, but is not without some serious drawbacks. First
of all, the whole Java runtime environment has to be bundled with the
application (at least on Windows and OS X), which accounts to a whopping 172
MiB in this concrete example (that's 78% of the total install size!).
Interface redraws are much more sluggish compared to native applications like
REAPER and Renoise, startup times are generally slow and Java applications
overall tend to be memory hogs. All these things are mostly non-issues for
long-running server-side applications (the most natural habitat of Java
bytecode), but they make the platform a less than ideal choice for
high-performance desktop applications.

In conclusion, while Java is certainly not the  most terrible choice for
a cross-platform GUI application, it's far from being the greatest either. For
some less demanding software (such as NodeBox) it may be an OK solution, but
I'm really averse to the idea of DAW written in Java, where every little bit
of performance counts...

{% include image.html name="nodebox.png" caption="NodeBox3 has a pleasant looking GUI built using Swing (most likely) that looks almost identical on all supported platforms." width="100%" %}

### Light Table

{: .properties}
Version|0.8.1
Main executable|51 MiB
Electronf framework|42 MiB
Resources|33 MiB
Total install size|129 MiB

> [Light Table](http://lighttable.com/) is a next generation code editor that
connects you to your creation with instant feedback.

I borrowed this sentence from the project's [GitHub
page](https://github.com/LightTable/LightTable) because I find it a very cool
and succint description of this novel IDE. Light Table is available for
Windows, Mac OS X and (can you guess?) Linux; it achieves cross-platform
compatibility by leveraging the [Electron](http://electron.atom.io/)
framework. In basic terms, Electron consists of a Chromium browser and
Node.js, so developers can use HTML, CSS and JavaScript to build their
cross-platform desktop applications. Light Table is actually written in
ClojureScript, which compiles to JavaScript. This makes perfect sense as the
IDE was originally intended to be an programming environment for Clojure only.


{: .warning}
I feel obliged to point it out though that the Electron framework
can be terribly misused in the wrong hands. The
[Monu](https://github.com/maxogden/monu) OS X only process monitoring menu bar
application weighs no less than 189 MiB on disk... Yes, you read that right:
a heavyweight cross-platform framework featuring a built-in *complete browser
engine* was used to create a menu bar widget for a *single platform*!  No disrespect
to the program's author, I'm sure he had the best intentions and he's a nice
person and all (even if he was clearly misguided in the practical execution
of his ideas), but who would seriously entertain even just the *thought* that
a 189 MiB menu bar application was going to be an okay thing to do, really?

### Executive summary

By analysing the commonalities of the above examples, we can see a few
patterns emerge. Cross-platform graphics is accomplished by using one of the
following approaches:

{: .compact}
* Make use of the graphics and text libraries provided by the host OS **(1)**
* Use a software renderer for all graphics **(2)**
* Use OpenGL for all graphics **(3)**
* Use a cross-platform environment (e.g. Electron or Java) to abstract
  all platform-specific stuff away **(4)**

Here's some notes about the pros and cons of each:

* Only **(2)** guarantees to yield 100% identical results across all platforms on
  the pixel level. **(1)** is probably the least cross-platform pixel-identical
  approach (especially text rendering can look very different on different
  platforms), but this is rarely a problem for most applications. In fact,
  platform-native text rendering can be seen instead as a feature (think of
  Retina displays) and while there might some differences in how different
  platform render anti-aliased vector graphics, the differences are negligible
  for most use-cases.



https://libcinder.org/

## And the winner is...

Looks like in the age of Mars rovers, and gene modified carrots that will kill
you in your sleep this is just too much ask for.

https://www.dreamler.com/blog/font-rendering/

<table style="width: 95%">
  <tr>
    <th style="width: 19%"></th>
    <th style="width: 27%">Software renderer</th>
    <th style="width: 27%">Native wrapper</th>
    <th style="width: 27%">OpenGL</th>
  </tr>
  <tr>
    <td class="h">Windowing</td>
    <td>
      wrapper OS window API<br>
      <span style="color: red; font-size: 120%; font-weight: 900">-</span>
    </td>
    <td>
      native OS API<br>
      <span style="color: red; font-size: 120%; font-weight: 900">-</span>
    </td>
    <td>
      GLFW<br>
      <span style="color: green; font-size: 120%; font-weight: 900">+</span>
    </td>
  </tr>
  <tr>
    <td class="h">Input handling</td>
    <td>
      custom code OS input handling<br>
      <span style="color: red; font-size: 120%; font-weight: 900">-</span>
    </td>
    <td>
      native input handling<br>
      <span style="color: red; font-size: 120%; font-weight: 900">-</span>
    </td>
    <td>
      GLFW<br>
      <span style="color: green; font-size: 120%; font-weight: 900">+</span>
    </td>
  </tr>
  <tr>
    <td class="h">Graphics</td>
    <td>
      custom rasterizer<br>
      <span style="color: red; font-size: 120%; font-weight: 900">- - -</span>
    </td>
    <td>
      native graphics API<br>
      <span style="color: green; font-size: 120%; font-weight: 900">+</span>
    </td>
    <td>
      custom rasterizer (tesselator, shader etc.)<br>
      <span style="color: red; font-size: 120%; font-weight: 900">- - -</span>
    </td>
  </tr>
  <tr>
    <td class="h">Text</td>
    <td>
      FreeType<br>
      <span style="color: red; font-size: 120%; font-weight: 900">- -</span>
    </td>
    <td>
      native text API<br>
      <span style="color: green; font-size: 120%; font-weight: 900">+</span>
    </td>
    <td>
      FreeType (w/ font atlas)<br>
      <span style="color: red; font-size: 120%; font-weight: 900">- -</span>
    </td>
  </tr>
  <tr class="sep">
    <td class="h">Total</td>
    <td><span style="color: red; font-size: 120%; font-weight: 900">- - - - - - -</span></td>
    <td><span style="color: red; font-size: 120%; font-weight: 900">-</span></td>
    <td><span style="color: red; font-size: 120%; font-weight: 900">- - -</span></td>
  </tr>
</table>


## Conclusion

{% include image.html name="fuck-everything.jpg" caption="The above fine
faux-leather jacket wearing gentleman already knows the secret: Qt is not
the answer to everything." width="100%" %}

Aww, I really wanted to avoid this, but I simply must acknowlege the fact that
to produce a custom cross-platform GUI of acceptable quality in 2016, there's
really no substitute to developing your own platform-agnostic UI and graphics
wrappers. There are some existing solutions in C++, but hacking C++ in my
spare time is very far from my idea of fun. If there would be *really* no
other option, I guess I'd just stop coding altogether and find a more relaxing
hobby. Like dirt car racing, wrestling with alligators, or disarming bombs or
something.

But luckily, I have Nim.

Oh well, I only wanted to display a few buttons and maybe push some pixels,
but fuck all that, let's  write a whole cross-platform GUI library in Nim!
Time to get serious!


http://innovation.tss-yonder.com/2012/05/14/the-future-native-cross-platform-ui-technology-that-may-not-be/

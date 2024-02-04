---
title: "Cross-platform GUI Toolkit Trainwreck --- 2016 Edition"
url:   2016/05/29/cross-platform-gui-toolkit-trainwreck-2016-edition
date:  2016-05-29
tags:  [coding, gui, imgui, rant]
---

<section class="intro">

Ok, I'm not too sure in what direction this post will go, an informative
article, a rant, or both. Probably a bit of both, with an emphasis on the rant
part, given my current not-quite-positive emotional involvement with the
topic. Gentlemen (and gentlewomen), please fasten your seatbelts!

*UPDATE #1:* It turned out to be a quite informative mega-post in the end, just
don't give up reading after the first section...

*UPDATE #2:* There's some very interesting alternative UI framework
recommendations in the comments that I haven't discussed
in the article, so you might want to check those out as well...

</section>


{{< toc >}}


## Buttons and pixels

In 2016, developing a program in entirety on one particular platform, for
example OS X, and then successfully compiling and running it on another, say
Windows, with zero or minimal modifications required is no longer an
utopistic dream. In fact, users of dynamic, interpreted or scripting languages
(however you like to call them today) have been enjoying the luxuries of easy
cross-platform development for many decades now; they won't even raise an
eyebrow on such trivial matters. But even the lowly C and C++ plebs are able
to perform this feat with relative ease nowadays---at least, if they stuck
to their respective language standards religiously and turned their compiler
warnings up to nuclear-strength...

Being able to use a single codebase for multi-platform applications is of
crucial importance. After all, who wants to maintain two or three (or more)
codebases that are mostly similar, but *not quite*? I sure don't. And then
there's the convenience and flexibility factor too: you can happily develop on
your Linux VM on your desktop PC at home, then maybe fix some bugs on your
MacBook while sitting on the train, with the confidence that your program will
work flawlessly on Windows too. Not having to deal with platform differences
and idiosyncrasies takes a huge burden off of the developer's shoulder that is
not to be underestimated.

Some compiled languages, like [Nim](https://nim-lang.org/), give you such
cross-platform guarantees by design. This is all good, this is all well, this
is precisely how things should be. The world is such a wonderful place, after
all. Write once, run anywhere (and don't go near the JVM). Excellent! The
universe is smiling at you. Infinity co creates karmic balance. Freedom
unfolds into intrinsic actions. Your consciousness manifests through quantum
reality. [^bullshit]

[^bullshit]: The last three new age wisdoms courtesy of the
[Wisdom of Chopra](http://wisdomofchopra.com/) bullshit generator.

Except for one little thing. **You must not under any circumstance** try to
open a window (on the computer, I mean), attempt to change the colour of
a single pixel in it, or---god forbid!---fantasise about using native (or any
kind of, for the matter) GUI controls in a cross-platform and non-hair loss
inducing manner! If you disregarded my sage advice and foolishly ventured to
accomplish any of the above tasks, the bliss would be over in an instant and
you'd find yourself rudely transported back to the early days of computing,
where making anything just barely work *at all* on different OSs would take
inordinate amounts of time and effort!


## Solution to a problem

I'm not just talking in the abstract here, I am merely describing my trials
and tribulations when attempting to extend my [ray
tracer](https://github.com/johnnovak/nim-raytracer) I'm developing in Nim with
a very minimalistic GUI. My ambitions were fairly modest: I only wanted to
open a window and then split it into a canvas and a control area.  Onto the
canvas I would just blit some pixel data periodically and the control area
would contain some buttons and some static text (maybe a progress bar too if
I felt particularly bold and adventurous!). I wanted this fine piece of
software craftsmanship to work on Windows, Linux and OS X, without having to
write any platform specific code. And that's it!

So next step, let's investigate what cross-platform libraries are available
for Nim!

### IUP

I was looking for something really minimal and I would have
perfectly been happy with native controls, so the [Nim
bindings](https://github.com/nim-lang/gtk2) to the [IUP
GUI](https://webserver2.tecgraf.puc-rio.br/iup/) library (a cross-platform
toolkit in C for creating GUI applications in Lua) looked very promising...
until I found out that it does not support OS X at all. Oh well.

### GTK2

The next obvious candidate was the [GTK2 bindings for
Nim](https://github.com/nim-lang/gtk2). I am not a fan of GTK on Windows at
all, and especially not on OS X (despite the fact that I really love
[Inkscape](https://inkscape.org/) on Windows, but let's just write that off as
an anomaly).  Anyway, why not give it shot, it doesn't cost any money.  Well,
after having spent about half an hour foraging on the Internet for the GTK2
Windows binaries (because the official [GTK+ Project
website](https://www.gtk.org/) is of not much help at all in that regard, apart
from some [kinda vague instructions](https://www.gtk.org/download/windows.php)
on where to try to locate them), the poor directory containing my ~300K
executable got suddenly about **20 megabytes bigger (!)** in the form of the
cheerful company of 10+ DLL files. The thing surely worked just fine (to the
extent that GTK2 is capable of doing so), but this is a very bad start already
as I wanted something small that can be statically linked. Adding 20 MB fat to
my cute little 300K renderer is an idea that I find quite obscene to be honest
(as in "obscenely obese"), so in short, no thanks.

Executive summary: GTK2 + non-Linux platform = AVOID

Some people might feel the urge to point out now that I'm way too picky, this
is merely a solution to a problem, it works, so I should just suck it up and
live with the **over 60-fold increase of my total binary size!** Well, this is
a solution to a problem too:

{{< figure name="img/headphones.jpg" width="70%"
           alt="Solution to a problem..." >}}

  Warning: putting up with lots external dependency crap just to make things
  work somehow is a straight road to this to happen to you!

{{< /figure >}}

And with that move, I had practically exhausted all the readily available GUI
options for Nim. (Note that this is not a rant against Nim at all;
I absolutely love that language, (in fact, it's my favourite language at the
moment); it's not Nim's fault that most---if not *all*---cross platform GUI
toolkits suck in one way or another (having been written in C++ is one major
source of such suckage)). [^lisp]

[^lisp]: Note the nested parentheses---a true tell-tale sign of my latent LISP
  tendencies!

At this point, the needle of my stress-o-meter was already hovering in the
orange zone. Luckily enough, I then found something interesting...


## IMGUI to the rescue

I haven't heard about immediate mode UIs (IMGUI) before, so in my
initial excitement I thought this could be the answer to all my woes. For
anyone not familiar with the concept, the general idea is that with an IMGUI
the UI does not live in memory and manage it's own state, as it is the case
with traditional retained mode GUIs (RMGUI), but it gets "recreated" and
redrawn on the fly on every frame at 60 FPS (or whatever your framerate is).
From an implementation perspective, an IMGUI essentially boils down to one
function per widget type, where that single function performs all duties
related to the correct functioning of that particular widget (event handling,
drawing, reporting the current state etc.) The construction of an IMGUI based
UI thus becomes a series of simple function calls which makes it an attractive
option from a simplicity and iteration speed standpoint. Also, because the
whole interface gets fully redrawn on every frame, there's no messing with
dirty regions at all---just redraw the whole thing into an off-screen buffer,
overlay it onto the top of the current frame and job done. Easy!

It turns out that while such an approach makes a lot of sense for a game that
needs to redraw the whole screen at a constant framerate anyway, it's not that
great of a choice for a traditional desktop application where such frequent
redraws would be wasteful.

(At least, that was my simplistic understanding of the whole IMGUI concept,
which is not quite true, but I'll just leave the above description here
unaltered, as by judging by some of the threads on the topic, most people seem
to misinterpret the concept of IMGUI in a very similar way like I did when I
was just getting acquainted with it. So if you fully agree with the above two
paragraphs, you're wrong! :smile: What I described above is *one particular
way* to implement an IMGUI that is very well suited to applications that need
to redraw the screen at a constant frame rate anyway, generally using
accelerated graphics (read, games). But the actual definition of IMGUI is much
simpler: the UI is just a function of the current application state, thus the
application is not responsible for explicitly managing the UI state and
keeping it in sync with the app.)

### Enter NanoVG

Ok, so my idea was to build a simple IMGUI user interface myself with
[NanoVG](https://github.com/memononen/nanovg), which is a 2D vector graphics
library that uses OpenGL as its rendering backend. The plan was to use it in
conjunction with GLFW to shield me from any platform specific drawing and
window handling stuff. That part actually worked out quite nicely; after a few
days of hacking I had a window showing a bitmap image which was periodically
updated from the internal render framebuffer with some GUI elements laid on
top of it with transparency and whatnot.

So far so good, cross-platform custom GUI proof-of-concept check, but
I suddenly found myself facing two brand new problems:

* The constant redrawing of the whole UI on every frame was burning too much
  processor time, about 10-15% of CPU on my Intel Core i7 4790k 4.0 GHz (8
  logical cores).  That means 1 core out of the total 8 was constantly running
  at almost 100%!

* The text rendering quality of NanoVG made me really depressed...

### Exit NanoVG

The first problem was easy to fix. The abysmal performance had nothing to do
with NanoVG or OpenGL, it was caused by the constant redrawing at 60 FPS. The
solution was to redraw only when needed: as a quick hack I introduced a global
boolean `doRedraw` and set it to true only when an input event was received or
the internal application state had been changed (e.g. the framebuffer had been
updated). Then the drawing would only happen when `doRedraw` was set to true.
Surely this could be done in a nicer way, but the general concept would be the
same.

The second issue with text rendering was a harder nut to crack. NanoVG uses
the tiny
[stb_truetype](https://github.com/nothings/stb/blob/master/stb_truetype.h)
single-header C font rasterizer to create the font atlases used for text
output. This is all well, but the quality at small font sizes is not that
great at all (not great enough to annoy the hell out of me). NanoVG seems to
have optional support for FreeType, but even if that works, it has only quite
rudimentary support for handling text layouts (which is quite buggy, by the
way). I really have zero inclination to neither start hacking the C code, nor
come up with my own font layout engine... I know there's stuff like
[Pango](https://www.pango.org/) and
[HarfBuzz](https://www.freedesktop.org/wiki/Software/HarfBuzz/), but I really
don't want to [do a Donald E.
Knuth](https://signalvnoise.com/posts/3183-the-art-of-computer-typography)
here and spend too much time on a problem that has already been solved on the
OS graphics library level in a perfectly satisfactory manner. I just want to
call `drawText()` and be done with it!

Alright, so OpenGL---and thus NanoVG---is not the way to go because of this
whole text rendering fiasco...  At this point, the progress of my adventures
in the wonderful realm of cross-platform graphical user interfaces could be
visualised pretty much spot on as follows:

{{< figure name="img/fail.jpg" captionAlign="center" width="auto"
           alt="FAIL" >}}
  FAIL
{{< /figure >}}

## State of the art

Ok, after putting the problem aside for a few days (mainly in order to calm
down), I realised that the best way to go about this is to take a few quality
cross-platform applications that I know well and analyse how they solved the
custom GUI problem. So that's exactly what I did next.

I have included a mini-breakdown for each app on the sizes of their various
components (e.g. main executable, libraries, additional resources etc.), in an
attempt to get a feel for what is considered acceptable in 2016. I used the
64-bit Windows versions except where noted otherwise.

### REAPER

<table class="properties">
  <tr><td>Version             </td><td>5.12  </td><tr>
  <tr><td>Main executable     </td><td>11 MiB</td><tr>
  <tr><td>Resources           </td><td>23 MiB</td><tr>
  <tr><td>Plugins             </td><td>30 MiB</td><tr>
  <tr><td>Total install size  </td><td>68 MiB</td><tr>
</table>

[REAPER](https://www.reaper.fm/) is a highly advanced cross-platform digital
audio production workstation (DAW) for Windows and Mac OS X originally
developed by [Justin Frankel](https://en.wikipedia.org/wiki/Justin_Frankel),
the guy who wrote the original WinAmp. REAPER is written in C++ and it uses
the open-source [WDL](https://www.cockos.com/wdl/) library (from the same
developer) for cross-platform graphics, audio and UI tasks.

It is a very much no-bullshit app, just look at the 11 MiB executable size! By
examining the WDL sources it becomes pretty clear that REAPER uses a mixture
of native software rendering (GDI on Windows, because it still supports XP)
and an anti-aliased software rasterizer. The GUI is skinnable but
non-scalable as the skins are completely bitmap based, so a good proportion
of the GUI drawing consists of blitting operations, presumably.  There are
some font rendering differences between the OS X and Windows versions that
suggests that the app uses OS native text rendering under the hood.  The menu
bar and all dialog windows (e.g. file dialogs, preferences) are OS-native too.

It is evident that REAPER's strategy in terms of the UI is to use as much OS
provided functionality as possible and resort to custom code only when
necessary.

**Update 2017-03-17:** Justin, the man himself has enlightened me in the
comments below that the situation is a bit more complicated than what
I thought (quoted verbatim):

> It's worth noting that REAPER actually uses SWELL (which is a part of WDL)
> for cross-platform compatibility... SWELL allows you to write minimal win32
> code and target Cocoa or GDK... you can do all native controls, GDI
> rendering, software bitmap rendering, or any combination of the above...

Neat, looks like I wasn't too far off the mark. Then he adds:

>  It takes a special sort of soul to willingly program UIs using a minimal
>  subset of win32, so I wouldn't go recommending it... but for those people
>  writing win32 applications, SWELL might be handy.

I certainly don't disagree with that! (so, in short, no thanks...)


{{< figure name="img/reaper.png" nameSmall="img/reaper-small.jpg"
           alt="REAPER 5 screenshot showing the Funktion 1.0 skin" >}}

  This is REAPER 5 in fullscreen mode, featuring the [Funktion
  1.0](https://stash.reaper.fm/theme/1792/Funktion) skin (designed by *yours
  truly*). Note the standard Windows menu bar on top.

{{< /figure >}}


### Renoise

<table class="properties">
  <tr><td>Version                     </td><td>3.1.0   </td><tr>
  <tr><td>Executable                  </td><td> 26 MiB </td><tr>
  <tr><td>DLL files                   </td><td>1.3 MiB </td><tr>
  <tr><td>Resources                   </td><td>19 MiB  </td><tr>
  <tr><td>Library (presets, samples)  </td><td>131 MiB </td><tr>
  <tr><td>Total install size          </td><td>195 MiB </td><tr>
</table>

[Renoise](https://www.renoise.com/) is probably the best cross-platform modern
music tracker in existence today. It runs on Windows, OS X and Linux and it
has a completely custom single-window UI. Everything is custom drawn,
including the menus, dialogs, the file browser and so on. The graphics backend
uses DirectX on Windows, OpenGL on OS X and presumably X directly on Linux.
The UI is non-scalable and non-skinnable, the fonts are bitmap based (I think)
and most of the drawing seems to be simple blitting. They also must have
developed some custom graphics routines for the anti-aliased cross-platform
drawing of dynamic UI elements (e.g. the waveform and envelope displays). The
UI seems to be pixel-identical across platforms.

Renoise is closed source, so unfortunately I could not inspect how they
accomplished all this, but very likely they had to come up with their own UI
and graphics wrappers to maintain a single codebase for all three platforms.

{{< figure name="img/renoise.png" nameSmall="img/renoise-small.jpg"
           alt="Renoise 3 screenshot" >}}

  Renoise 3 in fullscreen. Everything is custom drawn, such as the menu bar
  and the preferences dialog in the middle of the screen. Again, the nice
  looking theme is yet another project of mine.

{{< /figure >}}


### Tracktion

<table class="properties">
  <tr><td>Version            </td><td>7.1.1   </td><tr>
  <tr><td>Main executable    </td><td>57 MiB  </td><tr>
  <tr><td>DLL files          </td><td>2.3 MiB </td><tr>
  <tr><td>Total install size </td><td>60 MiB  </td><tr>
</table>

[Tracktion](https://www.tracktion.com/) is another cross-platform DAW
targeting the Windows, Mac OS X and Linux platforms. Like in the case of
Renoise, the single-window GUI of Tracktion is fully custom drawn, but what
sets it apart from the former is that the drawing here is much more dynamic:
instead of having mostly fixed-size UI elements, all widgets in Tracktion
shrink and enlarge as their respective containers change in size.

Tracktion is written in C++ and uses the
[JUCE](https://github.com/julianstorer/JUCE) library for all cross-platform
duties (again, written by the same single person responsible for all Tracktion
development). JUCE supports anti-aliased vector graphics and text output
through a number of wrapper classes that can use either JUCE's internal
software rasterizer or one of the supported platform specific graphics APIs as
their backend (e.g.  Direct2D and DirectWrite on Windows, CoreGraphics on OS
X). All platform-specific event and window handling is abstracted away in
a similar fashion.

The JUCE library is available for free for non-commercial open-source
projects, but a commercial license will make the wallets of enterprising
developers exactly $999 lighter.

{{< figure name="img/tracktion7.jpg" nameSmall="img/tracktion7-small.jpg" 
           alt="Tracktion 7 screenshot, big screen" >}}

  Tracktion 7 in it's fully anti-aliased single-window glory. Previous
  versions might have looked somewhat less sleek, but the UI was designed to
  be highly scalable right from the very first release.

{{< /figure >}}


{{< figure name="img/tracktion7-lowres.jpg"
           nameSmall="img/tracktion7-lowres-small.jpg"
           alt="Tracktion 7 screenshot, small screen" >}}

  Still Tracktion 7, but now on a smaller screen. Contrast this screenshot
  with the one above: all common UI elements are still there but their sizes
  are vastly different. Tracktion has the most adaptable dynamic interface of
  all applications presented in this article, thanks to JUCE's extensive
  anti-aliased vector graphics support.

{{< /figure >}}


### Blender

<table class="properties">
  <tr><td>Version             </td><td>2.77     </td></tr>
  <tr><td>Main executable     </td><td>94 MiB   </td></tr>
  <tr><td>DLL files           </td><td>29 MiB   </td></tr>
  <tr><td>Python              </td><td>53 MiB   </td></tr>
  <tr><td>Data                </td><td>49 MiB   </td></tr>
  <tr><td>Scripts             </td><td>34 MiB   </td></tr>
  <tr><td>Total install size  </td><td>305 MiB  </td></tr>
</table>

[Blender](https://www.blender.org/) doesn't need much introduction, being the
most well-known open-source 3D package for Windows, OS X and Linux. On the UI
front, it uses a completely different approach to all the previous examples:
the contents of the whole window, including the render view and the user
interface, are drawn using pure OpenGL. There's no fallback to any
other rendering backends---Blender simply doesn't run on systems without OpenGL
support.

This makes certain interesting things possible, such as semi-transparent UI
elements overlaid on top of OpenGL views, as shown on the screenshot below.
The UI is fully scalable (including font sizes) and quite dynamic, and it's
also worth noting that it's fully defined in the form of Python scripts (hence
the bundled Python interpreter).

Displaying text elements is accomplished via glyphs pre-rendered into
[texture atlases](https://en.wikipedia.org/wiki/Texture_atlas) with
[FreeType](https://www.freetype.org/) (possibly a modified version). One of
the biggest weaknesses of OpenGL based UI drawing is the difficulty of
rendering crisp and clear looking anti-aliased text, as evidenced by [these
notes](https://archive.blender.org/wiki/index.php/Dev:Source/Text/Rendering/) on the
Blender developer wiki.

In theory, it would be possible to re-use Blender's cross-platform UI layer
written in C in other applications, but because its tight coupling to
Blender's internals, no one has been able to do so yet in practice.

{{< figure name="img/blender.jpg" nameSmall="img/blender-small.jpg" 
           alt="Blender screenshot" >}}

  Blender's OpenGL-based interface is quite sleek and modern looking. Notice
  the semi-transparent widgets on top of the 3D views. Nifty.

{{< /figure >}}


### Cinema 4D

I cannot provide any detailed info on Cinema 4D because I'm not using it
personally (and I couldn't bring myself to download the 3 GB demo installer
just to check the executable size...) It's still worthwhile to include it in this
discussion because a) the UI looks good, b) most other commercial 3D packages
follow a very similar approach.

We can deduce a lot from the screenshot below. First, note the image
dimensions: 2880-by-1714. The display resolution of a 15" 2015 Retina MacBook
Pro is 2880-by-1800, so this is a screenshot of the Mac version. Also note
that at 1:1 magnification the text and the large icons are very crisp looking,
but the rest of the UI, including the render view, is made up of double-sized
(2x2) pixels---a tell-tale sign of partial Retina display support. Apparently,
they're using native text rendering, taking advantage of high-resolution
displays whenever possible, but the rest of the UI probably consists of simple
bitmaps only. The render preview is drawn using 2x2 pixels too, most likely
due to performance reasons. Having a look at some random Windows screenshots
further validates this assumption; on those images the text looks very much
like a default 9px Tahoma UI font rendered with ClearType.

It seems that similarly to REAPER, Cinema 4D uses native graphics and text
rendering to draw its UI, probably via some custom wrapper libraries.

{{< figure name="img/cinema4d.png" nameSmall="img/cinema4d-small.jpg"
           alt="Cinema 4D screenshot" >}}

  Cinema 4D on a Retina display MacBook Pro. Note that the fonts and the big
  icons are shown at actual pixel resolution, while the rest of the UI is
  rendered with double-sized (2x2) pixels.

{{< /figure >}}


### NodeBox3

<table class="properties">
  <tr><td>Version               </td><td>3.0.44   </td>
  <tr><td>Main executable (JAR) </td><td>22 MiB   </td>
  <tr><td>Libraries (ffmpeg)    </td><td>12 MiB   </td>
  <tr><td>Java runtime          </td><td>172 MiB  </td>
  <tr><td>Python interpreter    </td><td>4.4 MiB  </td>
  <tr><td>Examples              </td><td>8.3 MiB  </td>
  <tr><td>Total install size    </td><td>220 MiB  </td>
</table>

[NodeBox3](https://www.nodebox.net/node/) is a quite interesting open-source
generative graphics tool that runs on Windows, Mac OS X and Linux. In
contrast to the previously discussed applications, NodeBox is not a native
executable written in C++ but a Java program. The custom-looking UI is built
with the help of Swing (that's the standard Java GUI library), as it can be
seen
[here](https://github.com/nodebox/nodebox/tree/master/src/main/java/nodebox/ui).

Relying on the cross-platform Java runtime is certainly very convenient from
the developers' perspective, but is not without some serious drawbacks. First
of all, the whole Java runtime environment has to be bundled with the
application (at least on Windows and OS X), which accounts to a whopping 172
MiB in this concrete example (that's 78% of the total install size!).
Interface redraws are much more sluggish compared to native applications like
REAPER and Renoise, startup times are generally slow, and Java applications
overall tend to be memory hogs. All these things are mostly non-issues for
long-running server-side applications (the most natural habitat of Java
bytecode), but they make the platform a less than ideal choice for
high-performance desktop applications.

In conclusion, while Java is certainly not the  most terrible choice for
a cross-platform GUI app, it's far from being the greatest either. For
some less demanding software, such as NodeBox, it may be an OK solution, but
I'm really averse to the idea of a DAW written in Java where every little bit
of performance counts.

{{< figure name="img/nodebox.png" nameSmall="img/nodebox-small.jpg"
           alt="NodeBox3 screenshot" >}}

  NodeBox3 has a pleasant looking GUI built using Swing that looks identical
  on all supported platforms. UI redraws are noticeably sluggish even on fast
  computers compared to native applications that use OS level graphics APIs
  directly.

{{< /figure >}}


### Light Table

<table class="properties">
  <tr><td>Version             </td><td>0.8.1    </td><tr>
  <tr><td>Main executable     </td><td>51 MiB   </td><tr>
  <tr><td>Electron framework  </td><td>42 MiB   </td><tr>
  <tr><td>Resources           </td><td>33 MiB   </td><tr>
  <tr><td>Total install size  </td><td>129 MiB  </td><tr>
</table>

> [Light Table](http://www.lighttable.com/) is a next generation code editor that
connects you to your creation with instant feedback.

This quote was taken from the project's [GitHub
page](https://github.com/LightTable/LightTable) and I think it sums up this
novel IDE pretty well. Light Table is available for Windows, Mac OS X and (can
you guess?) Linux; it achieves cross-platform compatibility by leveraging the
[Electron](https://electron.atom.io/) framework. In basic terms, Electron
consists of a Chromium browser and Node.js, so developers can use hipster
technologies like HTML, CSS and JavaScript to build their cross-platform
desktop applications. Light Table is actually written in ClojureScript, which
transpiles to JavaScript. This makes perfect sense as the IDE was originally
intended to be a programming environment for Clojure only.

I don't have any personal experience using Light Table, and while I think the
application itself is a great idea, I cannot say much positive about the
underlying Electron framework. Light Table seems to have been plagued by
[serious performance
issues](https://github.com/LightTable/LightTable/issues/1088) which were the
main reason for them having to migrate from node-webkit (their previous
framework, now known as [NW.js](https://nwjs.io/)) to Electron at the end of
2015 (see
[here](https://m.reddit.com/r/javascript/comments/3meazr/is_electron_atom_a_good_way_to_create_offline_js/)).
That's a very severe drawback of such Web-technologies-on-the-desktop style of
frameworks; they introduce too many layers of abstraction over OS provided
functionalities that often result in serious performance bottlenecks. And when
things don't quite work as expected, you can't do much about it---short of
maybe just switching to a different framework as a last attempt. (Of course,
this problem can happen with OS-native libraries as well, but in practice it
is much less of a problem, as OS APIs are generally several orders of
magnitude more robust and performant, and there's much more leeway for
workarounds on the OS level if anything does not quite work as expected).

Now as I think about it, the only reasons for the existence of such frameworks
is the allure of quick time to market, the luxury of being able to trade
development speed for program efficiency (because on contemporary hardware you
can be really wasteful with resources in many problem domains and the
resulting program will still remain mostly functional), and the vast armies of
newskool web developers who grew up on JavaScript and the DOM. But the
trade-offs involved are quite severe: performance, memory consumption,
installation sizes and OS integration will suffer, and long-term maintenance
will be a nightmare. Despite all the drawbacks, I can see this approach work
acceptably well in some specific circumstances (non-demanding applications
aimed at a not too picky---and hopefully non-technical---audience). But if you
care about your users and cannot afford to be grossly inefficient, just stay
away from web technologies on the desktop. You don't want to build a castle on
sand.

{{< warning >}}
  I think of it as my duty to point out that the Electron framework carries a
  terrible potential for misuse when fallen into the wrong hands. The
  [Monu](https://github.com/maxogden/monu) OS X only process monitoring menu
  bar application built using Electron weighs **no less than 189 MiB on
  disk!** Yes, you read that right: a heavyweight cross-platform framework
  featuring a *complete built-in browser engine* was used to create a *menu
  bar widget* for a *single platform*!  No disrespect to the program's author,
  I'm sure he had the best intentions and he's a nice person and all (even if
  he is clearly somewhat misguided in the practical execution of his ideas),
  but who would seriously entertain even just the *thought* that a 189 MiB
  menu bar app was going to be an okay thing to do, honestly?
{{< /warning >}}


## Executive summary

By analysing the commonalities of the apps showcased so far, we can see a few
interesting patterns emerging. For event and window handling, they all must
have used the host OS (or host platform, in the case of managed applications)
in some way, so nothing too much exciting going on there.  Regarding the
cross-platform graphics problem, each one of them must have implemented some
kind of variation on one of the following basic approaches:

1. Make use of the graphics and text libraries provided by the host OS
2. Use a software renderer for all graphics
3. Use OpenGL for all graphics
4. Use a cross-platform environment (e.g. Electron or Java) to abstract
   away all platform-specific stuff 
{class="compact"}

Here's my expert analysis on the pros and cons of each method:

* Using **native graphics APIs (1)** is probably the least pixel-identical
  approach across platforms (especially text rendering can look wildly
  different on different operating systems), but this is rarely a problem in
  practice for most applications.  In fact, platform-native text rendering can
  be seen as a feature rather than a drawback---think of Retina displays, or
  how hardcore Windows users typically prefer ClearType over the unhinted OS
  X style text rendering, and vice versa.  While there might be some minor
  differences in the way different platforms render anti-aliased vector
  graphics natively, those differences are generally negligible for most
  use-cases (and for most users not suffering from some chronically acute case
  of OCD).  Another important point to note is that OS native graphics usually
  takes advantage of the GPU on most major platforms, so we get hardware
  acceleration for free.

* Only a **software renderer (2)** guarantees to yield 100% identical results
  across all platforms down to the pixel level (except if you're only blitting
  pre-stored pixel images), but it's a lot of work and it will be potentially
  much slower than the often GPU-accelerated native graphics API (unless
  you're a graphics guru and know exactly what you're doing). Overall, I think
  it's a wasted effort, unless you have some special requirements to do the
  rendering in a very specific, pixel-exact way across all supported
  platforms. But yes, in the past people had to come up with their own
  rasterizers if they were not happy with the crappy aliased graphics provided
  by the Windows GDI and such.

* **OpenGL (3)** initially seems to be a very good fit for cross-platform
  graphics duties; after all, it's hard to get hold of hardware nowadays (even
  second-hand!) that does *not* have support for it. But driver support can be
  an issue; there's some rumours, for example, that Intel OpenGL drivers are
  pretty shit in that regard.  The other thing that can throw the spanner in
  the works is font rendering.  There are lots of different approaches to it,
  and while some might be perfectly fine for a particular application,
  generally it's a major pain in the ass. Just have a look at [this
  post](https://innovation.tss-yonder.com/2012/05/14/the-future-native-cross-platform-ui-technology-that-may-not-be/)
  if you don't believe me to see what kind of quite absurd hoops these poor
  Swedes had to jump through just to display some animated text. Oh, and you'd
  also need to come up with your own tesselator engine that can construct nice
  smooth Bézier curves out of little triangles and so on. Compared to the
  native graphics approach, this is a lot of work, more or less on par with
  writing your own software rasterizer. Again, the native graphics libraries
  are already doing the tesselation stuff (and lots more) for you for free if
  a GPU is present and fall back to software rendering otherwise. But for
  games and similar full-screen applications where you really want to
  superimpose the UI on top of the 3D view, you really don't have much other
  choice (and a naive IMGUI approach might actually be a very good fit).

* **Cross-platform application development environments (4)** might be okay
  (but not great) for simpler, less demanding stuff.  But when performance is
  a concern, they are definitely not the way to go. The total install size
  will also suffer (to be very polite and ladylike about it). Overall, apart
  from making life easier for certain types of developers (primarily the ones
  who enjoy hacking Java + Swing and the JavaScript-for-all-the-things webdev
  folks), this approach has a lot of drawbacks. I also don't think that
  shoehorning web development technologies---which technically don't provide
  any advantages over more traditional approaches---into desktop applications
  is a very sound idea either. So for any serious work, avoid.


## So what the hell to do?

...apart from writing a semi-useless blog post/rant about this utter fiasco,
that is. Looks like that an easy to use, well-performing and non-bloated
library to help with cross-platform UI and graphics duties in the age of Mars
rovers, Go world-champion beating AI constructs and genetically modified
carrots that will kill you in your sleep is just too much ask for. 

The computer says *no*.

JUCE is probably the one that comes closest, but it's C++, semi-bloated and
not free for commercial purposes. There's WDL too, but that's still C++ and
looks rather disgusting.  Also, hacking C++ in my spare time is very far from
my idea of fun. If there would be *really* no other option, I guess I'd just
stop coding altogether and find a more relaxing hobby. Like dirt car racing,
wrestling with alligators, or disarming bombs or something.

Other than JUCE (and maybe WDL), we'd have to roll your own, plain and
simple. And that's exactly what many people have been doing, apparently, and
that's what I'm gonna do too. To help decide how to accomplish this lofty
goal, the below table summarises my ratings of the various approaches outlined
previously. I made this really very scientific: one plus means a given feature
is somewhat enjoyable to implement, one minus means it slightly sucks, et
cetera---you get the picture.

So let's see (Java and web technologies are disqualified on purpose for
I really think they have no place on the desktop):

<table class="nopadleft">
  <tr>
    <th style="width: 19%"></th>
    <th style="width: 27%">Software renderer</th>
    <th style="width: 27%">Native wrapper</th>
    <th style="width: 27%">OpenGL</th>
  </tr>
  <tr>
    <td class="h">Windowing</td>
    <td>
      native OS API<br>
      <span style="color: red; font-size: 120%; font-weight: 900">-</span>
    </td>
    <td>
      native OS API<br>
      <span style="color: red; font-size: 120%; font-weight: 900">-</span>
    </td>
    <td>
      GLFW (or similar)<br>
      <span style="color: green; font-size: 120%; font-weight: 900">+</span>
    </td>
  </tr>
  <tr>
    <td class="h">Input handling</td>
    <td>
      native input handling<br>
      <span style="color: red; font-size: 120%; font-weight: 900">-</span>
    </td>
    <td>
      native input handling<br>
      <span style="color: red; font-size: 120%; font-weight: 900">-</span>
    </td>
    <td>
      GLFW (or similar)<br>
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
      custom tesselator<br>
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
      <span style="color: red; font-size: 120%; font-weight: 900">- - -</span>
    </td>
  </tr>
  <tr class="sep">
    <td class="h">Total</td>
    <td><span style="color: red; font-size: 120%; font-weight: 900">- - - - - - -</span></td>
    <td><span style="color: #666; font-weight: 900">0</span></td>
    <td><span style="color: red; font-size: 120%; font-weight: 900">- - - -</span></td>
  </tr>
</table>

And the final verdict: **the native wrapper method is the lucky winner**
(read: it sucks the least, compared to the major suckage involved with the
other two approaches).

Phew.


## Final words

Well, I really wanted to avoid this, but I simply must acknowledge the fact
that to produce a good quality custom cross-platform GUI in 2016, there's
really no substitute to rolling up your sleeves and developing your own
platform-agnostic UI and graphics libraries.

Oh well, I only wanted to display a few buttons and maybe push some pixels,
but fuck all that, let's  write a whole cross-platform GUI library in Nim!

Time to get serious!

{{< figure name="img/fuck-everything.jpg" alt="Fuck everything" >}}

  The above fine faux-leather jacket wearing gentleman already knows the
  secret: Qt is not the answer to everything.

{{< /figure >}}


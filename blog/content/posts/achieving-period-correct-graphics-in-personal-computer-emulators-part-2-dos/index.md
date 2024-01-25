---

title: "Achieving period-correct graphics in personal computer emulators --- Part 2: IBM PC compatibles"
url:   2023/05/20/achieving-period-correct-graphics-in-personal-computer-emulators-part-2-ibm-pc-compatibles
date:  2023-05-20
tags:  [graphics, dos, gaming, shader]
---

{{< important title="A note for the impatient" >}}

I care very much about the preservation of good old computer games in their
most authentic form for future generations. To that end, if you're interested
in old PC games, you owe it to yourself to read this article _carefully_.

However, some people just don't like to read. For them, here's the
ultra-condensed version to get the most important thing, the aspect ratio
right at the very least:

**Use [DOSBox Staging](https://dosbox-staging.github.io/), a mostly drop-in
replacement for old DOSBox, to get aspect ratio correct output without having
to configure anything!**

That's it! Frankly, that will get you 80% there. And if you fancy watching a
video about the details, [I happen to have just the thing for
you!](https://www.youtube.com/watch?v=YvckyWxHAIw)

If you're interested in setting up authentic CRT shaders, getting the aspect
ratio correct for all games (not just the majority), or learning more about
the different PC graphics standards and a bit of PC history, you'll need to
read the rest.

{{< /important >}}


<section class="intro">


</section>




{{< toc >}}


## Preamble

TODO

Well, I guess this is not really an article but more like a _treatise_ of the
subject.


## Early monitor technology --- two diverging histories

Computer monitor and television technology have always been closely
intertwined. Specialised monitors were expensive to manufacture in the early
days; therefore, all home computers of the 1980s output TV-compatible signals,
following the tradition established by home video game consoles in the 70s.
Most people owned a TV already, so you only needed to buy the computer, and
then you could hook up your brand new Atari, Commodore, or Sinclair machine to
the family television straight away!

The IBM PC line of home computers, however, took a very different evolutionary
path. In a nutshell, no single CRT monitor in the early 80s could satisfy all
use-cases; manufacturers had to optimise the display to the target market in
order to keep the price at semi-reasonable levels. Due to these differences,
almost none of the CRT shaders created for emulating consoles or home
computers are suitable for emulating IBM PC monitors. By the end of this
section, you should have a pretty good idea why that's the case.

### Home computer monitors

Specialised home computer monitors were essentially cannibalised small 13
to 14-inch TV sets with the RF tuner removed (e.g., the [Commodore
1702](https://dfarq.homeip.net/commodore-1702/)). This had several benefits;
for example, you could hook up a
[VCR](https://en.wikipedia.org/wiki/Videocassette_recorder) or an external RF
tuner to their composite inputs to watch [VHS
movies](https://en.wikipedia.org/wiki/VHS) and TV shows. 40-column text was
generally legible enough on these "TV sets turned monitors", but 80-column
text modes looked so blurry they were basically unusable.


{{< figure name="img/fathers-settings.png" nameSmall="img/fathers-settings.png" alt="We Must Not Touch Fathers Settings, a.k.a Fuck off kids, it's the bass solo!" width="90%" >}}

[We Must Not Touch Fathers Settings (a.k.a Fuck off kids, it's the bass solo!)](https://tomseditor.com/gallery/i/40251/we-must-not-touch-fathers-settings-by-rail-slave) --- Commodore 64 pixel art by [Rail Slave](https://tomseditor.com/gallery/browse?platform=&format=&author=Rail%20Slave&year=&sort=&group=&nsfw=&lang=en). People who grew up in the 70s/80s and had to share the family TV and Hi-Fi with Dad will surely get the joke!

{{< /figure >}}


This led to the introduction of better models, such as the legendary
[Commodore 1084](https://dfarq.homeip.net/commodore-1084-monitor/), the
Philips CM 8833, and their many variants. These were still small TVs but
capable of producing a much sharper image, making them rather well-suited for
displaying 80-column text and 640-pixel-wide graphics. These more advanced
displays usually featured analog RGB inputs in addition to the standard
composite and chroma/luma connections. However, the vertical resolution
could not be increased much above 200 lines on such 15 kHz monitors
because of the limitations of the American [NTSC television standard](https://en.wikipedia.org/wiki/NTSC). You could double
the resolution to 400 lines with [interlacing](https://en.wikipedia.org/wiki/Interlaced_video), but that wasn't a great solution because
of the so-called interlace twitter...


{{< figure name="img/interlace-twitter.gif" alt="Interlace twitter example" width="576px" >}}

  Simulations of various forms of interlace twitter in action ([source](https://en.wikipedia.org/wiki/File:Indian_Head_interlace.gif)). The non-interlaced image is on the left. You don't want to stare at this all day at work, trust me...

{{< /figure >}}


All in all, the choice home computer manufacturers had taken in the early 80s to
take advantage of the ubiquitous and relatively cheap television technology
was optimal given the main application of these machines, which was playing
games. Atari and Commodore had arcade gaming roots; productivity applications
were a mere afterthought for them. These companies started taking non-gaming
use-cases more seriously at the start of the 16-bit era around the mid-80s
with the release of such iconic and groundbreaking machines as the
[Amiga 1000](https://en.wikipedia.org/wiki/Amiga_1000),
[Atari ST](https://en.wikipedia.org/wiki/Atari_ST),
[Apple IIgs](https://en.wikipedia.org/wiki/Apple_IIGS) and the
[Acorn Archimedes](https://en.wikipedia.org/wiki/Acorn_Archimedes).


### IBM PC monitors

IBM, however, took a very different path with their first personal computer,
the [IBM 5150](https://www.ibm.com/ibm/history/exhibits/pc25/pc25_birth.html)
released in 1981. If it wasn't clear to everybody, the letter "B" in
IBM's name stands for "Business"---these guys were not interested in gaming
applications in the slightest. Every single decision around the IBM PC was
firmly rooted in the goal of producing a machine for business applications for
buttoned-down, diligent office dweller types. Foolish things such as beauty,
creativity, or having fun were not design considerations---but clearly
readable 80-column text very much was[^80col]. To make that happen, IBM simply had to
design their own monitor as using off-the-shelf cheap TV sets was simply not an
option in 1981 due to the aforementioned reasons. The first [IBM
5151](https://en.wikipedia.org/wiki/IBM_5151) 12-inch monochrome display was a
_digital_ monitor capable of displaying a sharp 720&times;350 image. That was
simply outstanding performance back then, and was still considered excellent
10-15 years later, almost until the end of the 90s.

[^80col]: Why this fixation with 80-column text? How did that ever become an "industry-standard"? And why 80 and not any other number? Because the [display terminals](https://en.wikipedia.org/wiki/Computer_terminal) from the 1970s used 80-column text, which in turn inherited this from the [teleprinter terminals](https://en.wikipedia.org/wiki/Teleprinter) from the 60s, which all goes back to the [IBM punch cards](https://en.wikipedia.org/wiki/Punched_card) standardised in the 1920s that had 80 columns and 10 rows for the holes. That's why the source code of the Linux kernel still has a [strongly preferred line-length of 80 characters](https://www.kernel.org/doc/html/v4.10/process/coding-style.html#breaking-long-lines-and-strings), for instance. Again, you have to know the past to understand the present. Plus the optimal line-length is between 50 and 75 characters for the best readability---that's a hard fact rooted in human biology that is not going to change overnight.


The base configuration sold for 1565 USD initially _without_ any floppy drives
or monitor, and a whole system with a single floppy and the 5151 monitor went
for a meagre sum of 3005 USD in 1981 money. Yikes! In comparison, the
Commodore 64 was released next year in 1982 at a 595 USD introductory price,
and you could just hook it up to your TV. This is how much quality monitors
cost back then; most home users could simply not afford the price of such
high-resolution displays.

{{< figure name="img/ibm-5150.jpg" nameSmall="img/ibm-5150.jpg" alt="Interlace twitter example" width="576px" >}}

  
  The original IBM PC model 5150 equipped with the IBM 5150 12" monochrome monitor. Also known as the BBBB (Boring Beige Business Box---strictly for adults only!), this big, clunky, glorified cashier machine had all the grace and beauty of a nail gun, a belt sander, and a bowling ball combined. Sure, it was reliable, it could display sharp 80-column text all day and perform the sort of important office tasks important people tend to do in offices, plus as a bonus, it was so heavy and well-built that it could easily punch a hole in the floor if you dropped it... But are you inspired by your belt sander? ([source](https://en.wikipedia.org/wiki/IBM_5151))

{{< /figure >}}

It is crucially important to understand the very different goals and target
markets of these two main lineages, the home computers and the IBM PC
compatibles. With the exception of the [Tandy line of IBM PC
clones](https://en.wikipedia.org/wiki/Tandy_1000), PC compatibles were always
designed for business applications first and foremost; gaming was an
afterthought at best until the end of the 80s. By the late 80s, IBM had set
the standards (both figuratively and literally) for PC display technologies
and every other clone manufacturer had been following their footsteps. PC
graphics adapters and monitors communicated with _digital TTL signals_ right
from the start until the introduction of the VGA standard in 1987 when things
moved to analog RGB. That's right, it started all digital, then we moved to
analog RGB before moving back to digital again with DVI, HDMI, DisplayPort and
USB-C! Most PC users used their computer for work related tasks, staring at
spreadsheets, word processors, and bar charts all day, therefore a clear,
sharp, and non-fatiguing image was the single most important design
consideration for PC monitors---everything else took a backseat. Sure, it was
nice that you could play a game of solitaire during your lunch break, or have
fun with some adventure game now and then (remember the [boss
key](https://en.wikipedia.org/wiki/Boss_key) in Sierra adventures?), but that
was not the main purpose of these computers.


## DOS era aspect ratios

Computer monitors, being direct descendents of old analog TV sets, had a 4:3
[display aspect ratio](https://en.wikipedia.org/wiki/Aspect_ratio_(image)#Distinctions)
for a long time. Apart from some extremely niche (and extremely expensive!)
[16:9 widescreen CRT monitors](https://www.themarysue.com/1995-john-carmack-quake-monitor/),
pretty much everybody used 4:3 aspect ratio displays until the early 2000s.
Widescreen LCD screens started gaining popularity from around the mid 2000s,
and the complete switch to 16:9 in computer monitors and laptops happened only
by the early 2010s.

In simple terms, this means CRT screens of yore were 4 units wide and 3 units
tall. If you want to fill such a screen with _square pixels_ (pixels whose
height is equal to their width), you need to use resolutions that are integer
multiples of 4 by 3. For example, with a multiplier of 80 you get
320&times;240, doubling it to 160 yields **640&times;480**, a multiplier of
200 gives you **800&times;600**, and multiplying 4&times;3 by 256 results in
**1024&times;768**. The last three of these resolutions (in bold) should be
familiar to you.

The problem is, none of the standard screen resolutions before the
introduction of the 640&times;480 VGA mode in 1987 were integer multiples of 4 by 3, not a single one of them! For example, the 320&times;200 low resolution mode used most commonly by DOS
games would not fill the screen completely when using square pixels. 4 by 3
multiplied by 80 is 320&times;240, so the 320&times;200 image would either sit at the
top of the screen with the bottom 40 lines left blank, or it could be centred,
in which case the image would appear [letterboxed](https://en.wikipedia.org/wiki/Letterboxing_(filming)) with two 20-line tall black bars above and below it.

TODO image

If you used CRT monitors back in the day, you might remember that the image
almost always filled the screen completely. So how did they do it then? By
stretching the 320&times;200 image vertically by 20% so it fills the screen
(because 200 &times; 1.2 = 240). The resulting pixels were no longer perfect
little squares but slightly tall rectangles---20% taller than perfect squares, to be exact.
Because of this, the [pixel aspect
ratio](https://en.wikipedia.org/wiki/Pixel_aspect_ratio) was no longer 1:1
but 1:1.2.


### Display, storage & pixel aspect ratios

Let's take a moment to let it sink in that we're dealing with no less than _three_ different
aspect ratios! These are never to be confused with each other! (If you're
_really_ allergic to maths, you may skip this section---after all, DOSBox
Staging will handle all these calculations behind the scene for you.)

- **Display aspect ratio (DAR)** --- Always 4:3 for CRT monitors (we don't
    care about the extremely rare widescreen CRTs in our discussion). You
    could express aspect ratios as the ratios of two integers, so 4:3,
    or normalise it so the first part is the number 1, resulting in 1:1.3333 in this
    case (because 4 divided by 3 is 1.3333).

- **Storage aspect ratio (SAR)** --- 320&times;200 in this example. Just think
    about it; if you store the image on disk in an image file, you will store
    320 rows and 200 pixels per each row. 320:200 could be simplified to 8:5
    or 1:1.6, but usually we don't really talk about the SAR directly
    (nevertheless, it's important to understand the concept).

- **Pixel aspect ratio (PAR)** --- Given the _display aspect ratio_ (DAR; always
    fixed at 4:3 for DOS) and the _storage aspect ratio_ (SAR; different for
    the various screen modes supported by the graphics cards), we can
    calculate the _pixel aspect ratio_ (PAR) if we assume the image must
    completely fill the screen (and this assumption holds true in 99% of the
    cases; we'll talk about the exceptions later). To derive PAR from SAR and
    DAR, we can use the following formula:

    **PAR = SAR / DAR**

    So, in this case (320/200) / (4/3) = 1.2. There's our 20% vertical
    stretch factor! The 1:1.2 PAR can also be expressed as 6:5. By rearranging
    the above formula slightly, you can use the simplified **(W / H) &times; 0.75**
    form to calculate the correct PAR for any W&times;H screen resolution
    on a 4:3 aspect ratio monitor (in our example, 320/ 200 &times; 0.75 equals 1.2, so it all checks out).


### Pixel aspect ratios of common DOS screen modes

The below table lists some very common screen resolutions of the IBM PC
compatibles. As you can see, none of them use square pixels!

| Screen resolution | Pixel aspect ratio (PAR) | Description
|-------------------|----------|-------------------------------------------------
| 320&times;200     | 1:1.2    | Low-resolution CGA, PCjr, Tandy, EGA, and VGA graphics modes used by most games
| 640&times;200     | 1:2.4    | Medium-resolution CGA graphics mode
| 640&times;350     | 1:1.3714 | High-resolution EGA graphics mode;<br>80&times;25 EGA text mode
| 720&times;400     | 1:1.35   | 80&times;25 VGA text mode
| 720&times;348     | 1:1.5517 | Hercules graphics mode
| 720&times;350     | 1:1.5429 | Monochrome 80x25 Hercules and CGA text mode

Square pixels (1:1 PAR) only became a thing with the introduction of the VGA
standard in 1987. The 640&times;480 VGA screen mode has square pixels, and so
do most common SVGA and VESA screen modes above that, so 800&times;600,
1024&times;768, and 1280&times;960 (the 1280&times;1024 mode is an outlier
with a PAR of 0.9375).


## Challenges of emulating CRT monitors

### CRT monitors have no fixed resolution

It might be perplexing to people who only ever experienced flat-panel displays
with fixed pixel-grids how these old monitors are capable of displaying such a
wide range of different resolutions having wildly different pixel shapes.
Almost all flat-screens have square pixels, and it's common knowledge that you
absolutely must use their "native resolution", otherwise you'll get a really
ugly, blurry picture due to bilinear scaling applied either by the monitor or
the graphics card. Does this mean that the image produced by CRT monitors was
similarly blurry in all these different resolutions and people just had to
cope with it?

Not at all! One of the big benefits of CRTs over flat-screen displays
is that they have _no fixed resolution!_ Shocking, huh? They can essentially
operate at _any_ resolution (within certain limits), and the image will look
sharp in all of them (sometimes a bit less sharp at the highest resolutions,
but still sharp enough). Even the upper limit is a soft-limit, dependent on
the quality of the monitor's analog circuitry, the signal fed to it, and the
specifics of the screen itself.

So how do these magnificent beasts perform their magic? It's easiest to
imagine a CRT as a movie projector. The screen consists of tightly packed
together red-green-blue (RGB) phosphor-triads behind a [shadow
mask](https://en.wikipedia.org/wiki/Shadow_mask), then the focussed beam
emitted by the electron gun behind the screen illuminates these phosphors _a
single "pixel" at a time_, from left to right, top to bottom. If this is
done quickly enough, we get the illusion of a stable picture. The fact that
the phosphors have a power-law luminescence decay after being excited by the
electron gun also helps in maintaining this illusion.

{{< figure name="img/shadow-mask.jpg" nameSmall="img/shadow-mask.jpg" alt="" width="90%" >}}
  
  RGB-triad phosphor arrays in a CRT TV and a PC CRT monitor shown at the same magnification. Left: in-line mask (or slot mask); Right: triad mask (or dot mask) ([source](https://en.wikipedia.org/wiki/Shadow_mask#/media/File:CRT_pixel_array.jpg))

{{< /figure >}}

As you can see from the above image, the RGB-triad phosphor array of PC CRT
monitors is a _lot_ finer than that of regular CRT television sets or home
computer monitors (which are essentially a bit higher quality regular TVs). It
is crucial to understand that _these are not pixels_! **There is never a
direct, one-to-one mapping between the "pixels" of the computer generated
image and these individual RGB phosphor triads!** That is neither possible to
achieve, nor desirable. Whenever a single computer "pixel" gets displayed, the
electron beam illuminates a _number_ of these RGB triads within a small
circular area (the shape of the beam is circular). The diameter of the beam
must be a lot larger than the size of the RGB triads, otherwise you'd get very
bad colour rendition. The beam has a soft-falloff (fact of physics, not much
to do about that), which means parts of adjacent "pixels" are also illuminated
a little bit. This is never completely eliminated, not even on the sharpest
CRT monitors in existence, which has the rather pleasing effects of making the
"pixels" a bit roundish, and adjacent "pixels" blending a little into each other.
You can read a more detailed, extremely well-written explanation of all this
[here](https://retrocomputing.stackexchange.com/a/17298).

The below close-up image of the standard white Windows mouse pointer on a
black background very clearly illustrates all this. Note how the edges of the
"white pixels" gradually fade into blackness---there are no "sharp edges"
anywhere! This "soft-falloff" of "pixels" gives CRT monitors one their most
pleasing characteristics. That's in stark contrast with the clearly
delineated, sharp little rectangles of flat-screen displays.

{{< figure name="img/mouse-cursor-closeup.jpg" nameSmall="img/mouse-cursor-closeup.jpg" alt="" width="35%" >}}

  Extreme closeup of the regular white Windows mouse pointer on a 15" CRT monitor (0.28 mm diagonal dot pich). ([source](https://en.wikipedia.org/wiki/Shadow_mask#/media/File:Shadow_mask_closeup_cursor.jpg))

{{< /figure >}}

On most monitors you had some knobs to tweak the exact size and position of
the image a little bit. You had "width" and "height" controls to squash or
stretch the image vertically and horizontally by about 20-30% "in realtime"
and _completely smoothly_. Again, imagine a movie projector---a movie
projector will never have any "scaling artifacts", the resulting image will
always be completely smooth.

Of course, this simplified explanation is not entirely accurate, but good
enough to gain a working understanding of the basic operating principles of CRT
monitors. If you wish delve deeper, please read
the linked articles in the [CRT technology](#crt-technology) links section. It's a fascinating subject!

### Non-solutions


#### Bilinear interpolation

```ini
[sdl]
fullscreen = true
output = opengl

[dosbox]
force_vga_single_scan = true

[render]
glshader = none
```

#### Nearest-neigbour interpolation

```ini
[sdl]
fullscreen = true
output = openglnb

[dosbox]
force_vga_single_scan = true

[render]
glshader = none
```

#### Fixed integer scaling

Another non-solution is to apply a fixed integer scaling ratio to all
resolutions wholesale. Yeah, just merrily apply 2x or 3x integer scaling to
everything, totally ignoring the pixel aspect ratio, like a barbarian. Fuck
aspect ratio correctness, that's for wimps anyway!


{{< figure name="img/fools.jpg" nameSmall="img/fools.jpg" alt="Don't argue with fools" width="80%" >}}

"Conan strong, brave and TALL! You make Conan look like a stumpy pigmy midget,
Conan chop your head off and stick it on a pike! To Crom! WRRRROAAAR!"

{{< /figure >}}


#### "Pixel-perfect" scaling

"Pixel-perfect" scaling is something you would get when you teach our
favourite barbarian basical fraction arithmethics, and perhaps half of the
alphabet (just enough to be dangerous). I put its name in quotation marks
because it's far from perfect; "aspect ratio imperfect" or "semi-random aspect
ratio" would be a much more fitting description. What this attempts to do is
applying integer scaling with potentially different horizontal and vertical
scaling ratios to maintain the _closest_ aspect ratio to ideal. The keyword
here is _closest_, and I'll explain why this is a rather horrible idea in
practice.

For example, at 1080p you have a 1920&times;1080 resolution to work with in
fullscreen. With pixel-perfect scaling enabled, 640&times;480 would be
upscaled to 1280&times;960 with a perfect 2x scaling factor in both
directions. The pixel aspect ratio of the 640&times;480 mode is 1:1, and we get
perfect little 2x2 squares (in native pixels) in our upscaled image. The intended
aspect ratio has been perfectly preserved, what's not to like?

Well, let's consider 320&times;200 next, the most common resolution used by
DOS games. The smallest integer scaling factors for this are 5x horizontally
and 6x vertically, resulting in a 1600&times;1200 image where the "pixels" are
little rectangles 5 native pixels wide and 6 native pixels tall. Problem is,
that won't fit into 1920&times;1080... So the pixel-perfect shader will do a
rather evil thing next: it will cheerfully pick the "closest" integer scaling
factors that could fit and apply those instead. That will be 4x horizontally
and 5x vertically, resulting in a 1280&times;1000 image---that certainly fits
within 1920&times;1080, but at the cost of screwing up the aspect ratio
slightly; now the image is stretched by 25% vertically instead of the correct
20% stretch (because 6/5 = 1.2, but 5/4 = 1.25).

Oh wait, we're far from done yet! Let's switch to windowed mode and start
resizing it. As we keep changing the window's dimensions, this little wonder
will casually take us through the whole pantheon of different aspect ratios
like it's no big deal at all. Just a few highlights you can hit rather easily:

* 960x800 (1:1.333 PAR)
* 640x400 (1:1 PAR)
* 1920x1400 (1:1.167 PAR)
* 2560x2000 (1:1.25 PAR)
{class="compact"}

Now imagine people posting the resulting screenshots in different aspect
ratios for 320&times;200 content to random websites. If you thought the
current situation was bad where the only incorrect solution was using square
pixels, think again---this is some next level shit!

The name "pixel-perfect" is particularly unfortunate because it implies, well,
perfection. Who does _not_ want that, right? Do you want your graphics to be
_imperfect_? Are you dense or what, huh?

Clearly, this thing could only have been handed down to us by a mischievous
god, a partisan of disorder and chaos such as
[Loki](https://mythopedia.com/topics/loki), hell-bent on inflicting MAXIMUM
CONFUSION on the unsuspecting DOS-gamer populace through the chaotic
inconsistency of this fiendish contraption!

{{< figure name="img/loki.jpg" nameSmall="img/loki.jpg" alt="Loki, harbringer of doom, chaos, and the pixel-perfect shader" width="90%" >}}

"Look at you, hackers! Pitiful, pathetic creatures of meat and bone! You want to solve the aspect ratio problem for once and all? Behold my gift!---I bestow upon thee the dark knowledge of the formidable PIXEL-PERFECT SHADER!"

{{< /figure >}}

I actually regret that it had made its way into DOSBox Staging; maybe we'll
remove it completely in the future, but at least we'll rework it substantially
so it behaves consistently and in a much less confusing manner. The big
problem with it is that is was conceived on two misguided assumptions, one
more wrong than the other: a) that producing the sharpest emulated pixels
possible is desirable (it's not), b) producing the sharpest possible pixels is
more important than getting the aspect ratio right (this is very, _very_ wrong!)

Here's how to enable it if you want to experiment with it, but I most
certainly do not recommend using it.

```ini
[sdl]
fullscreen = true
output = openglpp
```


### Solution 1 --- Sharp bilinear scaling

Luckily for you, you don't need to do any of this calculation yourself because
DOSBox Staging [defaults to aspect ratio correct
output](https://dosbox-staging.github.io/downloads/release-notes/0.75.0/#changed-rendering-defaults)
out of the box. It uses the OpenGL rendering backend by default, applies 4:3
aspect ratio correction, and scales the image using a special "sharp" OpenGL
shader to provide sharp pixels with minimal scaling artifacts even at
non-integer scaling ratios (more on this later).

Note that while the overwhelming majority of DOS games _absolutely_ need aspect
ratio correction enabled, a small minority of games actually require square
pixels to appear as intended by the original artists. We'll discuss these
separately TODO

Sadly, the original DOSBox and other DOSBox forks have always defaulted to
square pixels and this played a major role in ending up with the dire
situation we're in now where most DOS game videos and screenshots on the
Internet are in the wrong aspect ratio. Which brings us to our next topic...

```ini
[sdl]
output = opengl

[render]
glshader = interpolation/sharp
```

### Solution 2 --- Electron beam & phosphor emulation

TODO 




### Viewport restriction

```ini


```


### Refresh rate


## The sorry state of things --- 2023 edition

I've written about this in [great
detail](/2022/04/15/achieving-period-correct-graphics-in-personal-computer-emulators-part-1-the-amiga/#aspect-ratio)
in the first episode that tackled the Amiga, but, unsurprisingly, nothing has
improved since last year. So here we go again...

At least 90% of screen captures and videos of DOS games you can find on the
Internet today misrepresent DOS games as they almost always use a square 1:1
pixel aspect ratio for 320&times;200 content instead of the correct 1:1.2 PAR.
Because of this, these images and videos appear about _17% squashed
vertically!_ While this is a forgivable sin for regular gamers and enthusiasts
(although they really should know better by now), it's completely unacceptable
behaviour from major online game databases such as
[MobyGames](https://www.mobygames.com/) and the [Hall of
Light](https://hol.abime.net/). These websites are very useful resources, no
doubt about that, but they're absolutely not doing their part to promote
aspect-ratio correctness. In fact, their net contribution is _negative_ in
this regard, as they're normalising displaying 200-line content in the wrong
1:1 pixel aspect ratio, confusing people not entirely clear on these issues.

On a related note, I've found that arguing with people who claim aspect ratio
correctness is "subjective" is rather pointless. Often these folks are a lot
more interested in "winning" Internet arguments than learning about the truth
and facts. My advice: don't bother, for they know not what they do.

{{< figure name="img/fools.jpg" nameSmall="img/fools.jpg" alt="Don't argue with fools" width="80%" >}}

The guru pictured above is a big time DOS gamer and knows both the ins and
outs of aspect ratio correctness _and_ the secret of eternal happiness.

{{< /figure >}}


{{< note title="Meet the stumpy Mona Lisa" >}}

The maintainers of MobyGames and the Hall of Light have been called out about
aspect ratio correctness on numerous occasions, but they simply don't care and
show zero interest in improving the situation. Imagine going to a museum and
seeing reproductions of classical paintings on display that are squashed
vertically by 17%! When you bring this up with the curators of the collection,
they just shrug and tell you it's too hard to fix, suggest you to get over it,
then exit stage left for a coffee and cig break... Sure, we're not dealing
with Michelangelo level art here. But these websites are all about gathering
accurate video game related information (well, that's what they say about
themselves), so you'd expect some non-zero level of interest from their
maintainers in preserving historical accuracy in all areas, _including_ the
screenshots.

{{< /note >}}


## IBM PC graphics standards


### Hercules


### CGA


### EGA, PCjr, Tandy


### VGA


## When pixels need to be square


## Further tricks


### Split-fullscreen mode

### Custom CGA palettes


## Future work


## Conclusion




Text mode screenshots
http://steptail.com/guides:text_mode


TODO

The most common monochrome CGA system is probably the IBM 5155. It uses a
composite signal, fed to a monochrome CRT which has NTSC-compatible timing.
This can display about 8 shades of amber.


"No markings" does sound fishy (there is normally at least something on the back) but it really depends. Can this 'supplier' at least tell you what the input jack looks like? 😀
These are the types of monitors you're likely to be dealing with here:

Composite - should work with any CGA card that provides composite output, which includes all IBM ones and most clones. Of course, this one is easily identifiable by the RCA video input.
 
Monochrome TTL (18.4KHz only) - this is the common IBM 5151 type of display; works with MDA/Hercules/"MGA" cards, and with EGA set to mono operation, but *not* with standard CGA. Some clone CGA boards were able to work with these displays, as Scali mentioned, but a standard CGA may actually damage them, so you'd better be quite sure of what you have here.
 
Dual-sync monochrome TTL - less common but shouldn't actually be *that* rare; these should work with standard CGA signals as well as MDA. Compaq's early Portable/Deskpro displays were of this type, among others. My old Turbo XT clone had one of them as well.


All I can say is that the pictures clearly show that the monitor displays a 200-line mode (huge gaps between scanlines, typical of CGA).
So that would imply that it is running on 15.7 kHz timing, which is NTSC/CGA, and not MDA/Hercules.
So I would say that this is not an MDA/Hercules monitor.



---

<section class="links">

## Links, files & further reading

### CRT technology

* [How-To Geek --- What Is a CRT, and Why Don’t We Use Them Anymore?](https://www.howtogeek.com/722863/what-is-a-crt-and-why-dont-we-use-them-anymore/)
* [How-To Geek --- Why Were Old Video Games So Pixelated?](https://www.howtogeek.com/714581/why-were-old-video-games-so-pixelated/)
* [bit-tech.net --- How CRT and LCD monitors work](https://bit-tech.net/reviews/tech/how_crt_and_lcd_monitors_work/1/)
* [History-Computer --- Cathode Ray Tube Explained – Everything You Need To Know](https://history-computer.com/cathode-ray-tube/)

### Commodore monitors

* [Jax --- Commodore 1702](http://www.jax184.com/projects/1702/1702.html)
* [The Silicon Underground --- Monitor for Commodore 64](https://dfarq.homeip.net/commodore-64-monitor/)
* [The Silicon Underground --- Commodore 1702](https://dfarq.homeip.net/commodore-1702/)
* [The Silicon Underground --- Commodore 1084](https://dfarq.homeip.net/commodore-1084-monitor/) 

### IBM PC graphics standards

* [Wikipedia --- IBM Monochrome Display Adapter](https://en.wikipedia.org/wiki/IBM_Monochrome_Display_Adapter)
* [Wikipedia --- Hercules Graphics Card](https://en.wikipedia.org/wiki/Hercules_Graphics_Card)
* [Wikipedia --- Color Graphics Adapter](https://en.wikipedia.org/wiki/Color_Graphics_Adapter)
* [Wikipedia --- Enhanced Graphics Adapter](https://en.wikipedia.org/wiki/Enhanced_Graphics_Adapter)
* [Wikipedia --- Tandy Graphics Adapter](https://en.wikipedia.org/wiki/Tandy_Graphics_Adapter)
* [Wikipedia --- Video Graphics Array](https://en.wikipedia.org/wiki/Video_Graphics_Array)
* [Wikipedia --- Super VGA](https://en.wikipedia.org/wiki/Super_VGA)
* [Wikipedia --- VESA BIOS Extensions](https://en.wikipedia.org/wiki/VESA_BIOS_Extensions)
* [Comprehensive list of all standard BIOS video modes](http://www.columbia.edu/~em36/wpdos/videomodes.txt)

### Evolution of IBM PC graphics

* [IBM --- The birth of the IBM PC](https://www.ibm.com/ibm/history/exhibits/pc25/pc25_birth.html)
* [The Silicon Underground --- First generation IBM PC monitors](https://dfarq.homeip.net/first-generation-ibm-pc-monitors/)
* [DOS Days --- Graphics Cards](http://dosdays.co.uk/topics/graphics.php)
* [DOS Days --- CRT Monitors](http://dosdays.co.uk/topics/monitors.php)
* [DOS Days --- 2D and 3D Graphics Card Technology](http://dosdays.co.uk/topics/graphics_features_pt1.php)

### Deep-dives into interesting IBM PC graphics related topics

* [Nerdly Pleasures --- 320x200 : The Resolution of Choice for the IBM PC ](http://nerdlypleasures.blogspot.com/2013/10/320x200-resolution-of-choice-for-ibm-pc.html)
* [Nerdly Pleasures --- The Saga of 16 Colors ](http://nerdlypleasures.blogspot.com/2014/05/the-saga-of-16-colors.html)
* [Nerdly Pleasures --- Oddball EGA and VGA Resolutions, When the Standard Resolutions Aren't Used](http://nerdlypleasures.blogspot.com/2014/09/oddball-ega-and-vga-resolutions-when.html)
* [Nerdly Pleasures --- The Monochrome Experience - CGA, EGA and VGA ](http://nerdlypleasures.blogspot.com/2014/03/the-monochrome-experience-cga-ega-and.html)
* [Nerdly Pleasures --- IBM PC Color Composite Graphics ](http://nerdlypleasures.blogspot.com/2013/11/ibm-pc-color-composite-graphics.html)
* [Nerdly Pleasures --- CGA and "Intended", "Incidental" and "Just Plain Wrong" Graphics ](http://nerdlypleasures.blogspot.com/2023/01/cga-and-intended-incidental-and-just.html)
* [Nerdly Pleasures --- Monochrome & Hercules Graphics Aspect Ratio and Scaling ](http://nerdlypleasures.blogspot.com/2014/02/monochrome-hercules-graphics-aspect.html)

</section>

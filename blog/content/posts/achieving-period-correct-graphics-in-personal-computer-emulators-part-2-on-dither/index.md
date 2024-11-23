---
title: "Achieving period-correct graphics in personal computer emulators --- Part 2: On Dither"
url:   2022/04/15/achieving-period-correct-graphics-in-personal-computer-emulators-part-2-on-dither
date:  2022-12-05
tags:  [graphics, gaming, shader]
---

## On dither

Several people contacted me over the years after publishing the first version
of this article about the "checkerboard" dither patterns you often see on
Amiga pixel art. They thought the CRT shaders would make those dither patterns
completely disappear. The short answer is no, the shaders won't do that as
that would be inauthentic.

The long answer: these dither patterns are visible on Commodore monitors
connected via analog RGB. Moreover, you can clearly see the dither even on a
Commodore 64 connected to a C= 1084S via S-Video. Hell, you can even see them when
you hook up the C64 to a PAL TV via RF!

Here's the proof!

{{< figure name="img/c64/c1084-c64-alien-syndrome-title.jpg" nameSmall="img/c64/c1084-c64-alien-syndrome-title-small.jpg"
    captionAlign="center" alt="Eye of the Beholder, bloom and glow comparison" width="90%" >}}

  320&times;160 title screen of [Alien
  Syndrome](https://www.lemon64.com/game/alien-syndrome) on the Commodore 64
  connected to a Commodore 1084S monitor via S-Video.

{{< /figure >}}


{{< figure name="img/c64/c1084-c64-geos-demo.jpg" nameSmall="img/c64/c1084-c64-geos-demo-small.jpg"
    captionAlign="center" alt="Eye of the Beholder, bloom and glow comparison" width="90%" >}}

  [geoPaint](https://commodore64.fandom.com/wiki/GeoPaint) (the drawing
  program of the [GEOS](https://commodore64.fandom.com/wiki/GEOS) operating
  system) showcasing the 320&times;200 high-resolution mode of the C64 on a C= 1084S monitor via S-Video.

{{< /figure >}}

Going yet one step further, checkerboard dither patterns are also visible on a
ZX Spectrum connected to a PAL TV via RF! Note I'm *not* talking about
composite, which is a step up from RF; I'm talking about the lowest quality
connection between a home computer and a CRT TV, the lowly coaxial RF input!

TODO

[CRT SCR$ Project](https://archive.org/details/crt-scr-v-0.1_202405)


So what is going on here? Are the disappearing dither patterns yet another
internet myth? Well, yes and no.

On small 13-14" TV sets from the 1980s, dither patterns were greatly softened
over RF as seen on the ZX Spectrum and C64 examples. Note that
17" to 21" TV sets from the 1990s were used for these screenshots;
these bigger screens make the dither appear a little bit sharper.

The dither patterns are clearly visible even on the C64 via S-Video when using
high contrast colour combinations (e.g., black and white on the geoPaint
screenshot above). So naturally the same patterns would be even more visible on an
Amiga connected via analog RGB. But the best Amiga artists used a trick to make the
dither patterns melt away to a certain degree by using low-contrast colour
combinations. If you examine the below Amiga screenshot
carefully, you'll notice there is dithering all over it, but it's only
obviously apparent in the more contrasty areas, such as the skyline between
the two buildings.


{{< figure name="img/amiga/perihelion-dither-crt.jpg" nameSmall="img/amiga/perihelion-dither-crt.jpg" captionAlign="center"
    alt="Perihelion: The Prophecy (PAL, 3&times; scaling)" width="90%" >}}

  [Perihelion: The Prophecy](https://amiga.abime.net/games/view/perihelion-the-prophecy) (PAL, 3&times; scaling)

{{< /figure >}}


So we can conclude dithering was clearly visible when you connected a home
computer to a CRT monitor or TV via any method (analog RGB, S-Video,
composite, or RF). Skillfull artists could make the patterns "blend" a bit
more, and RF connections further softened them, but they never disappeared
completely.

One of the most likely source of this confusion is probably rooted in the
history of the Sega Genesis/Mega Drive and Saturn consoles. These feature a
truly abysmal, super blurry composite output---much blurrier than the
composite signal of contemporary Nintendo consoles, for instance. Some developers
exploited this heavy blur to create interesting transparency effects, knowing
the majority of people hooked up their consoles to their TVs via composite. So
there you go, this is a case of mistakenly generalising the quirk of one
particular console brand to all other consoles and home computers of the era.

Needless to say, dither patterns look even sharper on IBM PC monitors. There
is absolutely _zero blur_ on Hercules, CGA, EGA, and VGA monitors which used
digital signals up until EGA (yep, that's right, predating DVI and HDMI by
_two decades!_)



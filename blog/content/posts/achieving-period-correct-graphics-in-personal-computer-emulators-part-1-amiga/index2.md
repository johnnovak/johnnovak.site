---
title: "Achieving period-correct graphics in personal computer emulators"
date:  2022-04-20
tags:  []
---

## Prologue


I'll have to start this article with a confession: when it comes to emulators,
I've always been a "sharp integer scaling or GTFO" guy. I just never
understood the appeal of deliberately degrading the visuals of a game with
so-called "CRT shaders" when you have a perfectly well-functioning LCD screen
capable of displaying crisp images at high resolutions. Slapping on a TV
shader for nostalgic reasons when playing Super Mario is one thing, but seeing
numerous examples of people applying all sorts of single-scanline shaders
sporting bloom, vignetting, chromatic aberration and whatnot to DOS VGA games
haven't exactly endeared this whole endeavour to my heart. I did own a PC with
a VGA monitor back in the 90s; none of those 14-15" monitors exhibited any
hint of scanlines, and I clearly remember those 320x200 VGA pixels to be fat,
chunky, and above all, *sharp*!

{{< figure name="img/wizardry7.jpg" nameSmall="img/wizardry7.jpg"
    alt="Wizardry VII" >}}

  Artist's impression of [Wizardry VII](https://en.wikipedia.org/wiki/Wizardry_VII:_Crusaders_of_the_Dark_Savant) running on a portable dynamo-operated vacuum-tube colour display from a parallel dimension (unknown author)

{{< /figure >}}

In any case, this topic sort of intrigued me --- in the way you just can't
divert your eyes from something horrific, such as a bloody traffic accident or
something equally gruesome. After perusing a few forums dedicated to people
proudly showing off their CRT shader babies, I could see a pattern
formulating: most of these guys grew up with consoles hooked up to TV sets, and
many of them never actually owned a pre-Windows PC, let alone a home-computer
from the 80s. Combine that with the fact that consoles had enjoyed far greater
popularity in the US compared to Europe, and that the NTSC TV standard
originally introduced in America has about 17% less vertical resolution
(480i) than that of the improved Europen PAL standard (576i), it became evident why so many
of these (presumably American) users have such fondness of clearly visible,
thick scanlines. Applying that look to VGA games doesn't make much sense to
me, but whatever -- that's the look of their childhood I guess, and who I am
to prescribe people how to play their games anyway.


{{< figure name="img/krondor.jpg" nameSmall="img/krondor.jpg"
    alt="Betrayal of Computing History" >}}

  **Betrayal of Computing History** (also known as playing [Betrayal of
  Krondor](https://en.wikipedia.org/wiki/Betrayal_at_Krondor) looking through
  an aquarium, drunk) --- I must tell you, had my VGA monitor produced an
  image like this, I would've chucked it right out of the window... We're not
  even reaching the image quality of a badly misadjusted TV here, which is quite
  an achievement. To focus on the positives, at least scanlines are nowhere to
  be seen.

{{< /figure >}}

Closeup photo of an actual VGA monitor running Monkey Island 1,  Those
pixels look pretty sharp to me.


But then I noticed something quite interesting: while half of the people
claimed that personal computer monitors used to display sharp pixels with no


{{< figure name="img/monkey-island-1-vga.png" nameSmall="img/monkey-island-1-vga.png"
    alt="Monkey Island 1 - VGA" >}}

  Monkey Island 1 (320x200 VGA)

{{< /figure >}}

{{< figure name="img/monkey-island-1-amiga-ntsc.webp" nameSmall="img/monkey-island-1-amiga-ntsc.webp"
    alt="Monkey Island 1 - VGA" >}}

  Monkey Island 1 on Amiga 500 hooked up to a Commodore 1084S monitor (320x200 NTSC) [source](https://www.reddit.com/r/amiga/comments/jdkv9n/monkey_island_on_a_commodore_1084s_in_60hz/)


{{< /figure >}}



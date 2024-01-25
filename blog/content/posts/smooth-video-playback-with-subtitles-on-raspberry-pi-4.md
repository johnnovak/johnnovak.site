---
title: "Smooth video playback with subtitles on Raspberry PI 4"
date:  2021-05-31
tags:  [linux, raspberry pi, libreelec, kodi]
---

{{< toc >}}

## Introduction

A few weeks ago I decided it was time to replace my ageing 2007 Macbook Pro I
had been using for watching movies on my big living room TV with something
newer.  Something that can play H.264 videos without the fan going into
overdrive, and H.265 videos, well, at all... The new [Raspberry Pi
4](https://www.raspberrypi.org/products/raspberry-pi-4-model-b/specifications/)
seemed to fit the bill quite nicely with its hardware decoding support for
H.265 (4kp60) and H.264 (1080p60) video streams.

So it's just a matter of hooking up the TV via HDMI and using VLC that comes
with the Raspberry Pi OS, right? Not so fast. As you can probably guess, it
wasn't that simple...

## The failed attempts

### VLC

[VLC](https://www.videolan.org/vlc/) surely works and can use the Pi's
hardware decoding capabilities out-of the-box, but the deal breaker was the
subtitle support. If subtitles are off, the playback is super smooth, zero
complaints there. But with subtitles turned on, most of the time the image
freezes for about 200ms just before a subtitle would appear. Now, VLC doesn't
exhibit this behaviour on Windows or OS X. I don't know if this is a problem
on Linux in general, but I've seen reports about people having the same issue
on Android.

I suspect the reason why this hasn't been fixed is that some people just
aren't sensitive to it. To me it's very apparent and super jarring, and once
I've noticed it, I cannot unsee it. It certainly ruins the whole movie watching
experience for me, and given English is not my native language, I prefer to
watch movies & TV series with all sorts of weird background noises with
subtitles.

### OMXPlayer

The only other player that supports hardware accelerated video playback on the
Pi 4 is
[OMXPlayer](https://www.raspberrypi.org/documentation/raspbian/applications/omxplayer.md).
It is included in the base Raspberry OS installation as well; it can play
videos smoothly with an even lower CPU load than VLC, but as it doesn't
support displaying subtitles *at all*, I simply can't use it.

### mpv

[mpv](https://mpv.io/) would be another good option if it supported hardware
accelerated decoding, but sadly the `mpv-rpi` package can only decode videos
using the CPU. This results in 50%+ CPU loads with most videos, and just too
many dropped frames and jittery playback to be really usable. Again, for some
people this might be good enough, good for them, but for me anything else than
100% smooth playback is unacceptable (this is what I bought the box for, in
the first place!)

Apparently, some guy came up with a very particular method of compiling mpv
for Raspberry 3 with full hardware decoding support, but the script hasn't
been updated for Pi 4 yet, and no one seems to be up for the task. Maybe
someone will figure it out in the future, but currently mpv on RPi4 is a *no
go* either.

## Kodi

At this point I had exhausted all hardware accelerated players, except for
Kodi. I only needed a simple video player, not a full media center app, but in
my final desperation I thought what the hell, let's give it a go. I installed
the `kodi` package, and to my pleasant surprise, the video playback was
perfectly smooth, with low CPU usage, and the intermittent freezing problem
when subtitles are displayed was gone! It was not all roses, though: the
subtitles were flickering every few seconds, and the UI was super slow (about
2-3 FPS), bordering on the unusable. I guess one could live with flickering
subtitles and the extremely slow UI, but this was far from ideal. Overall,
this was definitely the best solution so far, which was quite disappointing,
given that I wanted to build a dedicated video player box for the next 5+
years...


## The solution --- LibreELEC

Luckily, I somehow stumbled into [LibreELEC (Libre Embedded Linux
Entertainment Center)](https://libreelec.tv/), which is the [JeOS (Just Enough
Operation System)](https://en.wikipedia.org/wiki/Just_enough_operating_system)
version of Kodi. It's basically a minimal Linux system that's only
capable of running Kodi and a few basic services, like SSH.

The installation was super simple: I just downloaded the [SD Card imager
tool](https://libreelec.tv/downloads_new/) from their website, and 15-30 mins
later I had Kodi installed onto my SD card. There was a setup wizard that
walked me through the basic steps on first boot, very user-friendly and well-
thought-out. The partition was automatically resized to the max capacity of
the card after the first boot, that's quite cool too. And the best of all, the
aforementioned issues I experienced when running Kodi under a host OS were
completely gone; the UI was and fast and snappy, and the subtitles were no
longer flickering. Yikes!

One slightly strange thing of note is that the *File Manager* is to be found in the
*Settings* menu (the little cog icon at the top of the screen in the default
skin). It's a classic 2-pane file manager; you select files with the left
mouse button, and bring up the file operations menu on the selected items with
the right button. USB devices get auto-mounted, and if you're the sort of
person who likes to unmount them before disconnecting, you can do so in the
file manager by right clicking on the volume name.

Apart from that, everything was quite intuitive and easy to figure out.
Clearly, they must have spent quite some time coming up with a clean and easy
to use UI.


### Configuration tweaks

Kodi comes with quite sensible defaults, so really there wasn't much tweaking
needed. I made the following configuration changes through the UI:

- LibreELEC
  - Network
    - NTP Servers: *Set it so the time is displayed correctly*
  - Services
    - Enable SSH: *On*
    - SSH Password: *Normally you wouldn't expose the box to the public
        internet, but it's good practice to change it (default is
        `libreelec`)*

- System Settings
  - Display
    - Use limited colour range (16-235): *I recommend disabling this (more on
        this later)*
   - Audio
     - Play GUI sounds: *Never*

- Interface
  - Skin
    - Configure skin...
      - Use slide animations: *Off*
      - *Disable unused main menu items*
    - Zoom: *The edges of the UI were cut off with the default settings, so I
        had to set it to -4%*
  - Regional
    - *Adjust according to your region*
  - Screensaver
    - Wait time: *1 min (don't wanna burn in that nice Panasonic plasma!)*

- Player
  - Language
    - Preferred audio language: *English*
    - Preferred subtitle language:  *English*
    - Colour: *Light grey (the default white is waaaay to bright for a
        properly calibrated TV in a dark room)*
    - Override ASS / SSA subtitles fonts: *Doesn't seem to do anything, but
        one could always hope!*
{class="compact property-tree"}


### Keyboard bindings

The default keyboard bindings are quite good, there's really not much need to
change them. One important thing, however, was missing: VLC and mpv provide
keyboard shortcuts by default for adjusting the subtitle delay, while Kodi
doesn't.  You need to use the mouse and go into the subtitles menu while
watching the video to activate the delay adjustment tool, which is quite
cumbersome.

I tried some plugin for defining custom keyboard shortcuts, but I couldn't get
it to work. What worked in the end was SSHing into the box and changing the
configuration XML at ` ~/.kodi/userdata/keymaps/keyboard.xml` manually.

Adding these two bindings to the `FullscreenVideo` section did the trick:

```
<j>SubtitleDelayMinus</j>
<k>SubtitleDelayPlus</k>
```

### Selecting the correct HDMI output range

Using appropriate HDMI output range settings across the whole chain (e.g.
Raspberry Pi &rarr; AV receiver &rarr; TV) is very important to ensure optimal
picture quality. The theory behind it is described quite well in the [Kodi
video levels and color space
guide](https://kodi.wiki/view/Video_levels_and_color_space).

There are a few important things to note here. Number one, *always* use the
free [AVS HD 709 calibration
videos](https://www.avsforum.com/threads/avs-hd-709-blu-ray-mp4-calibration.948496/),
as described in the guide, and always in your normal movie viewing conditions
(completely dark room in my case). According to the guide,
*Limited/Full/Limited* is the best combo, followed by *Full/Full/Full*, and
*Full/Limited/Limited* is best avoided. My experience was quite different; I
could achieve the best picture quality with the least amount of banding on the
test gradients with **Full/Limited/Limited**, so this is my recommendation (my
guess is that RGB limited (16-235) is the native pass-through mode of the Pi's
Broadcom VideoCore VI GPU). *Full/Full/Full*, while it worked, exhibited
significant banding; and finally *Limited/Full/Limited* (the supposedly best
combo) crushed the blacks so heavily on my setup that it was practically
unusable (it's still a mystery to me why this was the case, though). The moral
of the story is to always use the test videos and only trust your eyes.

The GPU output range is controlled by the `hdmi_pixel_encoding` config
parameter, which defaults to `0` (auto-negotiate). This will probably select
the limited range automatically on typical setups, which might be 
OK, but to really be sure you'll want to set this explicitly in 
both the Pi's boot config (which acts basically as the "BIOS") and in the
TV's settings.

[This guide](https://wiki.libreelec.tv/configuration/config_txt) describes how
you can get access to the `config.txt` file on LibreELEC, and
[here](https://www.raspberrypi.org/documentation/configuration/config-txt/video.md)
you can find the list of valid values for the `hdmi_pixel_encoding` parameter.
In my case, I set it to `1` (RGB limited).


### Some weird issues

I noticed that changing the output range format in the Kodi system settings
makes the *Player* menu and a few other menus disappear (!) from the
*Settings* screen. Well, the good thing is that rebooting Kodi brings it back
:sweat_smile: I have no idea why this is happening, I guess it must be a bug.
In any case, if your *Player* menu has mysteriously disappeared, a system
reboot might just be the ticket...


### Hardware setup

Finally, some words about the hardware setup. I'm using the official Raspberry
power supply; I very much recommend doing so because I had problems with
random Chinese PSUs with my Pi 2 (random reboots, not being able to boot
sometimes, etc.)

If you want a passively cooled setup, you cannot go wrong with the [FLIRC
Raspberry Pi 4 Case](https://flirc.tv/more/raspberry-pi-4-case). It's
inexpensive, well-built, looks stylish, and keeps the Pi sufficiently cool as
the whole metal casing acts as a large heatsink (thermal conductor material is
included). The metal casing doesn't enclose the Pi fully, which might be the
reason why I haven't noticed much WiFi signal degradation (which could be a
problem with all-metal cases).

I'm using a small and inexpensive wireless keyboard and mouse combo; the
keyboard acts a remote controller when watching videos, and the mouse makes
navigating the UI so much easier (I wouldn't want to use Kodi without it).
Make sure you buy one with proper wireless support and *not* Bluetooth; I've
had nothing but trouble with Bluetooth whenever I tried it on any computer...

For the storage, I bought a relatively expensive A2 64GB SanDisk SD card which
I regret, in retrospect. A1 cards are supposed to be faster than A2 ones on
the Pi 4 anyway, but they tend to be out of stock, so I recommend just buying
the cheapest 64GB card you can find because they're all fast enough for video
playback (if you want to store video files on the card, that is, otherwise 32GB or
maybe even 16GB would suffice).


## In conclusion

I'm really happy with LibreELEC now because I bought this little box for video
playback duties only. But I have to say that if LibreELEC didn't exist (or I
didn't stumble upon it), then I would be one disappointed customer; I just
couldn't use the box for what I bought it for! I would never have dreamt 
that VLC, probably the most popular open-source media player, had this weird
subtitle freezing issue *only* on Linux (well, maybe the Raspberry OS is at
fault here, to be fair).

To sum it up, if you're looking for a small, reliable and silent media player
box, I very much recommend the Pi 4 running LibreELEC. But if you want to use
it as a general purpose computer, including watching subtitled videos
*without glitches* (like you can on any cheap Windows laptop), then keep
looking for something else.


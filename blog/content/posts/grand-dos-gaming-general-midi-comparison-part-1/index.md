---
title: "Grand MS-DOS gaming General MIDI comparison --- Part 1"
date:  2023-02-27
tags:  [audio, ms-dos, gaming]
draf:  true
---

<section class="intro">

</section>

{{< toc >}}

You can read all sorts of opinions and claims on the subject over the great
(mis)information source of our time, The Internet, such as:

- The Roland Sound Canvas VA is not bad / it is horribly inaccurate
- Later Sound Canvas modules are preferable to the SC-55 / they are anything but
- The Yamaha modules are superior to the SC-55 / they are inferior
- yamaha S-YXG50 is a 100% identical recreation of the Yamaha MU50 / DB50

As a happy new-found owner of the Roland SC-55 and Yamaha MU80 hardware
modules, and a long-time user of the SCVA, I just had to find out the answer
to these pressing questions!


Unless approached methodically, the likelihood for self-delusion in an
endeavour like this is rather high. And not just that; in order to turn this
exercise into a repeatable process, and to be able to batch-render the
soft-synth versions in faster-than-realtime offline mode, first I needed to
record the MIDI output of the games, then carefully trim them, making sure all
MIDI control messages are left intact and the appropriate GS reset SysEx
messages are sent at the start of every song.


I'm hoping to find answers to the following questions at the end of this
exercise:

1. How accurately does the SC-55 mode of the SCVA emulate the original hardware?

2. How do the later SC-88 and SC-88Pro Roland models perform with game
soundtracks thought to be written for the SC-55?

3. How close does the Yamaha S-YXG50 sound to the Yamaha MU80 hardware?

4. How do the Yamaha modules perform with game soundtracks thought to be
written for the Roland modules?



## MIDI modules used

### Roland Sound Canvas SC-55

The Sound Canvas SC-55 external MIDI module was released in 1991 by Roland as
the successor of their Roland MT-32 family of modules. This was the world's
first synthesiser with General MIDI support, and it quickly established itself
as the de facto standard for high-quality MIDI audio in DOS gaming---a status
that remained largely unchanged until the end of the DOS era.

Apart from supporting the General MIDI standard (GM, in short), the SC-55 also
supports Roland's own General Standard (GS), which extends the General MIDI
instrument list with additional instrument variations, and provides a
standardised mechanism for adjusting chorus and reverb effect parameters.

Most DOS games with a "General MIDI" sound option use in fact not just GM, but
also GS features. Variation instruments are generally avoided---presumably for
better compatibility with GM-only modules---, but per-instrument chorus
and reverb settings are frequently employed. As a result of
this, on GM-only modules that feature no such effects, some compositions may
sound overly dry, lacking in space and ambience. On other GM-only modules that
do feature these effects but don't allow fine-tuning their per-instrument
levels via GS messages, the music might sound as if it was recorded in a cave.

In short, if you want to experience MIDI music in DOS games in their best
form, as their composers' intended, you need a GS compatible device.

I have recently bought an original Roland SC-55 from eBay Japan in near mint
condition--probably retired from a prestigious karaoke bar after decades of
faithful service, entertaining drunk CEOs on the weekends... My unit was
manufactured in 1991; it's one of the earliest revisions without a General
MIDI logo on the front plate (probably because the General MIDI standard
released in 1991 wasn't fully finalised at the time of manufacture). It has
the v1.21 ROM, which is considered to be the overall best version for DOS
gaming.


### Roland Sound Canvas VA soft-synth

Roland's Sound Canvas VA VSTi plugin was released in 201x; it provides a software
recreation of the Roland SC8820 module from 199x. It does not emulate the SC-55
directly, but it can be switched into SC-55, SC-88, and SC-88Pro compatibility
modes, just like the real SC8820.

Although not perfect, this is the closest software recreation of the original
SC-55 as of 2023.


### Yamaha MU80

The Yamaha MU line of MIDI modules was Yamaha's answer to Roland's Sound
Canvas series.

Apart from basic GM support, the MU80 also has a GS compatibility mode that
sounds eerily close to the real Sound Canvas on most source materials. This
clearly couldn't be a mere coincidence; it's quite evident that Yamaha's
intention was to compete with and provide a viable alternative to Roland's
original GS sound modules.

[yamaha-mu80]: https://www.soundonsound.com/reviews/yamaha-mu80
[yamaha-db50xg]: https://www.soundonsound.com/reviews/yamaha-db50xg

Additionally, the MU series also supports Yamaha's vastly superior XG standard
(EXtended General MIDI) which is sadly criminally underutilised in games.
Because of this, we'll only investigate on the GS compatibility mode in this
article.

I happen to be the happy owner of a Yamaha MU80 from 1994, again purchased from eBay Japan.



Sound on Sound - Demystifying Yamaha's XG Soundcards
https://www.soundonsound.com/techniques/demystifying-yamahas-xg-soundcards

Yamaha — Evolution of the MU Series as the Ultimate PCM Tone Generator
https://au.yamaha.com/en/products/contents/music_production/synth_40th/history/column/mu_series/index.html





### Yamaha S-YXG50 soft-synth

In 2003 Yamaha released the Yamaha S-YXG50 VSTi plugin as part of their SOL2
package. The S-YXG50 is a soft-synth recreation of their earlier DB50XG
wavetable add-on card, which is a scaled-down version of their MU50 external
MIDI module, which is in turn a scaled-down version of the MU80, the original
XG module. From a purely DOS gaming perspective, these difference don't really
matter; all of them sound pretty much identical on most content.

In 2016, a Russian programmer created an ultimate [portable VSTi
version][yamaha-s-yxg50] of this soft-synth with the copy-protection removed,
mixing and matching parts from various official Yamaha software releases. The
plugin uses the original 4MB wavetable ROM of the MU lineup, and it sounds
extremely close to the MU80 on most materials. As Yamaha discontinued all
their software products in 2003, this soft-synth can be considered abandonware
for practical purposes.

[yamaha-s-yxg50]: https://veg.by/en/projects/syxg50/


## Recording process

As I'm intending to record lots of game music in the coming years, I think
it's best to document my recording process here for once and all.


### Capturing the MIDI data

- Record MIDI data from the game running in DOSBox Staging via loopMIDI into REAPER.
  The REAPER project was set to fixed 120 BPM and 960 PPQ MIDI event
  resolution, resulting in a MIDI event quantisation of 60 * 1000 / 120
  / 960 = ~0.52 ms.

- Cut recordings into individual songs, perform minimal cleanup where
  necessary, and insert a GS Reset SysEx message at the
  start of them.


#### Notes and exceptions

- **The Elders Scrolls: Arena**: I did not record these in-game but I used 
  the PX DOS utility that can play back XMI MIDI files using the original
  Miles Audio System drivers. Word of warning: this *usually* results in
  identical results, but sometimes the tempo is off (e.g. for Discworld),
  therefore the results *must* always be checked against known-good recordings
  when taking this shortcut!

- **System Shock**: Similarly, I used PX to play the intro tune
  to make the transition to the menu screen at the end smoother.

- **TIE Fighter**: The sound driver lowers the music volume
  during voice-overs even when digital sound is disabled. I edited these
  volume fades out manually while taking care to leave "legitimate" fades
  intact (e.g., during song transitions).

- **Quest for Glory III**: Removed the fade-out at the start of the
  Apothecary's Hut song.

- **Warcraft II**: I imported the official MIDI tracks released by the
  composer into REAPER.

- **Leisure Suit Larry 6**: Edited out the sound effects from the intro music
  because I found them too distracting.

- **Realms of Arkania**: I played back the full intro music with PX because
  the game insists on automatically exiting the intro after a while.

- Some games send copious amounts of MIDI CC (Continuous
  Controller), PC (Program Change), or SysEx (System Exclusive) data alongside
  the first few notes of the composition. This can cause the first note to be
  partially cut off, or can result in various glitches on the first note
  because the sudden surge of these MIDI events take some time to process.
  Perhaps this wasn't a problem on all MIDI modules, especially later ones
  such as the SC-55 mkII, but they're definitely causing issues on my first
  revision SC-55 and MU80.


### Recording the audio

- Sequence the songs on a timeline and record all of them in one go.

- For the hardware recordings, the MIDI data was fed to the device via a
    Midisport 2x2 USB box, and the audio was recorded at 48kHz / 24-bit
    through the interal DAC of a Yamaha MG10XU analog mixer (it can also act
    as an USB audio interface). This is a "prosumer" level, neutral-sounding
    mixer with a flat frequency response and extremely little self-noise (well
    below -96dB FS). The input and master channel faders were at 0dB, and the
    output level of the MIDI modules were adjusted so that the System Shock
    intro music peaks around -3 to -6 dB (the loudest of the bunch). This
    resulted in the output level knobs set to around 70%.

- For the soft-synth VSTs, the audio was rendered in faster-than-realtime using
  REAPER's offline renderer function.


### Post-processing

- Only volume adjustments were performed in post-processing to normalise the
  perceived loudness of the individual songs, plus some fade-outs were added.
  The volume adjustmens were added non-destructively to the REAPER project,
  so the source waveform got scaled only once before the final render.

- Dither was enabled for the final render because of the 24 to 16-bit
  reduction.


## Recordings


## Conclusion




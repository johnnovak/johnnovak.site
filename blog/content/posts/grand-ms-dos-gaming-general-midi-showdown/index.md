---
title: "Grand MS-DOS gaming General MIDI showdown"
date:  2023-02-27
tags:  [audio, gaming, midi, ms-dos]
draf:  true
---

{{< toc >}}

## Introduction

The Roland SC-55 sound module is the undisputed king of mid-late 90s MIDI
music in MS-DOS retro gaming circles. Well, I'm going to dispute that a bit in
the present article, and I'm going to do more than just talk: as a happy new
owner of a real SC-55 and one of its later competitors, the glorious Yamaha
MU80, I'm going to put these two bad boys from the 90s to the test, along with
their software recreation attempts. 

You can read all sorts of opinions and claims on this subject over the great
(mis)information source of our time, the Internet, such as:

- The Roland Sound Canvas VA (SCVA) emulates the SC-55 well
- The SC-55 mode of the SCVA is inaccurate
- The SC-88, SC-88Pro and SC-8820 are superior to the SC-55
- Music composed on the SC-55 sounds wrong on anything else
- The Yamaha modules are much better than anything ever put out by Roland
- The Yamaha S-YXG50 is a 100% identical recreation of the Yamaha DB50XG

And the list goes on... But instead of relying on second-hand information,
anecdotes, and vague personal opinions, I'll present you with high-quality
lossless recordings of no less than 46 classic DOS game soundtracks, each
recorded on 7 different MIDI modules. That's 322 recordings in total, yikes!

Of course, then I'll share my own anecdotal and vague personal opinions on the
matter---whether you ask for it or not---but that's just how it goes, isn't
it? But now at least you'll have the option to ignore what I'm saying and
decide for yourself based solely on the recordings. Moreover, I'll share all
the MIDI files and the REAPER project files with you, so you can create your
own recordings, should you wish to do so.


## Meet the contestants

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

Most DOS games that have a "General MIDI" sound option use in fact not just
GM, but also GS features. Variation instruments are generally
avoided---presumably for better compatibility with GM-only modules---, but
per-instrument chorus and reverb settings are frequently employed. As a result
of this, some compositions may sound overly dry on GM-only modules that
feature no such effects, lacking space and ambience. On other GM-only
modules that do feature these effects but don't allow fine-tuning their
per-instrument levels via GS messages, the music may sometimes sound as if it
was recorded in a cave!

In short, if you want to experience MIDI music in DOS games in their best
form, as their composers intended, you need a GS-compatible device.

I have recently bought an original Roland SC-55 from eBay Japan in near mint
condition--probably retired from a prestigious karaoke bar after decades of
faithful service, entertaining drunk CEOs on the weekends... My unit was
manufactured in 1991; it's one of the early revisions without a General MIDI
logo on the front plate (probably because the General MIDI standard released
in 1991 wasn't fully finalised at the time of manufacture yet). It has the
v1.21 ROM, which is considered to be the overall best version for DOS gaming.


### Roland Sound Canvas VA

{{< figure name="img/roland-sound-canvas-va.png" alt="Roland Sound Canvas VA VSTi plugin" width="480" captionAlign="center" >}}

  Roland Sound Canvas VA VSTi plugin

{{< /figure >}}

Roland's Sound Canvas VA software synthesiser VSTi plugin was first released in
2015. It provides a software recreation of the last members of the Sound
Canvas family, the Roland SC-8820 module from 1999
(a cut-down version of the SC-8850). It does not emulate the SC-55
directly, but it can be switched into SC-55, SC-88, and SC-88 Pro
compatibility modes, just like the real SC-8820.

Although not perfect, this is the closest recreation of the original
SC-55 in software form as of 2023.

| Roland Sound Canvas model | Year of release|
|---------------------------|----------------|
| Roland SC-55       | 1991 |
| Roland SC-88       | 1994 |
| Roland SC-88 Pro   | 1996 |
| Roland SC-8820     | 1999 |


### Yamaha MU80

The Yamaha MU line of MIDI modules was Yamaha's answer to Roland's Sound
Canvas series. The Yamaha MU80 was introduced in 1994 as a competitor to the
Roland SC-88, the successor of the SC-55.

Apart from basic GM support, the MU80 also has an excellent GS compatibility
mode that sounds eerily close to the real Sound Canvas on most source
materials. Additionally, the MU series also supports Yamaha's vastly superior
XG standard (E**X**tended **G**eneral MIDI) which is sadly criminally underutilised in
games. Because of this, we'll only investigate the GS compatibility mode in
this article.

I happen to be the happy owner of a Yamaha MU80 from 1994, again purchased from eBay Japan.


### Yamaha S-YXG50

{{< figure name="img/yamaha-s-yxg50.png" alt="Yamaha S-YXG50 VSTi plugin" width="400" captionAlign="center" >}}

  Yamaha S-YXG50 VSTi plugin

{{< /figure >}}

In 2003, Yamaha released the Yamaha S-YXG50 software synthesiser VSTi plugin
as part of their SOL2 package. The S-YXG50 is a software recreation of their
earlier DB50XG wavetable add-on card, which is a scaled-down version of their
MU50 external MIDI module, which is in turn a scaled-down version of the MU80,
the very first module supporting the XG standard. From a purely DOS gaming
perspective, these differences don't really matter; they're all pretty much
interchangeable when all you care about is games.

In 2016, a Russian programmer created an ultimate [portable VSTi
version](https://veg.by/en/projects/syxg50/) of this soft-synth with the
copy-protection removed, mixing and matching parts from various official
Yamaha software releases. The plugin uses the original 4MB wavetable ROM of
the MU lineup, and it sounds extremely close to the MU80 on most materials. As
Yamaha discontinued all their software products in 2003, the S-YXG50 can be
considered abandonware for practical purposes.


## Recording process

Unless approached methodically, the likelihood of self-delusion or honest
error in an endeavour like this is rather high. Also, in order to
turn this exercise into a repeatable process, and to be able to batch-render
the soft-synth versions in offline mode (faster than real-time), first I
needed to record the MIDI output of the games. That was it's guaranteed that
the same MIDI data was used for all the different 

As I'm intending to record lots of game music in the coming years, I think
it's best to document my recording process here for once and for all.


### Capturing MIDI data

- Record MIDI data from the game running in DOSBox Staging via loopMIDI into REAPER.
  The REAPER project was set to 120 BPM and 960 PPQ MIDI event
  resolution, resulting in a MIDI event quantisation of 60 * 1000 / 120
  / 960 = ~0.52 ms.

- Cut recordings into individual songs, perform minimal cleanup where
  necessary, and insert a GS Reset SysEx message at the
  start of them.


#### Notes and exceptions

- **The Elders Scrolls: Arena** --- I did not record these in-game but I used 
  the PX DOS utility that can play back XMI MIDI files using the original
  Miles Audio System drivers. Word of warning: this *usually* results in
  identical results, but sometimes the tempo is off (e.g. for Discworld),
  therefore the results *must* always be checked against known-good recordings
  when taking this shortcut!

- **System Shock** --- Similarly, I used PX to play the intro tune
  to make the transition to the menu screen at the end smoother.

- **Star Wars: TIE Fighter** --- The sound driver lowers the music volume
  during voice-overs even when digital sound is disabled. I edited these
  volume fades out manually while taking care to leave "legitimate" fades
  intact (e.g., during song transitions).

- **Quest for Glory III** --- Removed the fade-out at the start of the
  Apothecary's Hut song.

- **Warcraft II** --- I imported the official MIDI tracks released by the
  composer into REAPER.

- **Leisure Suit Larry 6** --- Edited out the sound effects from the intro music
  because I found them too distracting.

- **Realms of Arkania** --- I played back the full intro music with PX because
  the game insists on automatically exiting the intro after a while.

- Some games send copious amounts of MIDI CC (Continuous
  Controller), PC (Program Change), or SysEx (System Exclusive) data alongside
  the first few notes of the composition. This can cause the first note to be
  partially cut off or can result in various glitches on the first note
  because the sudden surge of these MIDI events takes some time to process.
  Perhaps this wasn't a problem on all MIDI modules, especially later ones
  such as the SC-55 mkII, but they're definitely causing issues on my first
  revision SC-55 and MU80.


### Recording the audio

- Sequence the songs on a timeline and record all of them in one go.

- For the hardware recordings, the MIDI data was fed to the device via a
  Midisport 2x2 USB box, and the audio was recorded at 48kHz / 24-bit
  through the internal DAC of a Yamaha MG10XU analog mixer which can also
  act as a USB audio interface. This is a "prosumer" level, neutral-sounding
  mixer with a flat frequency response and extremely little self-noise (well
  below -96dBFS).

- The 

{{< figure name="img/sc-55-overdrive-shadow-warrior.png" nameSmall="img/sc-55-overdrive-shadow-warrior.png" alt="Roland SC-55 overdrive behaviour" width="80%" >}}

  Illustration of how the analog output stage of the Roland SC-55 can be
  driven into distortion when setting the output volume knob too high. A
  particularly dynamic segment of the Shadow Warrior intro music was used as
  source material.

{{< /figure >}}

- For the soft-synth VSTs, the audio was rendered in faster-than-realtime using
  REAPER's offline render feature.



### Post-processing

- Only volume adjustments were performed in post-processing to normalise the
  perceived loudness of the individual songs, plus some fade-outs were added.
  The volume adjustments were added non-destructively to the REAPER project,
  so the source waveform got scaled only once before the final render.

- Noise-shaped dither was enabled for the final render because of the 24 to
  16-bit reduction.

{{< figure name="img/reaper-midi-recording.png" nameSmall="img/reaper-midi-recording.png" alt="Roland Sound Canvas VA VSTi plugin" width="480" captionAlign="center" >}}

  This is how the REAPER project looked like once all recording tasks had been
  completed. Note the volume automation curve of the master track at the top;
  this is to ensure the same perceptual loudness of all tracks.

{{< /figure >}}


## Recordings


## Quick impressions

Just some quick notes about my preferences as I'm listening to the recordings
while switching between the Yamaha MU80 and various Roland Sound Canvas
versions. Of course, if you just wake up in the morning with "fresh ears",
pick one of the modules at random, then go play some games, none of these
relatively small differences would really jump out---your ears would just get
used to the general tonal signature of that model, and that's it. I guess this
is one of the drawbacks of A/B comparisons and I kinda get why some people
are against them; it's unavoidable that you become hyper-focused on the
differences. So read the below notes with that in mind, but this is as
"objective" and "scientific" as I can make it.

<style>
h4 span {
  font-size: 88%;
  font-weight: 600;
  color: #fff;
  padding: 0.15em 0.55em;
  border-radius: 0.25em;
  margin-left: 0.3em;
  letter-spacing: 0.025em;
}
h4 span.roland {
  background: teal;
}
h4 span.yamaha {
  background: darkorange;
}
</style>

#### Discworld (1995) <span class="yamaha">Yamaha MU80</span>

I prefer the MU80 by far; it sounds a lot fuller than the Sound Canvas, and
the higher-quality reverb of the Yamaha really brings the relatively sparse
arrangements to life. The SC-55 sounds tinny in comparison; its
over--prominent midrange gets annoying after a while on the woodwind-heavy
music. This is improved in the SC-88 version, but I just find the *hardware*
MU80 a lot more pleasant to listen to. The loss of sparkle is very noticeable
on the harpsichord parts on the S-YXG50, and with the more pronounced
midrange, we're one step closer to the nasal SC-55 territory...

<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/01-discworld-alley-%28mu80%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>
<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/02-discworld-dining-room-%28mu80%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>
<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/03-discworld-kitchen-%28mu80%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>
<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/04-discworld-outside-of-unseen-unversity-%28mu80%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>

<hr>

#### Descent (1995) <span class="yamaha">Yamaha MU80</span>

The Yamaha really shines on electronic music, and these tracks are no
exception. The drums and bass are massive compared to the rather wimpy SC-55
rendition. Surprisingly, the SC-88 version sounds almost as good as the Yamaha
(but not the SC-88Pro rendition which has far too many different sounding
instruments).

<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/05-descent-l12-callisto-tower-colony-%28mu80%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>
<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/06-descent-intro-%28mu80%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>
<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/07-descent-l01-lunar-outpost-%28mu80%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>

<hr>

#### Azrael's Tear (1996) <span class="roland">Roland SC-55</span>

Although the MU80 version sounds more expansive and spacious, the
smaller-sounding SC-55 rendition has a more intimate feel that fits the game's
atmosphere a lot better. Also, the music was composed for the SC-55. This is
one of the tracks where you can spot some instruments sounding different on
the S-YXG50 compared to the hardware. Specifically, the flute on the
soft-synth is really annoying, whereas on the MU80 it's quite
beautiful-sounding.

| <!-- --> | <!-- --> |
|----------|----------|
| Azrael's Tear --- Ingame | <audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/08-azraels-tear-ingame-%28sc-55%29.mp3"> Your browser does not support the <code>audio</code> element.</audio> |
{.audio}

<hr>

#### Doom (1993) <span class="roland">Roland SC-88Pro</span>

This is the *single* track of all that sounds best on the SC-88Pro! The other
Sound Canvas modules are OK too, but they lack bass and impact compared to the
SC-88Pro. The Yamaha has over-prominent drums which gets a bit annoying.

| <!-- --> | <!-- --> |
|----------|----------|
| Doom - E1M1 | <audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/09-doom-e1m1-%28scva-sc-88pro%29.mp3"> Your browser does not support the <code>audio</code> element.</audio> |
{.audio}

<hr>

#### Quest for Glory III (1992) <span class="roland">Roland SC-55</span>

The more lo-fi presentation of the SC-55 gives this soundtrack a certain
charm, plus it sounds more balanced on the Roland. The SC-88 rendition is also
very good, and so is the MU80; the Yahama just makes it sound a bit *too*
polished and modern for my taste.

<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/10-quest-for-glory-3-credits-%28sc-55%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>
<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/11-quest-for-glory-3-apothecary%27s-hut-%28sc-55%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>

<hr>

#### Sam & Max: Hit the Road (1993) <span class="roland">Roland SC-55</span>

Better overall balance on the SC-55, and the drums sound like a rock/metal
drummer's idea of jazz drumming on the Yamaha... Not a big fan of the sax
samples on the Yamaha either, too nasal. Later Sound Canvas models introduce
various balance issues (e.g., the double-bass sounds too forward).

<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/12-sam-n-max-intro-%28sc-55%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>

<hr>

#### Shadow Warrior (1997) <span class="yamaha">Yamaha MU80</span>

The Yamaha sounds a lot better on this modern prog-metal-styled material. The
SC-55 is quite tinny in comparison and you can barely hear the drums.

<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/13-shadow-warrior-ingame-%28mu80%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>
<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/14-shadow-warrior-intro-%28mu80%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>

<hr>

#### Space Quest V: The Next Mutation (1993) <span class="yamaha">Yamaha MU80</span>

Even though originally composed on the SC-55, the music sounds more balanced
on the Yamaha. It tames the sometimes over-prominent midrange of the SC-55,
and I prefer the deeper bass of the MU80.

| <!-- --> | <!-- --> |
|----------|----------|
| Space Quest V --- Game Over | <audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/15-space-quest-5-game-over-%28mu80%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>
| Space Quest V --- Intro | <audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/16-space-quest-5-intro-%28mu80%29.mp3"> Your browser does not support the <code>audio</code> element.</audio> |
| Space Quest V --- StarCon Academy | <audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/17-space-quest-5-starcon-academy-%28mu80%29.mp3"> Your browser does not support the <code>audio</code> element.</audio> |
| Space Quest V --- StarCon Aptitude Test | <audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/18-space-quest-5-starcon-aptitude-test-%28mu80%29.mp3"> Your browser does not support the <code>audio</code> element.</audio> |
{.audio}

<hr>

#### System Shock (1994) <span class="yamaha">Yamaha MU80</span>

Yamaha all the way! It's not even a contest. The hardware MU80 really makes a
difference over the S-YXG50 on these tracks again -- the soft-synth sounds
pretty flat and too "polite" in comparison.

<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/19-system-shock-intro-%28mu80%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>

<hr>

#### Star Wars: TIE Fighter - Collector's CD-ROM (1995) <span class="yamaha">Yamaha MU80</span>

The Roland and Yamaha renditions are very close to each other. The Yamaha has
more bass, sounds more epic, and therefore is my preference.

<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/20-tie-fighter-intro-%28mu80%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>

<hr>

#### The Elder Scrolls: Arena (1994) <span class="roland">Roland SC-55</span>

The combat track sounds better and more monumental on the Yahama, and the much
higher-quality reverb of the Yamaha really makes a difference. But some of the
synth patches sound way too different on the two modules, which markedly
changes the atmosphere of the dungeon music---for the worse on the MU80. The
pieces featuring a full orchestra also sound better balanced on the SC-55.

| <!-- --> | <!-- --> |
|----------|----------|
| The Elder Scrolls: Arena --- Combat | <audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/21-arena-combat-%28sc-55%29.mp3"> Your browser does not support the <code>audio</code> element.</audio> |
| The Elder Scrolls: Arena --- Dungeon 1 | <audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/22-arena-dungeon1-%28sc-55%29.mp3"> Your browser does not support the <code>audio</code> element.</audio> |
| The Elder Scrolls: Arena --- Raining | <audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/23-arena-raining-%28sc-55%29.mp3"> Your browser does not support the <code>audio</code> element.</audio> |
| The Elder Scrolls: Arena --- Swimming | <audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/24-arena-swimming-%28sc-55%29.mp3"> Your browser does not support the <code>audio</code> element.</audio> |
{.audio}

<hr>

#### Gabriel Knight: Sins of the Fathers (1993) <span class="yamaha">Yamaha MU80</span>

Originally composed for the SC-55, but it sounds a lot better on the Yamaha.
The weak bass and overall tinny character of the Roland is painfully obvious
here. Switching from the MU80 version to the SC-55 makes you think you're now
listening to the music on an old portable radio!

<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/25-gabriel-knight-intro-%28mu80%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>
<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/26-gabriel-knight-bookstore-%28mu80%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>
<audio controls="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/27-gabriel-knight-map-%28mu80%29.mp3" src=""> Your browser does not support the <code>audio</code> element.</audio>

<hr>

#### Death Gate (1994) <span class="yamaha">Yamaha MU80</span>

I find the MU80 version more pleasant to listen to because of the more
recessed midrange. Some of the flute sounds get ear-piercing on the SC-55.

<audio controls="" src="https://archive.org/download/dosbox-staging-v0.79.0-reverb-and-chorus/alone-in-the-dark.mp3"> Your browser does not support the <code>audio</code> element.</audio>

<hr>

#### Betrayal at Krondor (1993) <span class="roland">Roland SC-55</span>

The tonal balance is best on the SC-55, and the marching snare drums are too
loud on the Yamaha. Some instruments sound really weird on later Sound Canvas
models.

<audio controls="" src="https://archive.org/download/dosbox-staging-v0.79.0-reverb-and-chorus/alone-in-the-dark.mp3"> Your browser does not support the <code>audio</code> element.</audio>

<hr>

#### WarCraft II: Tides of Darkness (1995) <span class="yamaha">Yamaha MU80</span>

Originally composed for the SC-88, but it sounds far cleaner and a lot more
impactful on the MU80. The better quality reverb of the Yamaha really brings
orchestral compositions such as this one to life.

<audio controls="" src="https://ia601600.us.archive.org/26/items/DOS-Gaming-General-MIDI-Comparison/32-warcraft-2-human2-%28mu80%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>
<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/33-warcraft-2-orc1-%28mu80%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>

<hr>

#### Duke Nukem 3D (1996) <span class="roland">Roland SC-55</span>

Best on the real SC-55. The drums are waaaaay too loud on the MU80 and
everything else is off balance too in a rather bad way. The drum samples sound
different on the SC-55, for the worse, and the renditions of all later Sound
Canvas modules sound hilariously bad.

<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/34-duke-nukem-3d-grabbag-%28sc-55%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>
<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/35-duke-nukem-3d-stalker-%28sc-55%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>

<hr>

#### Leisure Suit Larry 6: Shape Up or Slip Out! (1993) <span class="yamaha">Yamaha MU80</span>

The deeper tonal character of the Yamaha fits the music very nicely. The flute
is a little bit on the loud side in the lobby music, but I can live with that.
That's on real hardware; the flute sample on the Y-SXG50 sounds so annoying
that I prefer the SCVA SC-55 version. I don't like the renditions of later
Sound Canvas models at all.

<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/36-leisure-suit-larry-6-intro-%28mu80%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>
<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/37-leisure-suit-larry-6-lobby-%28mu80%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>

<hr>

#### Transport Tycoon Deluxe (1995) <span class="roland">Roland SC-55</span>

The balance is pretty much perfect on the SC-55, while the heavier-hitting
drums of the MU80 are just too much. All later Sound Canvas models make this
music sound bad in different ways...

<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/38-transport-tycoon-deluxe-intro-%28sc-55%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>

<hr>

#### Under a Killing Moon (1994) <span class="roland">Roland SC-55</span>

The soundtrack is so perfectly balanced for the SC-55 that it just sounds
wrong on anything else. The Yamaha in particular manages to make the _Tex's
Office_ track sound out of tune, which is impressive in itself...

<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/39-under-a-killing-moon-tex%27s-office-1-%28sc-55%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>
<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/40-under-a-killing-moon-chandler-avenue-1-%28sc-55%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>
<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/41-under-a-killing-moon-rook%27s-pawnshop-1-%28sc-55%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>

<hr>

#### Stonekeep (1995) <span class="yamaha">Yamaha MU80</span>

I prefer the deeper and darker sound of the MU80 version, but it's not a night
and day difference. This is one of the soundtracks that sounds good on any of
the MIDI modules.

<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/42-stonekeep-demo-%28mu80%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>
<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/43-stonekeep-the-ruins-of-stonekeep-1-%28mu80%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>
<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/44-stonekeep-the-ruins-of-stonekeep-2-%28mu80%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>

<hr>

#### Realms of Arkania: Star Trail (1994) <span class="yamaha">Yamaha MU80</span>

This was clearly composed for the SC-55, but I like the darker, more
realistic, and more modern-sounding rendition of the MU80, hence that's my
preference.

<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/45-realms-of-arkania-2-intro-%28mu80%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>
<audio controls="" src="https://archive.org/download/DOS-Gaming-General-MIDI-Comparison/46-realms-of-arkania-2-ingame-%28mu80%29.mp3"> Your browser does not support the <code>audio</code> element.</audio>

<hr>

So what does that gives us? 12 votes for the Yamaha and 9 for the Roland.
That's more than a slight bias towards the Yamaha. Hmmmm, interesting!


## Final verdict

Okay, ready for the grand finale? I'm certain you can hardly wait for the
final conclusions: which one sounds best? which one should I get?

... <insert gif>

ALL OF THEM!

... <insert troll>

But seriously, if you can get hold of just *one* of these MIDI modules, either
software or hardware, you'll get lots of enjoyment out of it.

Yes, some fare better with certain games than others, there's no denying that.
But the thing is, if you use the same single module for all your DOS gaming,
you just won't know any better, and you won't notice anything particularly
wrong with the majority of game soundtracks. Also remember that these were
expensive devices back in the day, usually costing upwards of 500 USD. You
could consider yourself lucky for the privilege of owning one; hoarding all
the General MIDI modules under the sun is a relatively new phenomenon in
retro-gaming circles.

While I can certainly detect some differences between the modules when
seamlessly A/B comparing them without pausing the audio, I'd be hard-pressed
to correctly identify them in a blind listening test. Even more so when I'm
just enjoying a game and my focus is split between the music, the graphics,
and the actual gameplay.

Anyway, here are my observations---I just wanted to include the above
disclaimer because now we're getting into serious audiophile cork sniffer
territory! 

### Roland SC-55 vs Roland Sound Canvas VA

Contrary to what Internet hearsay would make you believe, the Roland Sound
Canvas VA is an excellent substitute for the real SC-55. Technically, it
does not directly emulate the SC-55 but the much later SC-8820 module, which
has an SC-55 emulation mode. This doesn't matter much though because it just
sounds stellar and very true to the real SC-55.

Some specific observations:

- The SCVA in SC-55 mode uses the same samples as the hardware module---for the
  most part. One of the ride cymbals sounds different; you can catch this by
  A/B comparing the rock/metal-oriented Doom, Duke Nukem 3D, and Shadow
  Warrior soundtracks. It's very insignificant, though, and by no means sounds
  worse, only different. Apart from this minor detail, I could not notice any
  other differences in the samples.

- The analog output stages of the hardware unit give it a certain character that the
  SCVA doesn't replicate as it does not seem to perform any analog emulation
  (it's just a digital sample player). This is most noticeable in full-range
  music that fills the whole frequency spectrum from the deep bass region to
  the very high end (typically the more synth-oriented and rock/metal tracks).
  Try A/B comparing the System Shock intro music on a good pair of headphones,
  the difference is quite obvious there. I'm pretty sure what we're hearing is
  the effects of some subtle saturation distortion the relatively low-cost
  analog output stages impart to the sound. Subjectively, this results in a
  tighter bottom end, wider stereo image, and a more spacious and "3D"
  sound.[^digital-out]

[^digital-out]: Many synths and samplers, especially from the 90s, feature
  both analog and digital SPDIF output connections, and quite a few people
  prefer the sound of their analog output. The digital signal often sounds a
  lot colder and thinner in comparison without those euphonic non-linearities
  imparted by the analog output stages. This is something I have personally
  noticed between the analog and digital outputs of the Sound Blaster AWE32.
  In fact, people in studio circles have been using various analog equipment
  as subtle (and sometimes not so subtle) distortion boxes for decades because
  they simply make everything you send through them more exciting in a
  larger-than-life way. A caricature is always more interesting than reality.
  "Pegging the meters", and "driving things into the red" are staple
  techniques in the production of pretty much all popular musical genres,
  except for some forms of acoustic music, perhaps (and classical, but that's
  hardly popular).

- Rarely, some effects are not applied correctly, e.g., the synth bass
  in the System Shock intro track sounds completely mono on the SCVA, whereas
  it has a nice stereo width due to the chorus effect of the SC-55. However,
  this is a very rare occurrence; on most soundtracks, the effects are exactly
  the same on all instruments.


### Roland SC-55 vs later Roland models

Some people claim that later DOS games sound better on the SC-88 because that
was supposedly more widespread in the second half of the 90s. That's a nice
theory but there's not much to back up that claim. First of all, many later
DOS-era games released after 1995 have been confirmed to be composed for the SC-55
(e.g. Azrael's Tear (1996), Duke Nukem 3D (1996) and Stonekeep (1995)).
Secondly, these were expensive devices; people who already owned an SC-55 were
unlikely to upgrade it to the SC-88 for marginal benefits, and game developers
had to cater for the least common denominator, which was the original SC-55.


### Roland SC-55 vs Yamaha MU80


### Yamaha MU80 vs Yamaha S-YXG50


---

<section class="links">

## Links & further reading

### Soft-synths

* [Roland --- Sound Canvas VA](https://www.rolandcloud.com/catalog/legendary/sound-canvas-va?lang=en-us)

* [Yamaha S-YXG50 Portable VSTi](https://veg.by/en/projects/syxg50/)

### Reviews

* [Sound On Sound --- Roland Sound Canvas SC-55 review (from 1991)](https://www.muzines.co.uk/articles/roland-sc55-sound-canvas/7496)

* [Sound On Sound --- Roland Sound Canvas SC-88 review (from 1997)](https://www.soundonsound.com/reviews/roland-sound-canvas-sc88)

* [Sound On Sound --- Roland Sound Canvas SC-8850 review (from 1999)](https://www.soundonsound.com/reviews/roland-ed-sc8850-sound-canvas)

* [Sound On Sound --- Yamaha MU80 review (from 1995)](https://www.soundonsound.com/reviews/yamaha-mu80)

* [Sound On Sound --- Yamaha DB50XG review (from 1996)](https://www.soundonsound.com/reviews/yamaha-db50xg)

* [Sound On Sound --- Demystifying Yamaha's XG Soundcards (from 1998)](https://www.soundonsound.com/techniques/demystifying-yamahas-xg-soundcards)

* [Yamaha --- Evolution of the MU Series as the Ultimate PCM Tone Generator](https://au.yamaha.com/en/products/contents/music_production/synth_40th/history/column/mu_series/index.html)

</section>


---
title: "Grand MS-DOS gaming General MIDI showdown"
date:  2023-03-05
tags:  [audio, gaming, midi, ms-dos]
draf:  true
---

{{< toc >}}

## Introduction

The Roland SC-55 sound module is the undisputed king of mid-late 90s [General
MIDI](https://en.wikipedia.org/wiki/General_MIDI) music in MS-DOS retro gaming
circles. Well, I'm going to dispute that a bit in the present article, and I'm
going to do more than just talk: as a happy new owner of a real SC-55 and one
of its later competitors, the glorious Yamaha MU80, I'm going to put these two
bad boys from the 90s to the test, along with their software recreation
attempts.

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
lossless recordings of no less than **46 classic DOS game soundtracks**, each
recorded on **7 different MIDI modules!** That's 322 recordings in total, yikes!

Of course, then I'll share my own anecdotal and vague personal opinions on the
matter---whether you ask for it or not---but that's just how it goes. But now
at least you'll have the option to disregard what I'm saying and draw your own
conclusions based solely on the recordings. Moreover, I'll share all the MIDI
files and the REAPER project files as well, so you can create your own
recordings, should you wish to do so.


## Meet the contestants

### Roland Sound Canvas SC-55

The [Sound Canvas SC-55](https://en.wikipedia.org/wiki/Roland_SC-55) external
MIDI module was released in 1991 by Roland as the successor of their [Roland
MT-32](https://en.wikipedia.org/wiki/Roland_MT-32) family of modules. This was
the world's first synthesiser with General MIDI support, and it quickly
established itself as the de facto standard for high-quality General MIDI
audio in DOS gaming---a status that remained largely unchanged until the end
of the DOS era.

Apart from supporting the [General
MIDI](https://en.wikipedia.org/wiki/General_MIDI) standard (GM, in short), the
SC-55 also supports Roland's own [General Standard
(GS)](https://en.wikipedia.org/wiki/Roland_GS), which extends the General MIDI
instrument list with additional instrument variations and drum kit sounds, and
provides a standardised mechanism for adjusting chorus and reverb effect
parameters, among a few other things.

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
form, as their composers intended, you'll need a GS-compatible device.

I have recently bought an original Roland SC-55 from eBay Japan in near mint
condition---probably retired from a prestigious karaoke bar after decades of
faithful service, entertaining drunk CEOs on the weekends... My unit was
manufactured in 1991; it's one of the early revisions without a General MIDI
logo on the front plate (probably because the General MIDI standard released
in 1991 wasn't fully finalised at the time of manufacture yet). It has the
v1.21 ROM, which is considered to be the overall best version for DOS gaming.


### Roland Sound Canvas VA

Roland's [Sound Canvas VA](https://www.roland.com/au/products/rc_sound_canvas_va/) software
synthesiser VSTi plugin was first released in 2015. It provides a software
recreation of the last members of the [Sound
Canvas](https://en.wikipedia.org/wiki/Roland_Sound_Canvas) family, the Roland
SC-8820 module from 1999 (a cut-down version of the SC-8850). It does not
emulate the SC-55 directly, but it can be switched into SC-55, SC-88, and
SC-88 Pro compatibility modes, just like the real SC-8820.

{{< figure name="img/roland-sound-canvas-va.png" alt="Roland Sound Canvas VA VSTi plugin" width="480" captionAlign="center" >}}

  Roland Sound Canvas VA VSTi plugin

{{< /figure >}}

Although not perfect, this is the closest recreation of the original
SC-55 in software form as of 2023.

Because the SCVA can emulate later Sound Canvas modules, and people have made
various claims about them over the years, naturally I'll put all available
models to the test. Knowing the year of introduction of a particular model
*might* give you some hints whether it's suitable for a given game. The
general logic behind this is that in say 1995 most people---including the
composers---likely owned the upgraded SC-88 instead of the original SC-55, so
the music must have been optimised for the module most people had access to.
That's sound reasoning, but I've found little empirical evidence to back up
that claim based on my listening tests, but more on that later. Anyway, here
are the original release dates of the different models:

| Roland Sound Canvas model | Year of release|
|---------------------------|----------------|
| Roland SC-55              | 1991 |
| Roland SC-88              | 1994 |
| Roland SC-88Pro           | 1996 |
| Roland SC-8820            | 1999 |


### Yamaha MU80

The [Yamaha MU-series](https://en.wikipedia.org/wiki/Yamaha_MU-series) MIDI
modules were Yamaha's answer to Roland's Sound Canvas line. The [Yamaha
MU80](https://www.soundonsound.com/reviews/yamaha-mu80) was introduced in 1994
as a competitor to the Roland SC-88, the successor of the SC-55.

Apart from basic GM support, the MU80 also has an excellent GS compatibility
mode that sounds eerily close to the real Sound Canvas on most source
materials. Additionally, the MU series also supports Yamaha's vastly superior
[XG standard](https://en.wikipedia.org/wiki/Yamaha_XG) (E**X**tended
**G**eneral MIDI) which is sadly criminally underutilised in games. Because of
this, we'll only investigate the GS compatibility mode in this article.

While the SC-55 was squarely aimed at the computer hobbyist market, the MU80
is at least a semi-pro sound module that found its way into many studios over
the world. Objectively, it's a much better device; the build quality is much
more solid, and the range and quality of available instruments and effects are
simply a league above the SC-55. But all this is for naught for us DOS gamers
if its GS compatibility mode doesn't sound great! [^yamaha-comparison]

[^yamaha-comparison]: Before anyone reprimanded me that this is an unfair
  comparison, and I should compare the MU80 to the SC-88 or SC88Pro, I'd like
  to point out that Yahama subsequently released a number of cut-down versions
  of the MU80: the consumer-level MU50, and the DB50XG wavetable add-on card
  aimed at computer enthusiasts. As far as I'm aware, these modules sound very
  close or maybe even identical to each other in GS compatibility mode, so the
  comparison to the SC-55 is very much valid.

Is the MU80 a superior piece of studio equipment unsuitable for gaming
purposes? Or can it perhaps outdo Roland at its own thing? Fear not! As I
happen to be the happy owner of a Yamaha MU80 from 1994---again purchased from
eBay Japan---we will find out the answers to these pressing questions!


### Yamaha S-YXG50

In 2003, Yamaha released the Yamaha S-YXG50 software synthesiser VSTi plugin
as part of their SOL2 package. The S-YXG50 is a software recreation of their
earlier [DB50XG](https://www.soundonsound.com/reviews/yamaha-db50xg) wavetable
add-on card, which is a scaled-down version of their
[MU50](https://www.soundonsound.com/reviews/yamaha-mu50-yamaha-cbx-k1)
external MIDI module, which is in turn a scaled-down version of the MU80, the
very first module supporting the XG standard. From a purely DOS gaming
perspective, these differences don't really matter; they're all pretty much
interchangeable when all you care about is games.

{{< figure name="img/yamaha-s-yxg50.png" alt="Yamaha S-YXG50 VSTi plugin" width="400" captionAlign="center" >}}

  Yamaha S-YXG50 VSTi plugin

{{< /figure >}}

In 2016, a Russian programmer created an ultimate [portable VSTi
version](https://veg.by/en/projects/syxg50/) of this softsynth with the
copy-protection removed, mixing and matching parts from various official
Yamaha software releases. The plugin uses the original 4MB wavetable ROM of
the MU lineup, and it sounds extremely close to the MU80 on most materials. As
Yamaha discontinued all their software products in 2003, the S-YXG50 can be
considered abandonware for practical purposes.


## Recording process

Unless approached methodically, the likelihood of self-delusion or honest
error in an endeavour like this is rather high. In order to turn this exercise
into a repeatable process, and to be able to batch-render the softsynth
versions in offline mode (faster than real-time), first I needed to record the
MIDI output of the games. This also ensured that all different MIDI modules
are sent exactly the same MIDI data during the audio recording process.

As I'm intending to record lots of game music in the coming years, I think
it's best to document my recording process here once and for all.


### Capturing MIDI data

- Record MIDI data from the game running in DOSBox Staging via loopMIDI into
  REAPER. The REAPER project was set to 120 BPM and 960 PPQ MIDI event resolution,
  resulting in a MIDI event quantisation of 60 &times; 1000 / 120 / 960 =
  ~0.52 ms.

- Split the continuous MIDI stream into individual songs (when needed), perform
  minimal cleanup if necessary, and insert a "GS Reset" SysEx message at the
  start of each song.


#### Notes and exceptions

- **The Elders Scrolls: Arena** --- I did not record these in-game but I used 
  the [PX Player](https://www.vogons.org/viewtopic.php?f=24&t=37630) DOS
  utility that can play back XMI MIDI files using the original [Miles Sound
  System](https://en.wikipedia.org/wiki/Miles_Sound_System) drivers. Word of
  warning: this *usually* results in identical results, but in rare cases, the
  tempo might be off (e.g., for Discworld). Therefore, the results *must*
  always be checked against the actual in-game music or known-good recordings
  when taking this shortcut!

- **System Shock** --- Similarly, I used PX to play the intro tune
  to make the transition to the menu screen at the end sound smoother.

- **Star Wars: TIE Fighter** --- The sound driver lowers the music volume
  during voice-overs even when digital sound is disabled. I edited these
  volume fades out manually while taking care to leave "legitimate" fades
  intact (e.g., during song transitions).

- **Quest for Glory III** --- Removed the fade-in at the start of the
  Apothecary's Hut song.

- **Warcraft II** --- Imported the official MIDI tracks released by the
  composer straight into REAPER.

- **Leisure Suit Larry 6** --- Edited out the sound effects from the intro music
  because I found them too distracting.

- **Realms of Arkania** --- I used PX for the intro music because
  the game insists on automatically exiting the intro well before the end of
  the tune.

- Some games send copious amounts of MIDI CC (Continuous
  Controller), PC (Program Change), or SysEx (System Exclusive) data right
  before the first notes of the compositions. This sudden surge of MIDI
  messages can take some time to process, causing the first note to be
  partially cut off. Perhaps this wasn't a problem on all MIDI modules,
  especially later ones such as the SC-55 mkII, but they're definitely causing
  issues on my first revision SC-55 and MU80 hardware modules. Softsynths are
  unaffected by this.


### Recording the audio

- Sequence the songs on a timeline, and record all of them in one go.

- For the hardware recordings, the MIDI data was fed to the MIDI modules via a
  Midisport 2x2 USB box, and the audio was recorded at 48kHz / 24-bit
  through the internal DAC of a Yamaha MG10XU analog mixer (it can also act
  as a USB audio interface). This is a "prosumer" level, neutral-sounding
  mixer with a flat frequency response and very little self-noise (well
  below -96dBFS).

- The output knob of the Roland SC-55 was set to 12'o clock; this was the best
  balance between having a good signal level and not driving the module into
  distortion even on high peaks. The Yamaha MU80 could be set a fair bit
  higher; 3'o clock was deemed to be the best position for the Yamaha's output
  knob.

{{< figure name="img/sc-55-overdrive-shadow-warrior.png" nameSmall="img/sc-55-overdrive-shadow-warrior.png" alt="Roland SC-55 overdrive behaviour" width="80%" >}}

  Illustration of how the analog output stage of the Roland SC-55 can be
  driven into distortion when setting the output volume knob too high. A
  particularly dynamic segment of the Shadow Warrior intro music was used as
  source material for these recordings.

{{< /figure >}}

- For the softsynth VSTs, the audio was rendered at faster-than-realtime
  speed using REAPER's offline render functionality.


### Post-processing

- Only volume adjustments were performed in post-processing to normalise the
  perceived loudness of the individual songs, plus some fade-outs were added.
  The volume adjustments were added non-destructively in the REAPER project,
  so the source waveforms got scaled only once before the final render.

- Noise-shaped dither was enabled for the final render due to the 24 to
  16-bit reduction.

{{< figure name="img/reaper-midi-recording.png" nameSmall="img/reaper-midi-recording.png" alt="Roland Sound Canvas VA VSTi plugin" width="480" captionAlign="center" >}}

  This is how the REAPER project looked like once all recording tasks had been
  completed. Note the volume automation curve of the master track at the top;
  this is to ensure the same perceptual loudness of the different tracks.

{{< /figure >}}


## Recordings

All recordings are available at the [Internet Archive](https://archive.org/details/DOS-Gaming-General-MIDI-Comparison).

You can listen to the recordings there online via the web-based audio player,
or you can download the whole pack (almost 6GB), or just the 16-bit / 48kHz FLAC
originals (4.3 GB) or the MP3 conversions (1.1 GB).

The MIDI files and the REAPER project file I used for the recording process
are also available, plus another REAPER project with all the FLAC versions
imported onto separate tracks (one track per MIDI module). I recommend using
that project for A/B listening comparisons; all recordings are time-aligned
and volume-matched, so you can easily switch between the different renderings
while the audio is running using REAPER's [exclusive
solo](https://www.youtube.com/watch?v=hFMsGZHoQdo) functionality
(<kbd>Ctrl</kbd>+<kbd>Alt</kbd>+*Left Click* on the Solo (`S`) button).


## Quick impressions

Now some quick notes about my preferences as I'm listening to the recordings
while switching between the Yamaha MU80 and various Roland Sound Canvas
versions.

Of course, if you wake up in the morning with "fresh ears", pick one of the
modules at random, then go play some games, none of these relatively small
differences would really jump out---your ears would just get used to the
general tonal signature of that model, and that's it. I guess this is one of
the drawbacks of A/B comparisons, and I kinda get why some people are against
them---it's unavoidable that you become hyper-focused on the differences.
You're effectively *training* yourself to become hyper-focused, and you'll
notice things you normally wouldn't when just enjoying the music. So read the
below notes with that in mind. But anyway, this is as "objective" and
"scientific" as I can make it, and I find making these comparisons a lot of
fun, so here we go!

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

<hr>

#### Discworld (1995) <span class="yamaha">Yamaha MU80</span>

I prefer the MU80 by far; it sounds a lot fuller than the Sound Canvas, and
the higher-quality reverb of the Yamaha really brings the relatively sparse
arrangements to life. The SC-55 sounds tinny in comparison; its
over--prominent midrange gets annoying after a while in the woodwind-heavy
music. This is improved in the SC-88 version, but I just find the *hardware*
MU80 a lot more pleasant to listen to. The loss of sparkle is very noticeable
on the harpsichord parts on the S-YXG50, and with the more pronounced
midrange, we're one step closer to the nasal SC-55 territory...

#### Descent (1995) <span class="yamaha">Yamaha MU80</span>

The Yamaha absolutely shines on electronic music, and these tracks are no
exception. The drums and bass are massive compared to the rather wimpy SC-55
rendition. Surprisingly, the SC-88 version sounds almost as good as the Yamaha
(but not the SC-88Pro version which has far too many different sounding
instruments).

#### Azrael's Tear (1996) <span class="roland">Roland SC-55</span>

Although the MU80 sounds more expansive and spacious on this one, the
smaller-sounding SC-55 rendition has a more intimate feel that fits the game's
atmosphere better (the music was composed for the SC-55). This is one of the
tracks where you can spot some instruments sounding different on the S-YXG50
compared to the hardware. Specifically, the flute on the softsynth is rather
annoying, whereas on the MU80 it's quite beautiful-sounding.

#### Doom (1993) <span class="roland">Roland SC-88Pro</span>

This is the *single* track of all that sounds best on the SC-88Pro! The other
Sound Canvas modules are OK too, but they lack bass and impact compared to the
SC-88Pro. The Yamaha has over-prominent drums which gets a bit annoying. One
notable shortcoming of the SCVA is that it doesn't seem to support proper
cymbal chokes. You can hear that in the intro; the cymbal hits at the start of
the bars don't ring out but stop abruptly on the SC-55 rendition. Yes, that's
absolutely how it's supposed to sound. (Some dudes in some forum theorised
that was a bug in the original SC-55, and the SCVA "fixed it". Because cymbals
"don't do that in real life"...
[You](https://www.youtube.com/shorts/JO4CllpeyRY)
[guys](https://www.youtube.com/watch?v=7YIEGRCjkTs)
[are](https://www.youtube.com/watch?v=duKxQ5VHyyE)
[killing](https://www.youtube.com/watch?v=TEcJ2VtIlnc)
[me!](https://www.youtube.com/watch?v=6vIsTSxL77I) 🤣)

#### Quest for Glory III (1992) <span class="roland">Roland SC-55</span>

The more lo-fi presentation of the SC-55 gives this soundtrack a certain
charm, plus it sounds more balanced on the Roland. The SC-88 rendition is also
very good, and so is the MU80, but the Yahama just makes it sound a bit *too*
polished and modern for my taste.

#### Sam & Max: Hit the Road (1993) <span class="roland">Roland SC-55</span>

Better overall balance on the SC-55 and the drums sound like a rock/metal
drummer's idea of jazz drumming on the Yamaha (for the less musically
inclined: that's not something you want). Not a big fan of the sax samples on
the Yamaha either, too nasal. Later Sound Canvas models introduce various
balance issues (e.g., the double-bass sounds too forward).

#### Shadow Warrior (1997) <span class="yamaha">Yamaha MU80</span>

The Yamaha sounds a lot better on this modern prog-metal-styled material. The
SC-55 is quite tinny in comparison and you can barely hear the drums. Strange
because it was composed for the SC-55. It sounds even worse on the SC-88.
The superiority of the hardware MU80 versus the S-YXG50 is quite evident on a
full-frequency range material like this (the hardware has more sparkle, more
low-end grunt, better stereo image, and a better sense of space).

#### Space Quest V: The Next Mutation (1993) <span class="yamaha">Yamaha MU80</span>

Even though originally composed on the SC-55, the music sounds more balanced
and more "hi-fi" on the Yamaha which tames the sometimes over-prominent
midrange of the SC-55. I prefer the deeper bass of the MU80 too.

#### System Shock (1994) <span class="yamaha">Yamaha MU80</span>

Yamaha all the way! 😎🤘 It's not even a contest! The hardware MU80 oozes
character and makes a big difference over the S-YXG50 once again---the
softsynth version sounds pretty flat and too polite in comparison.

#### Star Wars: TIE Fighter - Collector's CD-ROM (1995) <span class="yamaha">Yamaha MU80</span>

The Roland and Yamaha renditions are very close to each other. The Yamaha has
more bass, sounds more epic, and therefore is my preference.

#### The Elder Scrolls: Arena (1994) <span class="roland">Roland SC-55</span>

The combat track sounds better and more monumental on the Yahama, and the much
higher-quality reverb of the Yamaha can be clearly heard in the sparse
arrangement. But some of the synth patches sound way too different in the
dungeon music compared to the Roland, which markedly alters the
atmosphere---I'd say for the worse. The pieces featuring a full orchestra also
sound better balanced on the SC-55. This soundtrack was composed on the SC-55,
and it sounds best on that module.

#### Gabriel Knight: Sins of the Fathers (1993) <span class="yamaha">Yamaha MU80</span>

Originally composed for the SC-55, but it sounds a lot better on the Yamaha.
The weak bass and overall tinny character of the Roland are painfully obvious
here. Switching from the MU80 version to the SC-55 makes you think you're now
listening to the music on an old portable radio! This is especially apparent
in the menu music.

#### Death Gate (1994) <span class="yamaha">Yamaha MU80</span>

I find the MU80 version more pleasant to listen to because of the more
recessed midrange. Some of the flute sounds get ear-piercing on the SC-55.

#### Betrayal at Krondor (1993) <span class="roland">Roland SC-55</span>

The tonal balance is best on the SC-55. The marching snare drums are too loud
on the Yamaha, and some instruments sound pretty weird on later Sound Canvas
models.

#### WarCraft II: Tides of Darkness (1995) <span class="yamaha">Yamaha MU80</span>

Originally composed for the SC-88, but it sounds far cleaner and a lot more
impactful on the MU80. The better quality reverb of the Yamaha really brings
orchestral compositions such as this one to life.

#### Duke Nukem 3D (1996) <span class="roland">Roland SC-55</span>

Best on the real SC-55. The drums are way too loud on the MU80 and
everything else is off balance too in a rather bad way. The drum samples sound
different on the SC-55---for the worse---and the renditions of all later Sound
Canvas modules sound hilariously bad.

#### Leisure Suit Larry 6: Shape Up or Slip Out! (1993) <span class="yamaha">Yamaha MU80</span>

The deeper tonal character of the Yamaha fits the music very nicely. The flute
is a little bit on the loud side in the lobby music, but I can live with that.
That's on real hardware; the flute sample on the Y-SXG50 sounds so annoying
that I prefer the SCVA SC-55 version. I don't like the renditions of later
Sound Canvas models at all.

#### Transport Tycoon Deluxe (1995) <span class="roland">Roland SC-55</span>

The balance is pretty much perfect on the SC-55, while the heavier-hitting
drums of the MU80 are just too much. All later Sound Canvas models make this
music sound bad in different ways.

#### Under a Killing Moon (1994) <span class="roland">Roland SC-55</span>

The soundtrack is so perfectly balanced for the SC-55 that it just sounds
wrong on anything else. The Yamaha in particular manages to make the _Tex's
Office_ track sound out of tune, which is impressive in itself!

#### Stonekeep (1995) <span class="yamaha">Yamaha MU80</span>

I prefer the deeper and darker sound of the MU80 version, but it's not a night
and day difference. This is one of the soundtracks that sounds good on any
module.

#### Realms of Arkania: Star Trail (1994) <span class="yamaha">Yamaha MU80</span>

This was clearly composed for the SC-55, but I like the darker, more
realistic, and more modern-sounding rendition of the MU80. The SC-55 version
sound s bit too much like computer music compared to the MU80.

<hr>

So what does that gives us? 12 votes for the Yamaha and 9 for the Roland.
That's more than a slight bias towards the Yamaha. Hmmm, interesting!


## Final verdict

Okay, ready for the grand finale? I'm certain you can hardly wait for the
final conclusions: which one sounds "best"? which one should I get?

Well, if you can get hold of just *one* of these MIDI modules, either software
or hardware, you'll get lots of enjoyment out of it. Yes, some fare better
with certain games than others, there's no denying that. But the thing is, if
you use the same single module for all your DOS gaming, you just won't know
any better, and you won't notice anything particularly wrong with the majority
of game soundtracks. Also remember that these were expensive devices back in
the day, usually costing upwards of 500 USD. You could consider yourself lucky
for the privilege of owning one; hoarding all the General MIDI modules under
the sun is a relatively new phenomenon in retro-gaming circles.

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
Canvas VA is an excellent substitute for the real SC-55. Technically, it does
not directly emulate the SC-55 but the much later SC-8820 module, which has an
SC-55 emulation mode. This doesn't matter much though because it just sounds
stellar and true to the real SC-55 for the most part. But it should be also
noted that while good enough for everyday gaming purposes, the Sound Canvas VA
should *not* be the final word when it comes to 100% authenticity (e.g. if you
want to write an authentic SC-55 emulator, the SCVA simply isn't a perfect and
flawless reference implementation).

The real hardware sounds a bit nicer and has a beefier low-end, but this
becomes all very theoretical if you can't get hold of one, don't have the
space for it, or want to play DOS games on a laptop while commuting---the SCVA
will do the job just fine in these scenarios, and you won't be missing out on
much as a gamer.

Some specific observations:

- The SCVA in SC-55 mode uses the same samples as the hardware module---for the
  most part. Some of the drums sound different; you can notice this by A/B
  comparing the rock/metal-oriented Doom, Duke Nukem 3D, and Shadow Warrior
  soundtracks. It's not that significant, though, and by no means sounds
  worse, only different. There are other differences too; for example, the
  string samples are not quite the same either (I find the subjectively
  inferior compared to the real deal), which is apparent when they are playing
  in isolation (e.g., the start of the Daggerfall combat music).

- The analog output stage of the hardware unit gives it a certain character
  that the SCVA doesn't replicate as it does not seem to perform any analog
  emulation (essentially, it's just a fully digital sample player). This is
  most noticeable in full-range music that fills the whole frequency spectrum
  from the deep bass region to the very high end (typically, the more
  synth-oriented and rock/metal tracks). Try A/B comparing the System Shock
  intro music on a good pair of headphones, the difference is quite obvious.
  I'm pretty sure what we're hearing is the effects of some subtle saturation
  distortion the relatively low-cost analog output stages impart to the sound.
  Subjectively, this results in a tighter bottom end, wider stereo image, and
  a more spacious, more "3D" sound.[^digital-out]

[^digital-out]: Many synths and samplers, especially from the 90s, feature
  both analog and digital SPDIF output connections, and quite a few people
  prefer the sound of their analog output. The digital signal often sounds a
  lot colder and thinner in comparison without those euphonic non-linearities
  imparted by the analog output stages. This is something I have personally
  noticed between the analog and digital outputs of the Sound Blaster AWE32.
  People in studio circles have been using various analog equipment as subtle
  (and sometimes not so subtle) distortion boxes for decades because they
  simply make everything you send through them more exciting in a
  larger-than-life manner ("a caricature is always more interesting than
  reality"). "Pegging the meters", and "driving things into the red" are
  staple music production techniques in pretty much all popular musical genres
  going back to the 60s, except for some more "pure" forms of acoustic music
  perhaps (and classical, but that's hardly popular).

- Rarely, some effects are not applied correctly, e.g., the synth bass
  in the System Shock intro track sounds completely mono on the SCVA, whereas
  it has a nice stereo width due to the chorus effect of the SC-55. However,
  this is a very rare occurrence; on most tracks, the effects are very similar
  on all instruments.

- I used the word "similar" on purpose as there are some noticeable subtle
  differences between the SCVA and the SC-55 reverb. On the hardware, the
  reverb has a little bit better sense of space. This is probably due to the
  floating-point versus fixed-point algorithm implementation, or something like
  that (the "magic" of certain digital Lexicon reverb units from the 90s lies
  partly in the various noises and rounding errors introduced by their
  fixed-point algorithms; this might well be the case here too).

- My early revision SC-55 unit has polyphony limits that the SCVA doesn't
  emulate. This manifests in missing or cut notes on some soundtracks; e.g.,
  there's a rapid string run section in the TIE Fighter intro track where only
  the initial notes can be heard on the hardware. Presumably, the music was
  composed on the later SC-55 mkII, which has higher polyphony limits.

- There's some weird quantisation noise as notes fade into silence on
  the SC-55. This is usually not noticeable when the music is constantly
  playing (as it rarely fades into complete silence), so it's not a big deal
  when just playing games (however, it would be when using the module for music
  production). Thankfully, the SCVA does not replicate this quirk.

- The SC-55 is a little bit noisy. It's okay for a consumer unit and it never
  becomes annoying during gaming on headphones, but this would quickly become
  a real problem during studio usage. (Yes, I've eliminated all sources of
  noise, I'm using a high-quality noiseless AC adapter meant for musical
  applications, good-quality cables, and my mixer is effectively
  noiseless---it's definitely the self-noise of the unit).


### Roland SC-55 vs later Sound Canvas models

Some people claim that later DOS games sound better on the SC-88 because that
was supposedly more widespread in the second half of the 90s. That's a nice
theory but there's not much to back up that claim. First of all, many later
DOS-era games released after 1995 have been confirmed to be composed for the SC-55
(e.g., Azrael's Tear (1996), Duke Nukem 3D (1996) and Stonekeep (1995)).
Secondly, these were expensive devices; people who already owned an SC-55 were
unlikely to upgrade to the SC-88 for marginal benefits, and game developers
had to cater for the least common denominator, which was the original SC-55.

But whatever the reasons, I rarely found any use for the SC-88 and later modes
on the SCVA. So while the ability to emulate all these different modules seems
good on paper, in reality, you'll be using the SC-55 compatibility mode almost
exclusively in DOS games.


### Roland SC-55 vs Yamaha MU80

Now things get interesting! The Yamaha MU80 is just a better device---both
objectively and subjectively. The MU80 has a lower noise floor, doesn't suffer
from polyphony issues, has generally higher quality samples, and the chorus
and reverb effects sound noticeably better. The hardware MU80 also has a
certain top-end sparkle and low-end weight and grunt the SC-55 is lacking. It
sounds a little bit like a built-in equaliser curve, but I have to say it
sounds really good on most materials. The resulting sound signature is deeper,
more "hi-fi", and less strident than the mid-heavy, bass-shy SC-55. While the
Roland often sounds very much like computer music (which no doubt has its
charms, I must admit), the MU80 is a big step closer to "CD-quality"
soundtracks (however, I realise some might find the "computer music" quality
of the SC-55 preferable, either due to nostalgic or aesthetic reasons). Also,
the drums are much more prominent on the Yamaha, making electronic and
rock/metal-oriented tracks sound a lot more exciting.

The only problem with the improved samples is that some music specifically
composed for the SC-55 _may_ sound a little bit off-balance on the MU80. In
my experience, this happens far less often than various online sources would
make you believe. Even though many game soundtracks sound different on the
Yahama, I think that's for the better---it's as if the same source material
was given to a different mixing engineer, who then created a final rendition
that is just more impactful, vibrant, and exciting than the SC-55 original.

In rare cases, these changes can make some pieces composed on the SC-55 fall
apart a little bit, but the results are never "unlistenably bad". Jazzy tracks
featuring soft drumming are the most problematic; the Yamaha can make the
drumming sound a bit too heavy-handed at times, and I'm not overly fond of the
sax samples of the Yamaha either. These changes are not ideal, but again, not
disastrous either.

In my view, the improvements the MU80 brings to the table on many soundtracks
are hard to ignore and outweigh these relatively minor and rare issues.
**Overall, if I had to pick a single MIDI module for all my DOS gaming, it would
be the hardware Yamaha MU80, hands down.**


### Yamaha MU80 vs Yamaha S-YXG50

Similarly to the Roland, the real hardware Yamaha MU80 sounds more vibrant,
deep, exciting, spacious, and "3D" than its softsynth counterpart. The
differences are more noticeable than in the case of the Roland modules. The
hardware MU80 has a certain very attractive high-frequency "shimmer" or
"presence" to the sound that the S-YXG50 lacks. The mids are also quite a bit
more recessed, making the sound subjectively more "hi-fi". I find it unlikely
that all these effects can be solely attributed to the analog output stages
like in the case of the SC-55 (although they're certainly partially
responsible for the differences). I would bet on it that Yamaha employed some
"sweetening stage" at the output of the MU80, either digital or analog, that
hasn't been emulated in the softsynth. As noted before, the reverb algorithm
also sounds subtly richer, more spacious, and more "3D".

Apart from these sound signature related differences, at the pure sample
reproduction level, the S-YXG50 is a lot closer to the MU80 than the SCVA is
to the SC-55. I've only noticed two instances where the instruments differ:
one of the flute instruments is quite annoying, loud, and mid-range heavy on
the softsynth (very audible in the Azral's Tear music), and the synth-bass in
the System Shock intro is rather anemic compared to the hardware.

There's one slightly troubling issue with the S-YXG50: on the System Shock and
Shadow Warrior soundtracks, I noticed that sometimes there's some weird
feedback forming on some of the sounds, ultimately culminating in hanging
notes. This is pretty random, but I had to render these two tracks several
times to get a single good take that doesn't exhibit the issue. I haven't
encountered the problem on any of the other tracks, so this is still a bit of
a mystery, and it would need further investigation.

Overall, the S-YXG50 is a stellar free Yamaha MU80 / DB50XG substitute with
very few issues compared to the real hardware. If you're using a VST host that
supports plugin chains, you can slap on an EQ plugin after the S-YXG50 to
approximate the pleasant mid-scooped sound of the hardware, and maybe an
exciter too to add back a little bit of that nice high-end shimmer.


## In closing

So, the Yamaha MU80 got the gold medal! Congratulations, Yamaha! This is good
news because you can just get the ~~free~~"liberated" S-YXG50 VSTi plugin and
enjoy a very faithful MU80 emulation for all your DOS gaming needs.

The SCVA surely sounds nice too and it's pretty close to the real SC-55, but I
imagine Roland's subscription-based payment model where you only "rent" the
plugin could be quite offputting to many people. They also seem to offer a
"Lifetime Key" option (as in the lifetime of Roland, the company, not you, the
customer, if that wouldn't be entirely clear 😎) where you pay a fixed price
upfront and only need to activate the plugin once online... or whenever you
buy a new machine... or install a new OS... or... you get the drift. As you
can tell, I'm not enthusiastic about DRM. It's still a nice plugin for sure,
and I wouldn't mind paying Roland a *one-time* fee for the privilege of using
a *DRM-less* version---but this is what we've got now, and you gotta do what
you gotta do...

About the analog sweetening effects of the hardware boxes, both of them offer
analog audio inputs, so I think I'll experiment with routing some test signals
through them in the hope to find out more about what they're doing to the
output (based on the assumption that the audio in and the synthesised output
share the same signal path).

I hope you found this article and the audio recordings useful! Stay tuned, as
I might put some GS-compatible SoundFonts to the test as well in a future
post using the same MIDI files.

---

<section class="links">

## Recordings, links & further reading

### Files

* [Audio recordings, MIDI files & REAPER projects files](https://archive.org/details/DOS-Gaming-General-MIDI-Comparison)

### Softsynths

* [Roland Sound Canvas VA](https://www.rolandcloud.com/catalog/legendary/sound-canvas-va?lang=en-us)

* [Yamaha S-YXG50 Portable VSTi](https://veg.by/en/projects/syxg50/)

### Reviews

* [Sound On Sound --- Roland Sound Canvas SC-55 review (from 1991)](https://www.muzines.co.uk/articles/roland-sc55-sound-canvas/7496)

* [Sound On Sound --- Roland Sound Canvas SC-88 review (from 1997)](https://www.soundonsound.com/reviews/roland-sound-canvas-sc88)

* [Sound On Sound --- Roland Sound Canvas SC-8850 review (from 1999)](https://www.soundonsound.com/reviews/roland-ed-sc8850-sound-canvas)

* [Sound On Sound --- Yamaha MU80 review (from 1995)](https://www.soundonsound.com/reviews/yamaha-mu80)

* [Sound On Sound --- Yamaha MU50 & Yamaha CBX-K1 review (from 1995)](https://www.soundonsound.com/reviews/yamaha-mu50-yamaha-cbx-k1)

* [Sound On Sound --- Yamaha DB50XG review (from 1996)](https://www.soundonsound.com/reviews/yamaha-db50xg)

* [Sound On Sound --- Demystifying Yamaha's XG Soundcards (from 1998)](https://www.soundonsound.com/techniques/demystifying-yamahas-xg-soundcards)

* [Yamaha --- Evolution of the MU Series as the Ultimate PCM Tone Generator](https://au.yamaha.com/en/products/contents/music_production/synth_40th/history/column/mu_series/index.html)

</section>


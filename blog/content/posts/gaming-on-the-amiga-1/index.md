---
title: "Gaming on the Amiga --- Part 1: Amiga 500 is all you need (mostly)"
date:  2022-11-25
tags:  [amiga, gaming]
---

{{< toc >}}

## Introduction

It appears that the generally accepted "best" way of playing Amiga games these
days is via WHDLoad on an Amiga 1200 expanded with a turbo card and lots of
extra RAM (either emulated or real hardware). I disagree with this notion.

Frankly, this has been bothering me for quite some time. WHDLoad is simply
*not* the magic ultimate solution many people make it out to be, and there are
much simpler ways to play games from the hard drive (especially when using
emulators), if avoiding disk swapping is your goal. WHDLoad has a number of
drawbacks that range from mere annoyances to game-breaking problems. At the
very least, it needlessly complicates things when a much simpler solution
would often suffice, and makes the experience generally inauthentic. The
various glitches and problems might put Amiga games in a bad light for people
new to the platform, and annoy oldtimers like me who are after replicating the
Authentic Original Experience&trade;.


While I agree that grabbing some hard drive image that comes pre-installed
with all WHDLoad games in the known universe is certainly the method that
requires the *least amount of effort* (especially for newcomers who don't want
to learn about the Amiga), I don't think it's the best or ideal way to
experience Amiga games. So in this article series I am going to challenge this
recommendation, explain the reason for WHDLoad's existence, highlight some of
the problems with it, then present a much more authentic (and in my view,
better) way of playing these classic games on a hard drive equipped Amiga 500.
I will focus on setting things up in an emulator (WinUAE), but the method
certainly works on a real computer too.


## Prerequisites

This guide assumes some basic familiarity with the Amiga line of home
computers. If you've never used one of these magnificient machines before, or
if you want to get back into the hobby after several decades without having
used one, I highly recommend reading the excellent [Amiga Beginner's
Series](https://www.amigaretro.com/index.php/page,1.html) first. It covers a
lot of ground quite succintly, and if not everything makes complete sense,
don't worry, I'll explain the important things in more detail later. But you
*need* to understand the basics first, and without a desire to have some basic
level of technical understanding on how the Amigas work, you won't get very
far. Personal computers from the 80s and 90s are not consoles; every user
(including gamers) was expected to have some minimal knowledge of the
hardware to be able to use it effectively.

Another very important thing: Amiga games just look wrong without properly
emulating a period-correct CRT monitor, so I very much recommend referencing
[my earlier
article](/2022/04/15/achieving-period-correct-graphics-in-personal-computer-emulators-part-1-the-amiga/)
on setting up an authentic Commodore 1084S shader setup for WinUAE before
getting started.


## A brief history of the Amiga

The first Amiga ever, the iconic [Amiga
1000](https://en.wikipedia.org/wiki/Amiga_1000) was released in 1985 to the
unsuspecting public, followed by the more budget oriented [Amiga
500](https://en.wikipedia.org/wiki/Amiga_500) in 1987. These were simply the
best home computers money could buy at that time, it was unbelievable --- as
if someone time-travelled [back from the
future](https://mitpress.mit.edu/9780262535694/the-future-was-here/) to bring
the world's first true multimedia computer to us (no, it wasn't the Macintosh,
neither the much later "multimedia Pentium PCs").

The Amiga 500 featured the same Motorola 68000 processor running at 7.14 MHz,
and nearly the same [Original Chip Set
(OCS)](https://en.wikipedia.org/wiki/Original_Chip_Set) as the Amiga 1000. In
Amiga terms, the chipset defines the graphics capabilities of the machine. The
OCS chipset was capable of displaying a palette of up to 32 colours out of
4096 (64 in the special [Extra Half-Brite
(EHB)](https://en.wikipedia.org/wiki/Amiga_Halfbrite_mode) mode, and all
possible colours in [Hold-And-Modify
(HAM)](https://en.wikipedia.org/wiki/Hold-And-Modify), but this was only
utilised in a handful of games). The most common screen modes for games were
320&times;256 (PAL) and 320&times;200 (NTSC), but some made good use of the
640&times;256/200 hi-res resolutions as well.

The other important defining characteristic of an Amiga computer is the
version of the [Kickstart](https://en.wikipedia.org/wiki/Kickstart_(Amiga)),
which is the firmware part of the operating system. This resided in a ROM chip
on the Amiga 500 and later models. Kickstart 1.3 was *the* standard Kickstart
for the Amiga 500, but some early models came with version 1.2. Earlier
versions than that were very buggy beta releases and thus can be safely
ignored.

Now, the Amiga 500 was a tremendous success, it sold several millions of units
worldwide (the exact figure is a never-ending point of contention). It should
be of little surprise then that the overwhelming majority of the Amiga gaming
catalogue was targeting OCS equipped Amigas with 1 MB of RAM running Kickstart
1.3 --- in other words, the ubiquitous Amiga 500, the most popular Amiga model
ever, with a 512k RAM expansion board which was de-facto standard. This is
quite understandable, as the relatively low price point of the Amiga 500 made
it a very attactive choice for parents wanting to buy a personal computer for
their kids (IBM PC compatibles with similar capabilities could easily cost 3
to 5 times more in Europe). And those "similar capabilities" of the PCs
haven't really materialised until about 1989 (with some goodwill), the year
the Sound Blaster 1.0 was released, and it took a few more years for the VGA
adapters (originally released in 1987) to come down in price so ordinary
people on regular salaries could afford them (especially outside of the US).

The next major chipset generation was the [Amiga Advanced Graphics
Architecture
(AGA)](https://en.wikipedia.org/wiki/Amiga_Advanced_Graphics_Architecture)
that found its way into the successor of the Amiga 500 in the budget category,
the Amiga 1200 released at the end of 1992. It was a rather lackluster
incremental upgrade over the OCS and the shortlived ECS chipset (which is
unimportant from a gaming perspective). At this point, Commodore was basically
just playing catchup with the IBM PC compatibles. Although AGA made the use of
256 colours out of a total palette of 16 million possible, similarly to the
VGA standard released in 1987 (note the huge 5 year gap there!), it was an
architectural dead-end. No improvements had been made to the Amiga's sound
capabilities at all (I don't count the removal of the fixed low-pass filter as
an improvement); it was the exact same 4-channel / 8-bit / up to ~28.8kHz
audio the Amiga 1000 introduced in 1985. At the same time, 1992 saw the
release of landmark PC audio cards such as the [Sound Blaster
16](https://en.wikipedia.org/wiki/Sound_Blaster_16) (CD-quality audio, FM
synthesis, optional MIDI daughterboard) and the [Gravis
UltraSound](https://en.wikipedia.org/wiki/Gravis_UltraSound) (CD-quality
audio, 32 channels, hardware mixer, up to 1 MB of sample RAM). From about 1992
onwards, you could no longer proudly recommend Amiga versions of games as the
"best" versions; the PC had simply taken over and became the leading platform.
Amiga ports had become mostly just afterthoughs, ranging from mediocre to
bad. With the eventual demise of Commodore in 1994, developers started to
abandon the platform in droves, and the fate of the Amiga as a mainstream
gaming platform was sealed. One could argue that the final nail in the coffin
was the release of DOOM a bit earlier in 1993, establishing the hugely popular
FPS genre. It was simply impossible to achieve a similarly fast-paced 3D
gameplay on a stock Amiga 1200 with the AGA chipset. Regardless of the
importantce of DOOM in the downfall of the Amiga, the new lines of machines
could simply not keep up with the fast advancements in the 3D accelerated
graphics arena, and that's what most gamers wanted.

All in all, while the Amiga 1000/500 were revolutionary at their inception,
the Amiga 1200 offered only a rather modest evolutionary upgrade to that
classic machine, and overall it was a disappointment. It was too little, and
far too late. Naturally, there are [long forum
threads](https://eab.abime.net/showthread.php?t=86674) discussing this in
painstaking detail, with lots zealotry, name calling, emotions running mile
high, and --- surprisingly! --- even the occasional valuable insight and
factual information there if you're persistent enough (I couldn't muster up
the strength to get past the 21st page myself...) My feelings about the
eventual death-spiral of the Amiga and the [general incompetency of Commodore
management](https://qr.ae/pvf5zR) is summed up pretty well in this comment:

> I was disappointed but it's like being disappointed with one of your family, you ignore the negatives and love it anyway.


## OCS vs AGA

But instead of entering endless subjective debates, let's look at some actual
numbers! Thanks to the [Hall of Light](https://hol.abime.net/) online
database, I was able to collect some statistics on the number of commercially
released Amiga games --- looking at the OCS and AGA numbers separately is
pretty revealing. I've included the
[CD32](https://en.wikipedia.org/wiki/Amiga_CD32) as well; although it was
basically an Amiga 1200 with a CD-ROM (plus the vastly underutilised
[Akiko](https://en.wikipedia.org/wiki/Amiga_custom_chips#Akiko) chip), I think
it warrants its own category. You can check out the raw numbers and the
database queries I used
[here](https://docs.google.com/spreadsheets/d/15eBazUr5dA2aRdaWNpa4Fi-1Coex0sMTH6nY_hDKXF8/edit?usp=sharing).

As we can see, the total number of AGA and CD32 games dwindle in comparison to
OCS:

{{< figure name="img/all-releases.png" nameSmall="img/all-releases.png" alt="Commercial Amiga game releases between 1985--2003" width="100%" captionAlign="center" >}}

{{< /figure >}}

The chart quite nicely illustrates that gaming on the Amiga started in the earnest
in 1988, a year after the affordable Amiga 500 came out. There was a
golden-age period until about 1991/92, after which the number of releases
plummeted due to the increasing popularity of DOS gaming. The release of the
AGA architecture could not reverse this trend; the Amiga 1200 did not sell that
well, and quite understandably, developers were reluctant to target anything
else than the least common dominator, which was still the Amiga 500. The decline
continued until the bankruptcy of Commodore in 1994, after which things took
an even sharper downwards turn. It takes a lot of goodwill *not* to declare the
Amiga officially dead as a mainstream gaming platform by 1997.

These numbers actually put AGA releases into a much better light because most
of them were in fact just rehashes (read: cash-grabs) of earlier OCS games
with minor graphical upgrades. Many people (me included) think the OCS
originals have more character, and are thus the definitive versions. Another
sizable chuck of the AGA releases were phoned-in ports of DOS VGA games. Sure,
back in the day every Amiga owner was happy for whatever they could still get
for their aging platform, but there's very little sense in preferring these
lackluster ports to the genuine article today (apart from historical interest, perhaps), which are the DOS originals.

I am personally not interested in action games much (apart from classic
action-adventures, such as [Another World](https://hol.abime.net/3274), [Flashback](https://hol.abime.net/568), [Rick
Dangerous](https://hol.abime.net/1235) or [Prince or Persia](https://hol.abime.net/1150) that require some thinking apart from quick reflexes), so let's take a closer look at my favourite genres: adventures, strategy games, and RPGs.

There are a handful of AGA ports of these games that have better music on
the Amiga still, and there are the AGA/CD32 exclusives, but both pools are pretty small.
So small that I'll list every single adventure, RPG, and strategy game that
fall into these special categories and are worth playing on the Amiga in my
view.

But first, let's look at the general trends:


{{< figure name="img/adventure-releases.png" nameSmall="img/adventure-releases.png" alt="Commercial Amiga adventure & action adventure releases between 1985--2003" width="100%" captionAlign="center" >}}

{{< /figure >}}


{{< figure name="img/strategy-releases.png" nameSmall="img/strategy-releases.png" alt="Commercial Amiga strategy releases between 1985--2003" width="100%" captionAlign="center" >}}

{{< /figure >}}


{{< figure name="img/rpg-releases.png" nameSmall="img/rpg-releases.png" alt="Commercial Amiga RPG releases between 1985--2003" width="100%" captionAlign="center" >}}

{{< /figure >}}

No big suprises here, but it's quite interesting to see the abrupt drop in the
number of new releases in 1993 in both the adventure and RPG categories. My
guess is that this is the result of major American developers seeing the
writing on the wall and abandoning the platform (a significant portion of the
more cerebral Amiga games were American made).

Finally, here are the results in numeric format:

<table style="width: 70%">
  <caption>Number of commercial Amiga game releases 1985–2003</caption>
  <tr>
    <th width="24%">Percentage</th>
    <th width="19%" style="text-align: right">All</th>
    <th width="19%" style="text-align: right">OCS</th>
    <th width="19%" style="text-align: right">AGA</th>
    <th width="19%" style="text-align: right">CD32</th>
  </tr>
  <tr>
    <td>All genres</td>
    <td style="text-align: right">100.0%</td>
    <td style="text-align: right">89.7%</td>
    <td style="text-align: right">6.5%</td>
    <td style="text-align: right">3.8%</td>
  </tr>
  <tr>
    <td>Adventure</td>
    <td style="text-align: right">13.4%</td>
    <td style="text-align: right">12.4%</td>
    <td style="text-align: right">0.8%</td>
    <td style="text-align: right">0.3%</td>
  </tr>
  <tr>
    <td>Strategy</td>
    <td style="text-align: right">5.5%</td>
    <td style="text-align: right">4.7%</td>
    <td style="text-align: right">0.5%</td>
    <td style="text-align: right">0.3%</td>
  </tr>
  <tr>
    <td>RPG</td>
    <td style="text-align: right">3.1%</td>
    <td style="text-align: right">2.5%</td>
    <td style="text-align: right">0.4%</td>
    <td style="text-align: right">0.2%</td>
  </tr>
  <tr>
    <th width="24%">Totals</th>
    <th width="19%" style="text-align: right">All</th>
    <th width="19%" style="text-align: right">OCS</th>
    <th width="19%" style="text-align: right">AGA</th>
    <th width="19%" style="text-align: right">CD32</th>
  </tr>
  <tr>
    <td>All genres</td>
    <td style="text-align: right">3727</td>
    <td style="text-align: right">3343</td>
    <td style="text-align: right">244</td>
    <td style="text-align: right">140</td>
  </tr>
  <tr>
    <td>Adventure</td>
    <td style="text-align: right">501</td>
    <td style="text-align: right">462</td>
    <td style="text-align: right">28</td>
    <td style="text-align: right">11</td>
  </tr>
  <tr>
    <td>Strategy</td>
    <td style="text-align: right">205</td>
    <td style="text-align: right">174</td>
    <td style="text-align: right">20</td>
    <td style="text-align: right">11</td>
  </tr>
  <tr>
    <td>RPG</td>
    <td style="text-align: right">114</td>
    <td style="text-align: right">93</td>
    <td style="text-align: right">15</td>
    <td style="text-align: right">6</td>
  </tr>
</table>


## Non-OCS adventure, RPG, and strategy games worth playing

Okay, so we have unequivocally established that the target platform
for the overwhelming majority of the Amiga gaming catalogue is the Amiga 500
with the OCS chipset.

But let's have a look at the aforementioned small pool of non-OCS titles that
are still worthwhile to play on the Amiga --- these account for the "(mostly)"
part in the title.

All the games have either official HD installers, can be manually installed
onto the hard drive (Ishar I), or are CD32 versions where you just pop in the
CD and off you go. So neither of them requires WHDLoad (or would be improved
by WHDLoad in any way).

Again, focusing on adventures, RPGs, and strategy games. I don't care about
pure action and shoot'em up stuff, and you really have to be a masochist to
play Amiga ports of VGA-era flight and space simulators on the Amiga 😎

### AGA/CD32 versions of DOS VGA games

Although the below games do have very respectable DOS versions, the Amiga
ports offer something special (usually in the sound department), making them
the preferred option for the true Amiga aficionado:

- [Beneath A Steel Sky](https://hol.abime.net/91) (**CD32**; although the Amiga version has less colours, it's a skillfull conversion, and I much prefer the atmosphere of the slightly grungy Amiga soundtrack)
- [DreamWeb](https://hol.abime.net/432) (**AGA**; that's the uncensored Amiga original, and it has better music)
- [Eye of the Beholder I](https://hol.abime.net/6039), [II](https://hol.abime.net/6040) (**AGA**; the *definitive* fan-made AGA version that combines the superior sound of the Amiga ports with the original 256-colour VGA graphics, plus includes the Amiga-only outro sequence of the first game which was cut from the DOS port)
- [Inherit the Earth](https://hol.abime.net/2864) (**AGA**, **CD32**; I prefer the music in the recently discovered [lost English beta version](https://unofficial-cd32-ports.blogspot.com/2015/02/002-inherit-earth.html) that is actually completable with minor bugs)
- [Ishar I](https://hol.abime.net/2665), [II](https://hol.abime.net/2667), [III](https://hol.abime.net/2669) (AGA; the music is better and completely different in the Amiga versions)
- [Simon the Sorcerer](https://hol.abime.net/1941) (**AGA**, **CD32**; better music on the Amiga, the CD32 version even has voice-acting)
- [UFO: Enemy Unknown](https://hol.abime.net/1790) (**AGA**, **CD32**; the music of the Amiga version was done by the legendary scene musician, 4-Mat, therefore [many people prefer this](https://thecakeisaliegaming.wordpress.com/2017/07/11/remember-amiga-ufo-enemy-unknown/) to the DOS original that has a completely different soundtrack; requires a fast expanded machine to play at acceptable speed)
{class="compact"}


### AGA/CD32 exclusive adventure games

You can only play these on the Amiga --- there are no other options:

- [Sixth Sense Investigations](https://hol.abime.net/4382) (**AGA**, **CD32**)
- [Wasted Dreams](https://hol.abime.net/1674) (**AGA**)
- [onEscapee](https://hol.abime.net/2305) (**AGA**; Flashback style action adventure)
{class="compact"}

### AGA/CD32 exclusive RPGs

As above; no Amiga equals no game for these:

- [Evil's Doom](https://hol.abime.net/3953) (**AGA**; never released officially)
- [Liberation: Captive II](https://hol.abime.net/883) (**AGA**, **CD32**)
- [The Speris Legacy](https://hol.abime.net/2056) (**AGA**, **CD32**; an underwhelming Zelda clone)
- [Trapped](https://hol.abime.net/1499) (**AGA**; requires a fast expanded machine to play at acceptable speed)
- [Trapped 2](https://hol.abime.net/4182) (**AGA**; requires a fast expanded machine to play at acceptable speed)
{class="compact"}

### AGA exclusive strategy games

Slim pickings, all important strategy games were pretty much PC exclusives at
this point:

- [Foundation](https://hol.abime.net/614), [Foundation: Gold](https://hol.abime.net/616), [Foundation: The Directors Cut](https://hol.abime.net/615) (spiritual successor of The Settlers)
- [Total Chaos: Battle At The Frontier Of Time](https://hol.abime.net/3861) (shareware)
{class="compact"}


## WinUAE configurations

So, from all the above we conclude that to be able to play all Amiga games
worth playing, we'll need three base configurations:

Amiga 500 with hard-drive
: This setup will take care of the vast majority of your gaming needs:
    - All OCS games that have official HD installers
    - Many OCS games that do not have HD installers, but can be installed
      onto the hard drive manually quite easily
    - OCS games that can be only run from floppies
    {class="compact"}

Amiga 1200 with hard-drive
: - For the handful of AGA games, which all HD-installable
  - The equally small pool of OCS games where you're better off with WHDLoad
  {class="compact"}

Amiga CD32
: - For the odd CD32 game







## On WHDLoad

First, let me quote what Wikipedia's has to say about [WHDLoad](https://en.wikipedia.org/wiki/WHDLoad) because it's
rather well written:

> The primary reason for this loader is that a large number of computer games
> for the Amiga don't properly interact with the AmigaOS operating system, but
> instead run directly on the Amiga hardware, making assumptions about
> specific control registers, memory locations, etc. The hardware of newer
> Amiga models had been greatly revised, causing these assumptions to break
> when trying to run the same games on newer hardware, and vice versa with
> newer games on older hardware. WHDLoad provides a way to install such games
> on an AmigaOS-compatible hard drive and run on newer hardware. An added
> benefit is the avoidance of loading times and disk swaps, because everything
> the game needs is stored on the hard drive.

Basically, people got fed up with the fact that they couldn't play some of
their old Amiga 500 OCS games on their new AGA machines, and came up with a
solution around 1996, which was WHDLoad. The added benefit was that it also
allowed to run the supported games from the hard drive. Keep in mind that most
people sold their old Amiga 500 and put the money towards buying an Amiga
1200, so for many this was the only option to play those old games.

So far so good, what's not to like? Quite a few things, actually. In order to
work its magic, every supported game needs a so-called WHDLoad "slave" written
for it that can perform a number of interesting things:

- **Patch the game code** so it runs correctly (or rather, with minimal issues) on
  the AGA chipset and faster processors (68020 at 14MHz is the minimum for an
  A1200). Due to the way the game was coded, this is not always possible to do
  100% perfectly, resulting in sync and timing issues in a number of
  WHDLoad conversions.

- **Remove copy protection** from games that used nefarious disk-based 
  protection schemes and/or custom non-DOS disk formats. Although the majority
  of WHDLoad conversions require original uncracked floppy images, removing
  such protections is a necessity and effectively requires cracking the game.
  This comes with all the drawbacks associated with cracking; a bad crack can
  simply render your game unplayable. This is certainly annoying in action
  games and platformers that take a few hours tops to finish (and therefore
  are easy to test by the crackers), but with adventure games and especially
  RPGs that can take anywhere between 20 and 100 hours to complete, a bad crack can
  be catastrophic. Some devious developers had literally woven the protection
  into the fabric of the game's code; it wasn't just a simple
  question/response style manual or code wheel check at the beginning, but the
  protection was *embedded* into the game, so to speak. Moreover,
  there was no indication whatsoever of failing these subtle
  checks, the game did not outright stop or crash but let you keep going for hours
  on end while gradually crippling the experience until it got
  into an unwinnable state, possibly even corrupting or "infecting" your save
  files. Needless to say, very few crackers had spent 50-100 hours to
  complete such games over and over to test their cracks. Here's a few notable
  examples:

[Fate: Gates of Dawn](https://en.wikipedia.org/wiki/Fate:_Gates_of_Dawn), one
of the longest and best RPGs Amiga-exclusive RPG:

> It is notable that from these copies of the game only the copy protection
> but not the password protection was removed. Password requests are not made
> at the start of the game but at intervals in the game repeated after some
> time. Just ignoring these requests or a wrong answer leads not to an abrupt
> end to the game, but gameplay deteriorating until it becomes unplayable.
> Therefore, a copy of the manual is still required for the right code.



The [ingenious](https://tcrf.net/Dungeon_Master_(Amiga)) [protection](https://dmweb.free.fr/?q=node/210) [scheme](https://www.youtube.com/watch?v=VheNpiSZxf0&t=489s) of [Dungeon Master](https://hol.abime.net/441) had received a lot of respect
from crackers back in the day; I took them a year to fully crack the game. The
protection definitely had served its purpose in this particular case!

> Additional anti-piracy checks exist in the code, including further fuzzy bit
> sector reading, checksums, code hidden as images in GRAPHICS.DAT, and other
> fun tricks intended to slow down and frustrate crackers. These respond with
> a delay-action effect [...] It is still possible to complete the game if you
> save progress frequently. These checks only hinder progress rather than
> making the game impossible.


This commenter is probably [reminiscing](https://hackaday.com/2019/06/25/copy-protection-in-the-80s-showcased-by-classic-game-dungeon-master/#comment-6309734) about the copy protection of [Dragonflight](https://hol.abime.net/412):

> There was an Amiga RPG, I think by Thalion that made the game crash when the
> anti piracy was triggered. However some time later there appeared a full
> screen stylized pirate skull over whatever game you had running then. This
> was kind of scary because we thought it was some virus until we realized it
> was the RPG game that keept the skull in RAM even after a reset until you
> turned off your Amiga.


Not an Amiga game, but an [interesting case](https://news.ycombinator.com/item?id=8809505) nonetheless:

> Another copy-protection classic was Spyro: Year of the Dragon:
> http://www.gamasutra.com/view/feature/131439/keeping_the_pir...
>
> This used a multi-layered copy protection scheme. The first layers would
> show a dialog and quit. Later layers got progressively more vicious:
>
> 1. They'd remove 1 out of 10 gems needed to complete a certain level.
>
> 2. They'd randomly corrupt data.
>
> 3. They'd change the UI language at runtime.
>
> Read the post-mortem I linked above; it's really fun. The basic idea was to
> require crackers to play the entire game very carefully, looking for subtle
> side effects that broke game play.
>
> Ultimately, the protection was a success: It took almost 2 months to crack
> the game, resulting in a full Christmas season's worth of sales IIRC.


Okay, so you get the picture. I'm not saying all cracks are bad, but quite a
few were back in the day, I clearly remember that. I just don't have time for
this bullshit anymore, so nowadays I prefer to play uncracked originals if at
all possible, and I recommend you do the same.

Some concrete examples that I've personally encountered with WHDLoad games:

- [Ishar III AGA](): Opening the map takes 4
    seconds, and closing it around 13 seconds in the WHDLoad version. This
    makes the map completely unusable! Bumping up the CPU speed to 50 MHz
    reduces the wait times by about 40%, but it's still slow. Whereas when
    playing the game from floppies or using the included HD installer, opening
    the map is almost instantaneous, and closing it takes less then 2 seconds
    with the stock 14 MHz CPU, which is perfectly usable. Because the game
    contains a HD installer on the first disk, it's a bit perplexing why a
    WHDLoad version even exists in the first place...

- [Pool of Radiance](): Saving the game into a new unused slot takes more than a
    minute during which the screen is mostly black (OS swap, a common theme with
    many WHDLoad games).

- [Lemmings](): The game freezes randomly after about 10-30 minutes of playing
    (probably the result of an incomplete crack). To my knowledge, this issues
    hasn't been rectified as of 2022, which is a shame for such a classic
    title.

- [King's Bounty](): Severe slowdowns, probably due OS swapping. Timings when
    playing the game on a stock Amiga 500 with the manual HD install method:

    - creating a new character -- 47s
    - opening the Puzzle Map -- 5s
    - closing the Puzzle Map -- 2s
    {class="compact"}

    And the WHDLoad timings on a stock Amiga 1200 with 128 MB of RAM (!):

    - creating a new character -- 116s (2.5x slower)
    - opening the Puzzle Map -- 23s (4.6x slower)
    - closing the Puzzle Map -- 8s (4x slower)
    {class="compact"}

    Certain actions in the WHDLoad version are just unacceptably slow! These are
    not the only ones, there's a lot more (e.g. when saving the game), I just
    didn't bother measuring them all...

- [Warhead](): Saving the game takes a long time and the screen keeps flashing
  (OS swap).

- [It Came From the Desert](): Speed and music syncing problems (the music gets cut off before the intro could properly end).

Note that I wasn't looking particularly hard to find these issues. It's just
that I tried a bunch of WHDLoad games, and 



---

<section class="links">

## References & further reading

* [Amiga Beginner's Series](https://www.amigaretro.com/index.php/page,1.html)

[Amiga models](https://www.amigaretro.com/index.php/page,5.html)

* [Jimmy Maher -- The Future Was Here: The Commodore Amiga](https://mitpress.mit.edu/9780262535694/the-future-was-here/)


</section>

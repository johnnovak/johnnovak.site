---
title: "Gaming on the Amiga --- Part 2: Playing floppy games"
url:   2024/01/28/gaming-on-the-amiga-part-1-amiga-500-is-all-you-need
date:  2024-01-28
tags:  [amiga, gaming]
---

{{< toc >}}

## Introduction

TODO


## How games use the memory

Ideally, games should detect the type and amount of available memory (RAM) and make
the best use of it or display an error message if the memory configuration
doesn't meet their minimum requirements.

In practice, almost no game does that---most just crash during loading if their
memory requirements are not met, or appear to work initially, only to
misbehave and crash a few moments later.

System-friendly games that use OS memory routines to detect the available RAM
tend to work fine with all sorts of memory setups. A small but significant
number of those games use the extra memory to enhance the experience---we'll
discuss this in detail later. But some earlier games (and early OCS demoscene
productions, in particular) assume very specific fixed memory layouts; e.g.,
some titles expect the most common 1 MB Amiga 500 configuration (a stock Amiga
500 with 512 KB of on-board memory extended with a further 512 KB via the
trapdoor expansion slot).


### Amiga memory types

A rather significant complication is that the Amiga distinguishes between
three different main memory types. It's not enough to simply have "enough
memory" in your machine; you need to have enough memory of _each_ memory type
that the program you're trying to run requires! In a nutshell, these
differences arise from how the RAM chips are mapped to different address
ranges for the CPU and the custom chips (in other words, the exact same
physical RAM chips can be "seen" as different memory types depending on their
mappings[^dos-memory]).

[^dos-memory]: This is conceptually similar to the memory manager fiasco on
    MS-DOS where you have the base memory (lowest 640 KB block), then the UMB
    (the area between the base memory and the 1 MB barrier), then EMS, XMS,
    EMS emulated via XMS, real mode, protected mode, unreal mode, and who
    knows what else... But on DOS the situation was a lot worse as you needed
    to load drivers that "created" the different memory types for you using
    your physical RAM, and most of these drivers had incompatible programming
    APIs...

While technically there are lots of different memory types, for gaming
purposes it's enough to know about these three main types:

* **Chip RAM** — Custom chips responsible for audio and video duties can only
  access the Chip RAM. All graphics and audio data must be in the Chip RAM, so
  some games offer more and better sound or graphics if you have more of it.
  The CPU and the custom chips access this RAM in a 50/50 time-shared manner,
  so CPU-heavy tasks are hampered if you only have Chip RAM (basically, the
  CPU can only access Chip RAM at half-speed). Slow RAM is sometimes
  referred to as "bogo RAM" (don't ask).

* **Fast RAM** — Only the CPU has access to Fast RAM, so it can access it at full speed.
  Some calculation-heavy games (especially 3D games) , such as [F/A-18
  Interceptor](https://amiga.abime.net/games/view/f-a-18-interceptor), are
  much faster if Fast RAM is present in the system (hence the name!). Another
  example is the end part of the demo [Arte by
  Sanity](https://www.pouet.net/prod.php?which=1477) which is sped up
  massively by the presence of Fast RAM (and an accelerator board also helps).

* **Slow RAM** — The worst possible type of RAM as it has the drawbacks of
  Chip RAM and Fast RAM and none of the benefits! Only the CPU can access Slow
  RAM, but only 50% of the time. Yet the 512 KB Slow RAM memory
  expansion (the famous "trapdoor expansion") was the most popular Amiga 500
  peripheral ever! How so? Because it was cheap! Back in the day, you could
  only get Fast RAM on super expensive turbo cards or hard drive expansions
  that costed several times more than your base machine. That was out of reach
  for most hobbyists in Europe (remember, many ZX Spectrums owners were still
  happy playing games from tapes in the '90s in the UK!).


### Where things can go wrong

As mentioned, different types of RAM are mapped to different address
ranges. Slow RAM, in particular, is mapped to a specific fixed start address. So, if
a game is hardcoded to use Slow RAM, it does not matter if you have 8 MB of
Fast RAM in your system. Fast RAM is mapped to an entirely different
address range, so when the game tries to use the non-existing Slow RAM, it
will invariably crash.

Another reason for failures and misbehaviour is dodgy home-grown memory
detection methods that bypass the OS routines completely. These tend to get
confused if you have a different memory configuration than what the developers
were expecting. Some games will just not start if Fast RAM is merely _present_
in your machine (because it was expensive and thus uncommon in gaming circles,
many developers never tested their games on systems that had Fast RAM).

    TODO dungeon master no mem expansion

Lastly, as the CPU can use Fast RAM at full speed, if a game assumes Slow RAM
timings, it might misbehave because certain operations will be performed "too
quickly".

The solution to these special cases is reading the game's manual and
experimentation. Better manuals give you specific details on how the game can
(or cannot) handle extra memory, but most manuals don't, so you'll just have
to try things. I'll present a streamlined method to simplify the process to
get any game running optimally with the least effort (keyword is _optimally_).

### Different game versions

Later re-releases have often corrected memory handling issues as developers
slowly started appreciating the value of cleaner coding practices. In a way,
the original versions are the worst, especially for pre-1990 floppy-only
releases. Games that can be installed to the hard drive are far more
system-friendly and thus tend to have good support for a wide range of memory
configurations. That's because you can't kill the OS if you need to access the
HDD (floppy games that provide their custom trackloader can get away with
that), so you might as well use the more robust
OS-provided memory routines instead of rolling your own.



## Floppy images

One interesting quirk of the Amiga is that it does not have a full-fledged
hardware floppy drive controller like a PC or Macintosh. Application-level
data (such as program code, graphics, audio data, and text) must be
specially encoded to be stored on the floppy as a low-level data stream
of _magnetic flux transitions_ (usually via some sort of [MFM
encoding](https://en.wikipedia.org/wiki/Modified_frequency_modulation)
scheme). Similarly, low-level flux transition data read from the floppy must
be decoded before passing it to a program as application-level binary data
(e.g., the ASCII-encoded characters of a text file). This conversion is
implemented in hardware in the floppy drive controller of a typical PC as a
fixed, unchangeable process that is transparent to the applications and even
to the operating system. On the Amiga, however, the conversion is entirely
done in software, allowing unsurpassed flexibility. In truth, this was most
likely just a cost-cutting measure, but it had far-reaching consequences.

While a typical PC floppy drive can only read and write the PC floppy disk
format and nothing else, the Amiga can run different decoder software to read
PC, Macintosh, Apple II, or Commodore 64 disks due to this flexibility. But
one doesn't have to stop there; it's entirely possible to invent any new wild
and wonderful custom disk format you can imagine!

And people just did that. There are literally _hundreds_ of different custom
Amiga disk formats out there! The standard encoding scheme is the **AmigaDOS
format**, which stores 880 KB worth of application-level data on a
double-density 3.5" floppy. But it didn't take long for the resourceful game
and demo coders to come up with custom disk formats to cram more than 880 KB
of data onto a single disk (up to 980 KB!). This was done in the interest of
speeding up loading, to obfuscate things, to implement all sorts of fiendish
copy protection schemes, or simply because it was cool. Everybody and their
dog _had_ to have their own custom Amiga disk format back in the day!
:sunglasses:


### ADF and variants

[ADF](https://en.wikipedia.org/wiki/Amiga_Disk_File) stands for **Amiga Disk
File**. ADF images (`.adf` file extension) can store the contents of a
standard AmigaDOS formatted 3.5" floppy disk. As such floppies can hold
exactly 880 KB worth of application-level data, standard ADF images are
exactly 901&thinsp;120 bytes long.

Amiga floppy drives have two heads on either side of the disk, so you don't
need to flip it manually like on the Commodore 64 (most C64 floppy drives only
had a single head). A single 880 KB ADF file holds all information for both sides
of a single floppy disk—you won't find separate ADF files for side 1 and side
2 of the same physical disk.

There are a few variants of the format: **ADZ** files (`.adz` extension) are
simple ADF files compressed with gzip. Similarly, **DMS** files are ADF files
compressed with the proprietary Disk Masher System (`.dms` extension), which
was particularly popular in demoscene and warez circles in the '90s. If you
download demoscene productions, there's a high chance you'll download some DMS
files.

Standard ADF images and their variants cannot store disk-based protections; this
makes them unsuited for the authentic archival of most uncracked floppy games.
Amiga games you'll find online in ADF format are 99% cracked. I highly
recommend playing the untampered originals instead with the copy protection 
for the reasons outlined in [my previous
article](/2023/01/02/gaming-on-the-amiga-part-1-amiga-500-is-all-you-need/#on-cracked-games).

#### Extended ADF format

There is a variant of the ADF format that is about 2 MB in size per disk
image. These so-called **Extended ADF** images can store various custom
encodings and even some copy protection schemes.

In practice, however, archival-quality originals of Amiga floppy games are
almost always stored in the [IPF format](#ipf). The primary use of extended
ADF images is for save disks. Some games write more than 80 tracks to the save
disk (such as [Neuromancer](https://amiga.abime.net/games/view/neuromancer))
or use custom MFM encodings (like [Cannon
Fodder](https://amiga.abime.net/games/view/cannon-fodder)); using standard 880
KB ADF images for these games will result in saves that you cannot load back.
As the size difference is negligible, always use extended ADF for save disks
and you'll get no surprises.


### IPF

This is a special disk format that can store all the information contained on
the original disks, including _almost all forms_ of copy protection. The only
outliers I'm aware of are all [Dungeon Master](https://amiga.abime.net/games/view/dungeon-master)
versions prior to the v3.6 Psygnosis re-release (which has the copy protection
removed), and all versions of [Chaos Strikes Back](https://amiga.abime.net/games/view/dungeon-master-and-chaos-strikes-back)
(but it's possible to create emulator-only IPF files for these games with some
tricks).

To play uncracked originals, you _absolutely need_ IPF disk images, plain and
simple.[^ipf] The IPF game library created by the [Software Preservation
Society (SPS)](http://www.sofpres.org/) with the help of many volunteers was
not publicly available for a long time, but eventually, it was "leaked". You
can find the whole SPS pack in TOSEC and many other online places, including
the FTP of a certain well-known English Amiga forum... Look for "official SPS
images".

[^ipf]: There are other low-level formats too that can store disk-based copy
    protection schemes, such as **KyroFlux CT Raw** (`.raw` extension), **SCP
    (SuperCard Pro)** (`.scp`), **raw MFM dumps** (`.mfm`), and **FDI
    (Formatted Disk Image)** disk images (`.fdi`). You'll come across these
    much less frequently; in practical terms, you'll be using the IPF game
    library created by the CAPS/SPS team 99% of the time.


{{< note title="On software preservation" >}}

The [IPF](http://www.softpres.org/glossary:ipf) format was devised by the
[Software Preservation Society (SPS)](http://www.softpres.org/) (formerly the
Classic Amiga Preservation Society (CAPS)), along with a hardware device
called [KyroFlux](https://www.kryoflux.com/) to help create exact magnetic
flux-level dumps of the original disks. The importance and the absolutely
outstanding world-class work of the SPS cannot be understated. Without the
tireless efforts of these super-dedicated gentlemen, all we could play today
would be cracked games of varying quality or potentially incorrect and faulty
raw dumps. The least I can do here is to quote the first few introductory
paragraphs of [their website](http://www.softpres.org/):

> The Software Preservation Society (SPS), formerly the Classic Amiga
> Preservation Society (CAPS), dedicates itself to the preservation of
> software for the future, namely classic games. As it is, these items are no
> longer available from their original suppliers, and are mainly in the
> possession of an ever diminishing community of well willed collectors.
> However, just by the passage of time these games are affected by the gradual
> deterioration of the media that stores them. These classics risk being lost
> forever in the near future, a tragedy that must be prevented.
>
> Our main objective is to guarantee the preservation of such an important
> part of computer gaming history. Preservation dictates that nothing less
> than authentic representations of the software exist, which are both free of
> bit rot, and unaltered since the time of production. After a significant
> amount of research and development, we now have the technology that enables
> us to do this.

{{< /note >}}

#### Using IPF images in WinUAE

To use IPF images, you'll need to download the CAPS plugin from the [SPS
website](http://www.softpres.org/download) and copy it into your WinUAE root
directory. The plugin has 32-bit and 64-bit variants;
the 32-bit plugin will only work with 32-bit WinUAE, and vice versa.

1. Download version 5.1 of the IPF support library for Windows from the [SPS download page](http://www.softpres.org/download). Both the 32-bit and 64-bit versions reference the same ZIP file, so it doesn't matter which one you download.

2. Extract `spsdeclib_5.1_windows.zip` you downloaded, then copy a single DLL file from the upacked ZIP archive it into your WinUAE root directory:

   - For 32-bit WinUAE: copy `CAPSImg.dll` from the _root_ directory of the
       ZIP
   - For 64-bit WinUAE: copy `x64/CAPSImg.dll`
   {class="compact"}

{{< warning title="Important" >}}

You _must_ always use the original floppy speeds (100% speed) with IPF images.
Turbo mode won't do anything at all (it will just silently revert to 100%
speed), but the 200%, 400% and 800% options do "work". That's in quotation
marks because using anything other than 100% will most likely break disk-based
copy protections that are timing-sensitive (e.g., [Rob Northen
Copylock](https://en.wikipedia.org/wiki/Rob_Northen_copylock)).

The cycle-exact emulation of a 68000-equipped Amiga 500 is often also needed.
Faster CPUs or non-cycle exact emulation tend to break some copy protection
routines.

The faster-than-100% options are really only there for the odd unprotected
AmigaDOS disk that happens to be in IPF format.

You can never be completely sure whether a game has copy protection or not
(without doing significant research, that is). 800% speed might appear to
"work" as many games won't give you any obvious signs that something is wrong.
But the protection mechanism might be silently triggered which could alter the
game in subtly different ways (e.g., by making it substantially more difficult
as in the case of **Populous** or **Gods**, or outright unwinnable by hiding
certain key items necessary for completing the game; **Exile** is a prime
example of this).

{{< details "Games that use Rob Northen Copylock" >}}

This is a probably complete list of all Amiga games that use the **Rob Northen
Copylock** protection system (495 titles). All these games require cycle-exact
emulation of a stock Amiga 500 with 100% floppy speed otherwise the copy
protection might be triggered
([source](https://codetapper.com/amiga/interviews/rob-northen/)).

_Also note there are **far more** Amiga games that use disk-based protections
other than Copylock!_

- 3D Construction Set
- 3D Pool
- 5th Gear
- A Rock Star Ate My Hamster
- APB
- Addams Family, The
- Afterburner
- Alien Breed Special Edition
- Alien Syndrome
- Aliens 3
- Altered Beast
- Arcade Trivia
- Archipelagos
- Argonaut
- Arkanoid 2
- Armada
- Armageddon Man
- Armalyte
- Army Moves
- Assassin
- Astaroth
- BMX Simulator
- Back to the Future Part 2
- Back to the Future Part 3
- Backlash
- Badlands
- Ball Game, The
- Banshee
- Barbarian
- Barbarian 2
- Bart Versus the World
- Batman Returns
- Batman the Movie
- Battle Master
- Battle Valley
- Battleships
- Battletoads
- Beach Volley
- Beast Busters
- Bermuda Project
- Beverley Hills Cop
- Big Run
- Bignose the Caveman
- Black Lamp
- Blade Warrior
- Blastar
- Blasteroids
- Blinky
- Blob
- Bloodwych
- Bob's Bad Day
- Body Blows
- Bomber
- Bombjack
- Bombuzal
- Boredino
- Brat
- Bubble & Sqweek
- Bubble Bobble
- Bubble Dizzy
- Buggy Boy
- Burning Rubber
- Butcher Hill
- CJ in the USA
- CJ's Elephant Antics
- Cabal
- Cadaver Levels
- California Games
- Cannon Fodder 2
- Captain Dynamo
- Captain Planet
- Captive
- Car-Vup
- Carl Lewis Challenge
- Carrier Command
- Castle Master
- Championship Run
- Chaos Engine
- Chase HQ
- Chase HQ / Hard Drivin'
- Chronicles of Omega
- Chuck Rock
- Chuck Rock 2
- Cisco Heat
- Cloud Kingdoms
- Conflict Europe
- Cool Spot
- Cool World
- Corporation
- Cosmic Pirates
- Cosmic Spacehead
- Crazy Cars
- Crossbow
- Crystal Dragon
- Crystal Kingdoms
- Curse of Enchantia
- Custodian
- Cyber Punks
- Cyberball
- Cybernoid
- Cybernoid 2
- Cytron
- D/Generation
- Daley Thompson Olympic Challenge
- Dark Man, The
- Dark Side
- Dark Stone
- Darkmere
- Dawn Patrol
- Days of Thunder
- Defender 2
- Defender of the Crown
- Deuteros
- Devious Design
- Die Hard 2
- Dominator
- Don't Drop Off
- Doodle Bug
- Double Dragon 3
- Dr. Doom
- Dr. Fruit
- Dragon Spirit
- Dragons Breed
- Duckula 2
- Dynamite Dux
- Eco
- Ed The Duck
- Elf Quest
- Emlyn Hughes International Soccer
- Epic
- Escape from the Planet of the Robot Monsters
- Euro Football Champ
- European Champions
- European Championship '92
- Exile
- Exolon
- Exterminator
- Extra Time
- F-16 Combat Pilot
- F-29 Retaliator
- FA Premier League Football
- Falcon 2
- Falcon Collection
- Falcon Missions
- Fantastic Dizzy
- Fantasy Manager
- Fantasy World Dizzy
- Fast Food
- Fighting Soccer
- Final Battle, The
- Final Blow
- Fire And Ice
- Fireball
- Firehawk
- First Contact
- First Division Manager
- First Samurai
- Flight of the Intruder
- Flippit And Magnose
- Flying Shark
- Football Manager 2
- Football Manager 2 Expansion Kit
- Football Manager: World Cup Edition
- Franco Baresi
- Frenetic
- Fruit Machine
- Future Basketball
- G-Loc
- Galaxy Force
- Games Winter Edition, The
- Garfield
- Garfield's Winter Tail
- Ghost Busters 2
- Global Gladiators
- Gods
- Graeme Souness Soccer Manager
- Graham Gooches Cricket
- Gravity
- Grid Start
- Guardian Angel
- Hard Drivin'
- Hard Drivin' 2
- Heimdall
- Heimdall 2
- Hell Raider
- Hellfire Attack
- Helter Skelter
- Hero Quest
- Honda RVF
- Hook
- Hostile Breed
- Hotshot
- Hover Hawk
- Hoversprint
- Hudson Hawk
- Hunt for Red October
- Hunter
- Hydra
- Hyperforce
- IK+
- Incredible Shrinking Sphere
- Indy Heat
- Insects In Space
- International Championship Wrestling
- International Ice Hockey
- Interphase
- Islands
- It Came From The Desert 2
- Italy 1990
- James Pond
- Jaws
- Jimmy White's Whirlwind Snooker
- Joan of Arc
- Jockey Wilson Darts
- Jungle Strike
- Kamikazi
- Karting Grand Prix
- Kennedy Approach
- Kenny Dalglish Soccer Manager
- Kick Off
- Kick Off 3
- Kid Chaos
- Klax
- Knightmare
- Krusty's Fun House
- Krystal, The
- LED storm
- Las Vegas
- Last Battle
- Last Ninja 2
- Legend
- Lemmings
- Lemmings 2
- Let Sleeping Gods Lie
- Lethal Weapon
- License To Kill
- Liquid Kid
- Little Puff
- Lombard Rally
- Loopz
- Lords of the Rising Sun
- Lost Patrol
- Magic Land Dizzy
- Magic Pockets
- Manhattan Dealers
- Manix
- Match of the Day
- McDonald Land
- Mean Machines
- Megalomania
- Mercenary
- MiG-29
- MiG-29 2
- Miami Chase
- Micro Machines
- Microprose Soccer
- Midnight Resistance
- Millennium 2.2
- Monty Python
- Moonshine
- Moonstone
- Motorhead
- Mr. Do Run Run
- Munsters
- Mutant League Hockey
- Myth
- NAM
- NARC
- NBA Jam
- Navy Seals
- Nebulus
- Neighbours
- Netherworld
- New Zealand Story
- Nigel Mansell Grand Prix
- Nightbreed
- Ninja Spirit
- Ninja Warriors
- Nitroboost Challenge
- Odyssey
- Oh No More Lemmings!
- Omnicron Conspiracy
- Onslaught
- Operation Thunderbolt
- Operation Wolf
- Outrun / Super Cycle
- Overlord
- Pandora
- Panic Dizzy
- Paperboy 2
- Paradroid
- Parasol Stars
- Park Mystery, Theme
- Passing Shot
- Paul Gascoine Super Soccer
- Peanuts
- Personal Nightmare
- Phobia
- Photon Storm
- Pipemania
- Pirates
- Pitfighter
- Pixmate
- Platoon
- Pool
- Popeye 2
- Populous
- Populous 2
- Power Drive
- Powerboat
- Powerdrift
- Precious Metal
- Predator
- Predator 2
- Prime Mover
- Prince of the Yolk Folk
- Pro Boxing Simulator
- Pro Tracker
- Project X
- Prophecy One
- Pub Trivia
- Pushover
- Puzznic
- Pyramax
- Qix
- Quadralien
- Quartet
- Quest of Agravain
- Quick Snax
- Qwak
- R-Type
- R-Type 2
- RBI
- Race Driver
- Raffles
- Rainbow
- Rally Cross
- Rambo 3
- Renegade
- Resolution 101
- Return of the Jedi
- Rick Dangerous
- Rick Dangerous +
- Rick Dangerous 2
- Robin Hood
- Robocop
- Robocop 3
- Robokid
- Robozone
- Rocket Ranger
- Rodeo Games
- Rodland
- Rollercoaster Rumbler
- Round the Bend
- Ruff 'n' Tumble
- Rugby World Cup
- Run the Gauntlet
- Ryder Cup
- SAS Combat
- SCI
- SWIV
- Saint Dragon
- Santa's Christmas Capers
- Scrabble
- Sensible Soccer
- Sensible Soccer International Edition
- Sensible World of Moon Soccer
- Sensible World of Soccer
- Seymour Goes to Hollywood
- Shadow Warrior
- Shadowlands
- Shak Fu
- Sharkey's Moll
- She Fox
- Shockwave
- Shoot-Em-Up Contruction Kit
- Shut It!
- Silly Putty
- Simpsons, The
- Simulcra
- Skeleton Krew
- Ski Simulator
- Skull And Crossbones
- Sky High Stuntman
- Skychase
- Skyshark
- Slayer
- Sleep Walker
- Sly Spy Secret Agent
- Snoopy
- Soccer Pinball
- Solder of Light
- Sooty
- Sooty and Sweep Numbers
- Space Crusade
- Space Gun
- Speedball
- Speedball 2
- Spellbound Dizzy
- Spellfire the Sorceror
- Sphericules
- Spike in Transylvania
- Spindizzy Worlds
- Spy Who Loved Me, The
- Stack Up
- Star Breaker
- Star Wars
- Stargoose
- Steel
- Steg
- Steigar
- Stormlord
- Strike Force Harrier
- Strip Poker
- Stun Runner
- Stunt Car Racer
- Super Allstars
- Super Frog
- Super Grandprix
- Super Seymour
- Super Space Invaders
- Super Tennis Champs
- Super Wonder Boy
- Superstar Ice Hockey
- Sword and the Rose, The
- THMT Electric Crayon
- TV Sports Basketball
- TV Sports Football
- Target Renegade
- Tennis
- Terminator 2
- Thai Boxing
- Thomas the Tank Engine
- Three Stooges, The
- Thundercats
- Thunderjaws
- Tiger Road
- Time
- Time Machine
- Time Scanner
- Titanic Blinky
- Toki
- Toobin
- Top Wrestling
- Tornado
- Torvak
- Total Eclipse
- Total Recall
- Tower of Babel
- Tracksuit Manager
- Tracksuit Manager '90
- Treasure Island Dizzy
- Turn 'n' Burn
- Turtles
- Tuskar
- Universal Monsters
- Uridium 2
- Vader
- Vector Football
- Victory Road
- Vindicators
- Violator
- Vixen
- Voyager
- WWF European Rampage
- WWF Wrestlemania
- Walker
- Warhead
- Warlock
- Warzone
- Waterloo
- Weird Dreams
- Wembley International Soccer
- Whizz & Liz
- Wicked
- Willows
- Wing Commander
- Wings
- Wings of Fury
- Winter Olympiad
- WizKid
- Wizball
- Wolf Child
- Wolfpack
- Wonder Dog
- World Class Rugby
- World Soccer
- Worlds of Legend
- Wreckers
- XR35
- Xenon 2
- Xybots
- Zombies
- Zone Warrior
- Zynaps
{class="compact"}

{{< /details >}}

{{< /warning >}}

{{< note title="What the hell is an IPF image anyway?" >}}

Technically, IPF files describe the contents of the disk in a scripting
language suitable for disk mastering purposes (similar to scripts used by commercial disk
duplicator machines back in the day). This script is
reconstructed (or "remastered") from raw flux-level disk dumps by the SPS team
(or other individuals, if they have the necessary tools and knowledge). That's
the reason why IPF disk images are small (only around 1 MB per disk) compared
to the huge flux-level dumps which can be several tens of megabytes for a
single disk!

Why is a scripting language needed, why isn't just a bit idential "snapshot"
of the disk enough? The exact details are quite complicated, but in a
nutshell, reading the same part of the disk over and over multiple times can
give different results in certain copy protection schemes. Therefore, a single
"snapshot" of the disk's contents would capture only one of these
possibilities, "frozen in time", and that wouldn't be enough to pass the copy
protection! Some of these copy protection schemes basically accomplish
"randomised data" that would appear slighly different on successive reads.
These subtleties can only be represented via a script expressed in a universal
disk format description language.

This is a fascinating topic and the [SPS Knowledge
Base](http://www.softpres.org/knowledge_base) is worth perusing if you're
interested in learning more. The [SPS Technical
Overview](http://www.softpres.org/article:technology:overview) page is a good
starting point to whet your appetite. Of course, you absolutely don't need to
know anything about this if you just want to play a few games.


{{< /note >}}

## General base config

There was a time when I thought floppy sound emulation is something only crazy
people are interested in. Now I can't live without it.

Have I gone crazy? That's beside the point. But allow me to explain why I'm
convinced enabling floppy sounds is a really good idea.

If you start a floppy game that takes say 20-30 seconds to load with the
default WinUAE settings,
you're just staring at a black screen with no feedback. Has the emulator
crashed? Is anything happening? How much longer do I need to wait? It's
anyone's guess!

There is a good reason why the well-know progress bars and spinners have been
invented. Waiting for five seconds while absolutely nothing is happening takes
subjectively longer than watching some "in progress" animation for the exact
same duration. The progress indicator gives you some reassurance: "okay, I
don't need to worry, the computer is still working".

In windowed mode, you have the floppy drive activity indicators in the
WinUAE window's status bar. But in fullscreen, you get nothing by default. So
I recommend to tick the **Enable on-screen display** option in the
**Miscellaneous** tab at the very least, and you might also want to increase
the OSD font size while you're at it. This will display a nice little OSD
indicator in the bottom right corner. The four little green rectangles show
the activity of the four floppy drives. Green means the floppy drive is
reading the disk, red means it's writing to it, and the number of the current
track being read or written is also shown.

That's great, but auditory feedback via floppy sounds is even better. It's
super nostalgic if you had an Amiga back in the day, and if you
didn't, it's still a lot better than constantly checking the corner of the
screen for floppy activity. Different games also have different floppy sound
patterns, which is kinda cool.

You can enable floppy sound emulation in the **Sound** configuration tab under
**Floppy Drive Sound Emulation**. I find the default volume way too loud, I
like to set both sliders to 12% for all drives. After doing these config
tweaks, I recommend saving this as a base config. We'll use that config as a
starting point for what we're gonna do next.

There is one specific scenario where I like to disable the floppy sounds
completely: demoscene productions where loading is happening almost all the
time in the background. Some demos even leave the drive motor running,
regardless of whether the drive is reading data or not. This just adds an
annoying constant background noise to the music, and because it's constant, it
gives you no useful feedback either. 


## Amiga 500 configurations

To be able to run any floppy Amiga game in existence, now we'll set up three
base configurations with PAL and NTSC variants per each, so six configs in
total.

The idea is that it's best to create per-game configurations using these as
starting points. The recommended way to do this is described in the [plan of
action for Amiga 500 games section](#plan-of-action-for-amiga-500-games), but
let's see the configs first!


### 1 MB Amiga 500

_Amiga 500, OCS chipset, Kickstart 1.3 ROM<br>512 KB Chip RAM, 512 KB Slow
RAM_


#### How to set it up

To configure this in WinUAE, use the **Quickstart** tab in the WinUAE
settings. Select the **A500** model, the **1.3 ROM, OCS, 512 KB Chip + 512 KB
Slow RAM (most common)** configuration (the first one), and make sure to set
the slider to the far left to **Best compatibility.** 

You can hover over selection in the configuration dropdown and read a succinct
description of what I'm going to describe in detail next. These tooltips are
good reminders, but they're a bit hidden.

Make sure **Start in Quickstart mode** is unchecked in the bottom-right and
the **Set configuration** button is visible to the left. Press the button.

It's a good idea to save this config now as _A500 Floppy, 1 MB, PAL_ in the
**Configurations** tab. Note the word "PAL" at the end. It's best to create
two variants, one for PAL and one for NTSC, and I highly recommend to set them
up for authentic CRT emulation [as per my
article](/2022/04/15/achieving-period-correct-graphics-in-personal-computer-emulators-part-1-the-amiga/).

To generate the NTSC config, you could tick the **NTSC** checkbox in the
top-right corner of the **Quickstart** tab, then press **Set configuration**
again, but this would overwrite your whole config so you would lose any
further manual tweaks. There's a better way: simply turn your PAL config into
NTSC by going to the **Chipset** tab and ticking **NTSC** there. That's the
easiest way to switch between PAL and NTSC in an existing config. Make sure to
also update your shader setup for NTSC according to [my article](/2022/04/15/achieving-period-correct-graphics-in-personal-computer-emulators-part-1-the-amiga/).

#### Detailed description

This was the single most popular gaming setup in the Amiga's heyday: an Amiga
500 expanded to 1 MB via a trapdoor memory board. This gave you an extra 512 KB of
Slow RAM.

You'll be able to run 99% of OCS floppy games with this config. You might not
always get the _ideal_ experience as some games could utilise extra RAM to
reduce loading times, give you better graphics or audio, or even extra
gameplay features. But you'll get to play most titles on this classic setup, no
doubt.

In 1988, [Dungeon Master](https://amiga.abime.net/games/view/dungeon-master)
was released for the Amiga and it required 1 MB of
memory. Cinemaware's [It Came From the Desert](https://amiga.abime.net/games/view/it-came-from-the-desert)
came out a year later in 1989 and it also demanded 1 MB of RAM. These two were
probably the first two prominent games with a hard 1 MB memory requirement,
and they can be rightfully considered "killer apps" of their time, responsible
for selling many Amigas and RAM expansion boards. Some trapdoor RAM expansions
were even bundled with a copy of Dungeon Master!

TODO image

This set a trend and more and more games started appearing that required a 1
MB Amiga. By the early 1990s, the trapdoor RAM expansion became a de-facto
standard accessory that you just _had_ to have, otherwise you'd miss out on
some essential Amiga experiences. 

{{< details "Games that require 1 MB of RAM" >}}

A non-exhaustive list of games that refuse to run on less than 1 MB of RAM.
Lots of all time classics, as you can see, and most of them are from the '90s.

- Amberstar (1992)
- Beneath a Steel Sky (1994)
- Black Crypt (1992)
- Chaos Engine, The (1993)
- Chaos Strikes Back (1991)
- Conquest of Camelot: The Search for the Grail (1990)
- DreamWeb (1994)
- Dungeon Master (1988)
- Elvira II: The Jaws of Cerberus (1992)
- Eye of the Beholder II: The Legend of Darkmoon (1992)
- Fields of Glory (1994)
- Flashback (1992)
- Gobliins 2 (1992)
- Heimdall (1991)
- Hired Guns (1993)
- Hook (1992)
- It Came From the Desert (1989)
- King's Quest IV (1990)
- Lure of the Temptress (1992)
- Manhunter 2: San Franciso (1990)
- MegaTraveller 1: The Zhodani Conspiracy (1991)
- MegaTraveller 2: Quest For The Ancients (1992)
- Monkey Island 2: LeChuck's Revenge (1992)
- Police Quest 2: The Vengeance (1989)
- Pool of Radiance (1990)
- Pools of Darkness (1992)
- Quest for Glory I: So You Want to Be A Hero (1990)
- Quest for Glory II: Trial by Fire (1991)
- Reach for the Skies (1993)
- Samurai: The Way of the Warrior (1992)
- Settlers, The (1993)
- Simon the Sorcerer (1993)
- Worms (1995)
{class="compact"}

{{< /details >}}

Some games can run on a base 512 KB machine but will give you extra features
or reduced loading times on 1 MB. For example:

- [Fate: Gates of Dawn (1991)](https://amiga.abime.net/games/view/fate-gates-of-dawn) will give you in-game sound
  effects on 1 MB only; on a stock Amiga 500, the game is silent.
- [Rings of Medusa (1990)](https://amiga.abime.net/games/view/rings-of-medusa-gold) has more sound effects on 1 MB.
- [Indianapolis 500: The Simulation (1990)](https://amiga.abime.net/games/view/indianapolis-500-the-simulation) only allows replays if you have at least 1 MB of RAM.
- [Nuclear War (1990)](https://amiga.abime.net/games/view/nuclear-war) has extra animations on 1 MB.
- [MiG-29 Fulcrum (1991)](https://amiga.abime.net/games/view/mig-29-fulcrum) needs 1 MB for the best 320&times;256 32-colour PAL mode.
  On 512 KB, the game only uses 16 colours and 320&times;200 is the maximum
  resolution, even on PAL.

So it's a good idea to always try games on a memory expanded setup first.
Games that don't need the extra memory will just ignore it, but some older
badly coded titles might misbehave when extra RAM is present. We'll discuss
this in the next section.

{{< note title="OCS vs ECS Agnus" >}}

Some people claim an Amiga 500 equipped ECS Agnus and the 512 KB Slow RAM
expansion was the most wide-spread (which might be even true, at least in
Europe) , but I think OCS is important. Simply put, there is nothing to gain
from an ECS Agnus as virtually no game takes any advantage of it, and although
ECS is almost 100% backward compatible... well, the keyword is _almost_.

A small number of games have problems with an ECS Agnus (e.g., the interlaced
title screen of [The Guild of Thieves (1987)](https://amiga.abime.net/games/view/the-guild-of-thieves)
and [Corruption (1988)](https://amiga.abime.net/games/view/corruption) is
completely messed up on ECS Agnus), and many older demoscene productions
really need OCS (that includes cracktros too).

So while most older games are fine on ECS, why risk it, you're not gaining
anything at all. Just go with OCS in the classic 1 MB Amiga 500 setup.

{{< /note >}}

---

### Unexpanded Amiga 500 

_Amiga 500, OCS chipset, Kickstart 1.3, 1.2 or 1.1 ROM (in this order of
preference)<br>512 KB Chip RAM_

#### How to set it up

TODO **Quickstart**

Use Kickstart 1.3 for the base config; you'll very rarely need to downgrade it
to 1.2 or 1.1 (this will be explained below). Make sure the compatibility
slider is at the far left (best compatibility), then press the **Set
configuration** button.

Save this as _A500 Floppy, PAL_, then create the NTSC variant and set up the
shaders as you've done it for the previous [1 MB Amiga 500](#1-mb-amiga-500)
config.


#### Detailed description

A small number of pre-1987 games originally written for the Amiga 1000 or an
unexpanded Amiga 500 can get really confused by the presence of any memory
expansion. These games might display corrupted graphics, crash at some point,
or not even load at all when more than 512 KB of memory is present. For
example, [Tass Times in Tonetown (1986)](https://amiga.abime.net/games/view/tass-times-in-tonetown)
superficially seems to work fine, but some graphics elements are missing if
you have 1 MB of RAM.

These obvious problems are easy to spot, but a far more insidious issue is
when a game seems to run perfectly fine, but the extra RAM causes some
non-obvious bugs, which is sometimes only noticeable after several hours of
playing. [The Faery Tale Adventure (1986)](https://amiga.abime.net/games/view/the-faery-tale-adventure)
is such a game; the bird totems don't work on 1 MB machines but otherwise the
game runs fine. Once you disable all memory expansions, the totems start to
work. Unfortunately, you can only figure out problems like this by extensive
forum diving (if you even realise there is a problem in the first place), but
the good news is, such games are rare!

Really ancient games not only hate your extra RAM, but are also mortal enemies
of Kickstart 1.3. You must dowgrade to Kickstart 1.2 if you wish to enjoy
these games in their original form. An even smaller number of games are true
troglodytes---they detest any kind of progress and require Kickstart 1.1.

Don't really trust what the game manuals you find online say as later
re-releases have usually fixed such Kickstart compatibility problems (and
often made the games compatible with faster CPUs, memory expansions, and AGA
Amigas). You can never be completely sure whether the scanned manuals and the
disk images you found online are from matching versions (unless the year of
release is clearly indicated in the manual and in your disk image's metadata
or in the game itself). People make all sorts of claims about the required
Kickstart version for any particular game in internet forums, but they're not
aware that the version requirement was often _downgraded_ by the crackers,
usually as an unintended side-effect of their cracktros. A typical scenario is
when the original game could handle Kickstart 1.2 and 1.3 fine, but the
cracker only had access to a 1.2 machine and took advantage of some
1.2-specific quirks that result in a crash on 1.3.

For example, the SPS version of [Seven Cities of Gold (1985)](https://amiga.abime.net/games/view/seven-cities-of-gold)
definitely needs Kickstart 1.1---it hard crashes before the title screen on
any higher ROM version.

Then people claim in various forums that these titles require Kickstart 1.2,
but the SPS versions run just fine on Kickstart 1.3:

- [Archon: The Light And The Dark (1986)](https://amiga.abime.net/games/view/archon-the-light-and-the-dark)
- [Marble Madness (1986)](https://amiga.abime.net/games/view/marble-madness)
- [One On One (1985)](https://amiga.abime.net/games/view/one-on-one-electronic-arts)
- [Times of Lore (1989)](https://amiga.abime.net/games/view/times-of-lore)
- [Starflight (1989)](https://amiga.abime.net/games/view/starflight)
{class="compact"}

Maybe I'm just lucky because I happen to use the fixed re-releases? Perhaps
the guys who made those claims had the cracked versions? Or maybe some people
just parrot the same misinformation they heard elsewhere without checking
first?

Misinformation on the internet---who would've guessed that is even possible!

---

### Fully decked out Amiga 500

_Amiga 500, ECS Agnus chipset, Kickstart 1.3 ROM<br>2 MB Chip RAM, 8 MB Fast RAM, 512 KB Slow RAM_

#### How to set it up

We'll use the **Quickstart** tab again, but now we'll select the second
drop-down option which is **1.3 ROM, ECS Agnus, 512 KB Chip + 512 KB Slow
RAM**. Make sure the compatibility slider is at the far left (best
compatibility), then press the **Set configuration** button.

The next thing to do is to max out the memory in the **Hardware / RAM** tab. Set
**Chip** to **2 MB**, leave **Slow** at **512 KB**, and set **Z2 Fast** to **8
MB**.

Let's call this _A500 Floppy, max mem, PAL_. Make sure to create the NTSC
variant, too, set up the shaders---you know the drill.


#### Detailed description

Okay, we're tackling the most advanced setup last: this is our kitchen sink
"best possible A500 money can buy" config.

The successors of the Amiga 500 (the Amiga 500 Plus and the Amiga 600 released
in 1991 and 1992, respectively) shipped with 1 MB of Chip RAM, expandable to 2
MB. The Amiga 1200 that came out at the end of 1992 had 2 MB of Chip RAM out
of the box. You could expand all these machines with at least 4 MB of
additional Fast RAM.

High-end "big box" Amigas usually came with at least 1 MB of RAM starting from
the late '80s, and often with quite a bit more. These were generally more
popular in the US, so North American developers tended to make sure their
games ran on these big boys too.

As a result of all this, game developers started to take advantage of the
extra RAM of newer Amiga models from the early '90s onwards. But as the
majority of the userbase was stuck on the venerable Amiga 500, most developers
took a "progressive enhancement" approach. The base game could run on the
de-facto standard Amiga 500 expanded to 1 MB (via the 512 KB trapdoor Slow RAM
expansion), then if you had more memory, you would get extra animations, more
varied graphics and sound effects, or maybe even some extra music. Some games
could even utilise faster CPUs to enhance the experience. At the very least,
the game would keep the already loaded data in memory to avoid reloading it
from the slow floppies from time to time, which in turn can drastically reduce
the need for disk swapping as well.

Naturally, this approach meant they could not use the enhanced graphics
capabilities of AGA Amigas as that would break compatibility with the huge
OCS/ECS user base. What this means for us is all we really need is the same
old Amiga 500 setup, just with the RAM maxed out. Only the later ECS Agnus
chip supports more than 512 KB of Chip RAM (also called as "Fat Agnus" because
she was a much larger lady than the original slim Agnus[^fat-agnus]). So we'll need to emulate an **ECS
Agnus** chipset, which is basically OCS with the Agnus swapped out to the ECS
version. Although WinUAE lets you configure more than 512 KB of Chip RAM with
a full OCS chipset, I don't think that's even possible on real hardware, and
that would definitely break some games (e.g., the music in [Pirates!](https://amiga.abime.net/games/view/pirates)
becomes very distorted with OCS and at least 1 MB of Chip RAM). 

[^fat-agnus]: According to the legend, these custom chips were named after
    their designer's girlfriends and wives. Well, I'm not entirely sure the
    name "Fat Agnus" would've gone down well with that particular lady the
    chip was supposedly named after... A much more believable story is that
    the name **Lorraine** (the codename for the Amiga development project)
    was picked after the Hi-Toro (the developer company) president's wife, and
    these female chip names were simply acronyms/abbreviations. So **Agnus**
    stands for **A**ddress **G**e**N**erator **U**nit**S** (no female feelings
    were hurt in the process!), **Denise** for **D**isplay **EN**abler, and
    **Paula** for **P**orts, **A**udio, **U**ART and **L**ogic, which
    incidentally _was_ the name of the chip designer's girlfriend.


Although "full ECS" chipsets have an improved graphics chip (ECS Denise) which
can display additional graphics modes, they were only used by high-end
professional applications (because you needed a special expensive monitor to
make some practical use of them). No
game or demo used the new ECS features for anything. Even Commodore shipped
the newer generation Amiga 500 models with this mixture of the ECS and OCS
chips (OCS Paula and Denise with ECS Agnus), and that's what we'll emulate as
it has the widest compatibility (ECS Denise is not fully backward compatible
with OCS Denise).

Researching whether a particular game can benefit from extra RAM is time
consuming, and sometimes the manual doesn't even contain relevant info about
this, or even if it does, it might be vague or simply wrong. Therefore, it's a
lot easier to simply just try this "dream A500 config" first whenever you set up a new
game. If it works fine, great, you're done---you can rest assured you're getting all
the bells and whistles the game has to offer. If there are issues, then you
can try the previous two scaled-down configs.

Alright, let's look at a few concrete examples how games can benefit from
extra RAM or a faster CPU!


[Ambermoon](https://amiga.abime.net/games/view/ambermoon)

: With 2 MB Chip RAM, you get textured floors and ceilings in the 3D view,
  which makes a huge difference. Additional Fast RAM and faster CPUs improve
  general performance and speed.


[B.A.T. II](https://amiga.abime.net/games/view/bat-ii)

: From the [French Reference Card](https://amiga.abime.net/manual/0001-0100/55_manual4.pdf?v=99):

  - 512 KB Chip RAM, 512 KB Fast RAM: few sound effects, slow speed, lots of disk swapping
  - 1 MB Chip RAM: all sound effects, slow speed, moderate disk swapping
  - 1 MB Chip RAM, 512 KB or more Fast RAM: all sound effects, full speed, minimal disk swapping
  {class="compact"}


[SimCity](https://amiga.abime.net/games/view/sim-city-classic-the-original-city-simulator)

: Version v1.2 or higher of the game includes two variants: one for 512 KB
  Amigas (16-colour graphics), and one for 1MB Chip RAM (enhanced 64-colour
  graphics).

  TODO image


[Spirit of Excalibur](https://amiga.abime.net/games/view/spirit-of-excalibur)<br>[Vengeance of Excalibur](https://amiga.abime.net/games/view/vengeance-of-excalibur)

: 1 MB Chip RAM gives you more animations in the intro and the graphics of
  the knight characters are more varied (on 512 KB, all knights look the
  same).


[The Secret of Monkey Island](https://amiga.abime.net/games/view/the-secret-of-monkey-island)

: If the game detects a faster CPU, you get animated clouds in the intro
  sequence. 8&times; CPU speed in WinUAE does the trick, which roughly corresponds to
  28 MHz. This makes the in-game animations are also much smoother, especially
  when there is a lot going on in the screen (e.g., in the SCUMM bar right at
  the start).


[The Settlers](https://amiga.abime.net/games/view/the-settlers)

: This game is the king of making the best use of the available hardware, hands
  down---it's a work of art! From the
  [manual](https://amiga.abime.net/manual/1801-1900/1878_manual0.pdf?v=2264):

  > Congratulations! By purchasing The Settlers, you have just acquired an
  > extraordinary program that will fully exploit the capabilities of your
  > Amiga or PC. This is true whether you are using an Amiga 500 with 1 MB, an
  > Amiga 4000 with 10 MB and a hard drive, or a PC 386 or DX2 486. The
  > Settlers is an "intelligent" program that thinks for you and a game where
  > you are not required to take care of everything yourself.

  The manual includes a detailed summary of what certain combinations of Chip
  and Fast RAM will get you:

  {{< figure name="img/settlers-memory-configs.png"
      alt="The Settlers -- Configuration examples" width="100%" >}}

  {{< /figure >}}

  You can even check the currently supported features in-game. It doesn't get
  better than this! As you can see on the screenshot below, the game even
  recognises and uses the faster 68020 CPU which unlocks larger map sizes!

  TODO screenshot



### Plan of action for Amiga 500 games

Whenever you're about to play a new OCS floppy game, try the previously
presented configs in the following order. Also make sure to use the PAL or
NTSC config variants as appropriate; some PAL games won't even load on an NTSC
Amiga, and vice versa (this was sometimes intentionally done as an early form
or region locking).

A500 Floppy, max mem

: If the game can use the extra memory, you'll get the best possible
  experience with this config. If it doesn't care about extra RAM but it's
  coded properly, it just won't use it so there's no harm.

  If you get any weird behaviour (e.g., black screen with nothing happening,
  the game keeps rebooting or it crashes shortly after loading, you get
  corrupted graphics or weird noises in the audio, etc.), then it probably
  cannot handle the memory expansions. Time to try the next config!

A500 Floppy, 1 MB

: This config will get 99% of OCS games working. Start with Kickstart 1.3, and
  if getting problems, downgrade to Kickstart 1.2. If still no cigar, it's
  time to move on to the next config to ditch all memory expansions.

A500 Floppy

: The fallback config for really old games written for the Amiga 1000 or early
  Amiga 500 models, typically released before 1988. Try Kickstart 1.3 first
  then 1.2, and 1.1 as the last resort. If still no luck, it's time to admit
  defeat and find an alternative solution (e.g., use a WHDLoad conversion,
  begrudingly). You should get to this point _very, very rarely_,
  though.



## Amiga 1200 configuration

_Amiga 1200, AGA chipset, Kickstart 3.1<br>68020 CPU, 2 MB Chip RAM, 128 MB Fast RAM_

#### How to set it up

TODO

#### Detailed description

TODO


## Multi-floppy games

TODO

### Disk swapping

TODO


## Problems with cracked games 

I went into the various deal-breaking issues with cracked games in [my
previous
article](/2023/01/02/gaming-on-the-amiga-part-1-amiga-500-is-all-you-need/#on-cracked-games).
Now that we're on more solid ground when it comes to the pecularities of the
Amiga, here are a few additional notes on how cracks can cause problems other
than simply breaking the game:

- Bad cracks can increase the memory requirements of a game (e.g., a bad crack
  might require 1 or 2 MB of RAM while the original might run fine on a base
  A500 with 512 KB of memory).

- Scene intros inserted before the actual game sometimes lower the required
  Kickstart version (usually from 1.3 to 1.2).

- Custom disk formats that crammed more than 880 KB onto a single disk
  often had to be unpacked to AmigaDOS, hence the cracked version could only
  be stored on more floppies (e.g., two instead of one, three instead of two,
  etc.) This means the disk layouts had to be changed after unpacking the data
  as the data needed to be "redistributed" onto multiple disks. This is always
  risky when done by people who did not write the original game code; bugs
  could easily creep in, essential files could be left out by mistake, the
  copy-protection could break in subtle ways, and so on.

- Similarly, the cracked versions of many releases require one more disk
  because the cracktro had to fit somewhere---the same complications mentioned
  in the previous point apply.

- Some teenagers inserted their own names or their scene group's name into the
  games' graphics, sometimes even altering the original credits. This is
  adolescent-level hooliganism akin to destructive graffiti and is completely
  unacceptable.

- Some games have half a dozen cracked versions. Are you really going to
  replay your game taking 10-20-30 or more hours half a dozen times to find
  the _one_ 100% working crack? Or do you trust the People of the Internet
  when they say crack X of game Y is 100% working? In some cases, a game
  simply has no perfectly working cracks, regardless of what most people might
  claim. Remember, most people never complete their games, so if you do, you
  might be in for a surprise... Sure as hell 99.999% of crackers never played
  50+ hours RPGs to completion _multiple times_, taking _different_ branching
  paths on each playthrough to verify their cracks are 100% correct. And even
  if they did, how can they be _absolutely sure_ they did not trigger some
  subtle protection that made the game completable but a lot more difficult,
  or maybe the copy-protection made some content unreachable? That is putting
  a lot of trust into people who were not part of the original development
  team, and trust me, there are shitloads of bad cracks out there (I remember
  the Quartex cracks of many popular games to be quite broken; they either
  triggered the subtle protections, or the game just stopped working
  mid-game).


## Saving your progress

When it comes to saving your progress in a floppy game, there are two methods:

- Using the savestate functionality of WinUAE
- Using the standard saving method provided by the game
{class="compact"}

Let's examine both!


### Savestates

This is the much easier option and it works 100% of the time. Contrary to some
other emulators, WinUAE savestates are _very_ stable. You can count on it that
your savestates will continue to work in any future WinUAE version. This
has been confirmed by Toni Wilen himself (WinUAE main developer for the past
20+ years):

> 32-bit/64-bit makes no difference to statefiles (they only store Amiga data which is always 32-bit only) and even most statefiles from 0.x days are still compatible as long as configuration is first manually set to match config which was used when statefile was created.
>
> A500 statefiles should never have any problems, A1200 (68020+) state files can have problems if CPU internal timing changes in some updated. Statefile tries to store the exact state of CPU if it was mid-instruction but that requires CPU works mostly identically when saved and when loaded.
>
> Most expansion devices don't support statefiles.



### Saving to disk

TODO


## Games with

TODO

- B.A.T. II
- Cricket Captain
- Dames Grand Maitre
- Italy Soccer '90
- Leader Board
- Leviathan
- Multi-Player Soccer Manager
- RoboCop 3
- Rugby Coach
- Striker Manager
{class="compact"}



---

<section class="links">

## References

* [Amiga Beginner's Series](https://www.amigaretro.com/index.php/page,1.html)

* [Ars Technica --- History of the Amiga](https://arstechnica.com/series/history-of-the-amiga/)

* [Jimmy Maher --- The Future Was Here: The Commodore Amiga](https://mitpress.mit.edu/9780262535694/the-future-was-here/)

* [Amiga Hardware Database](https://amiga.resource.cx/)

* [The Amiga Museum](https://theamigamuseum.com/)

* [Software Preservation Society (SPS)](http://www.sofpres.org/)

* [English Amiga Board --- Non-AGA games that utilise extra memory](https://eab.abime.net/showthread.php?t=65574)

* [The .ADF (Amiga Disk File) format FAQ](http://lclevy.free.fr/adflib/adf_info.html)

## Amiga game reviews

* [The Good Old Days --- Amiga games](https://www.goodolddays.net/list/system%2C1/)
* [Amiga Reviews: Videogames in the printed press](https://amigareviews.leveluphost.com/)
* [Hall of Light -- The database of Amiga games](https://amiga.abime.net/)

</section>


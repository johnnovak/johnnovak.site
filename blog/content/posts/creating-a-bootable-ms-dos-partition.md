---
title: "Creating a bootable MS-DOS partition on a CF card"
date:  2023-01-21
tags:  [ms-dos, pc]
---


## The problem

So you got a nice retro PC and a CompactFlash (CF) to IDE adapter, and now you
want to install MS-DOS 6.22 onto a CF card to put the machine to good use
(i.e., playing retro games---what else, really?) But no floppy drive, no
Gotek, and no CD-ROM drive. What's a young bear to do?

In WinUAE, you can mount any physical hard disk or removable flash media for
direct low-level access with a few mouse clicks, then you can partition and
format it via AmigaOS running in the emulator. After that,
you pop the card into your real Amiga, and it just works---magic!

No such cool easy to use mounting feature in DOSBox, PCem, 86Box, VirtualBox
and the likes, unfortunately. Now, there appears to be ways to somehow coerce
VirtualBox into that by installing some extension packs, faffing around with
the `VBoxManage` command-line tool, persuading Windows to give up exclusive
access over the drive, and so on. Maybe you need to do all those things, or
perhaps just some; in any case, it doesn't sound like my idea of fun. There has
to be a simpler way!


## The solution

And luckily, there is, and that's what I'll describe next. I used
[86Box](https://86box.net/), but [PCem](https://pcem-emulator.co.uk/),
[VirtualBox](https://www.virtualbox.org/ ), or any other full PC emulator
should also be able to do the job. The objective here is to create a bootable
2GB primary MS-DOS partition on an 8GB CF card, install MS-DOS 6.22 onto it,
then put that into the real PC and fill the rest up with up to 2GB partitions
using `FDISK` (we can't create larger than 2047MB partitions due to FAT16
limitations).

To avoid all that VirtualBox jiggery-pokery, we'll install MS-DOS onto a blank
raw hard drive image first, then simply write that image to the CF card.

### Installing MS-DOS onto a raw hard drive image 

First of all, we need to create a virtual PC in our emulator of choice. I
chose a Socket 7 ASUS board with an Intel 430HX chipset in 86Box (*obviously*,
nothing else but a server-grade board will suffice to partition some CF card
for gaming purposes!) Remember, you'll need a BIOS with LBA support to be able to use more than 528MB of the drive.

Then create a raw hard drive image of say 2100MB in size (I recommend going
over 2GB a bit, just to be safe). Make sure it's not a compressed image but a
raw one; these generally have the `.img` extension. "Acquire" the floppy disk
images of the MS-DOS 6.22 installer, attach a 3.5" 1.44MB virtual floppy drive
and the blank hard drive image, go into the BIOS, auto-detect the hard drive,
change boot priority to `A,C`---the usual stuff.

At this point, you should be able to boot into MS-DOS from the virtual floppy
drive and perform the installation. There are a lot of videos and articles
about this; for example, [here's a good
one](https://www.youtube.com/watch?v=M-1DIoGwp0g). Not that you would really
need help as it's all very straightforward. The MS-DOS 6.22 installer is
actually rather user-friendly and to-the-point; it will offer to create a
partition in the unallocated space for you, so let's go with that. That will
create a single 2047MB primary partition (the maximum partition size on
FAT16), so that's just perfect.

(You won't need this now because the installer will already have done it for
you, but if you ever need to make the primary hard drive partition bootable,
`FDISK C: /MBR` is the trick).

After the installer has finished, remove the virtual floppy, then reset the
machine to test booting from the hard drive. You should soon be greeted by the
familiar MS-DOS prompt. Part one accomplished!

### Writing the raw hard drive image to the CF card

I'm using Windows, so I had to find a tool to write raw disk images onto
physical drives. I used [Win32DiskImager](https://win32diskimager.org/), but
[Rufus](https://rufus.ie/), or the much more fully-featured [HDD Raw Copy
Tool](https://hddguru.com/software/HDD-Raw-Copy-Tool/) should be fine too.
There's not much else to it; you just transfer the raw disk image onto the CF
card, then pop it into your physical machine and use `FDISK` to fill up the
rest of the card with extra partitions (create an extended partition, then
`FDISK` will very thoughtfully offer to keep creating logical sub-partitions
until no more unpartitioned space is left).


## Further notes

Why not create a disk image the exact size of the CF card and do the whole
partitioning business in the emulated PC in one go? Well, the Disk Management
tool in Windows can apparently tell you the exact capacity of a drive in
bytes, but you need to specify the size of a new disk image in megabytes in
86Box. I'm quite sure I did the calculations correctly using base-2 units, but
there were still a few megabytes left at the end of the disk when I tried to do
it this way. Not that it's a huge deal, but it triggers my OCD
tendencies, so finishing the partitioning on the real computer is my preferred
approach.

Alternatively, you could create an uncompressed image of the CF card with HDD
Raw Copy Tool first, mount that in 86Box to do the installation and
partitioning, then write it back to the card in the end---this should be the
100% foolproof way to fill up the card completely.

That's it, folks! Have fun and keep MS-DOSing! 😎


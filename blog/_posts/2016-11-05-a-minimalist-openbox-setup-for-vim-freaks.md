---
layout: post
title:  "A minimalist OpenBox setup for Vim freaks"
tags: [linux, openbox, crunchbang++, vim]
date: 2016-11-05
---

{: .intro}
Are you the sort of person who is looking for a Vim plugin for everything?
Does having to reach out for the mouse sideways cause you involuntary facial
muscles twitches? Is breaking out the arrow keys with a screwdriver among the
first few things you do on a new computer (after swapping Caps Lock with
Left Ctrl, of course)? Then welcome, you're among friends here.

Now that we're done with the formalities and  have dissuaded normal computer
users and non-fanatical Vim afficionados from reading any further, let's get
to the good stuff! I vastly prefer to use a Linux desktop for development and
my trusty 32-bit Crunchbang Waldorf VM has just reached the end of its useful
life because of my sudden realisation that I really need 64-bit support.
I had spent a considerable time "vimifying" my old setup (more on that later),
which, of course, I wanted to carry over to the new installation. This post
documents all the customisations I needed to do on the stock install to
achieve that.

We will use [Crunchbang++ 1.0](https://crunchbangplusplus.org/) 64-bit as our
starting point that is based on [Debian Jessie](https://www.debian.org/)
stable. Why not use vanilla Debian instead? Because I really like the choices
[Philip Newborough](https://corenominal.org/about/) had made for the original
Cruchbang series and it would be an awful lot of work to replicate those from
scratch. Crunchbang is small, fast, stable and prioritizes function over
form---it's the perfect OpenBox based system for a minimalist. Instead of
reinventing everything, we will just make a few strategic tweaks here and
there to to make it more Vim friendly.

Why VM? Because I also do [music](http://music.johnnovak.net/), [graphics
design](http://www.johnnovak.net/) and
[photography](http://photo.johnnovak.net/), and most creative apps on Linux
just suck[^linuxsucks], plus I don't like dual booting. The performance hit is
negligible nowadays anyway on these new 4 or 8 core Intel i7 CPUs.

[^linuxsucks]: There are a few good ones though, for example I'm using the Windows version of Inkscape, but there's really no match for Lightroom or Photoshop (if you want to recommend me The Gimp at this point, please save your energy).  Moreover, the driver support for (semi-)pro audio interfaces is just non-existant on Linux, and let's not even talk about the audio software front...

Anyway, most of the instructions will be applicable to non-VM installs as
well, as I always make it clear in the text whether a particular step is VM
specific or not.

## Philosophy & main features

Although I like the concept of tiling window managers, after analysing my
common usage patterns I realised that they would be an overkill for my needs.
Most of the time, I just use tmux inside a maximized terminal window and
I rarely use more than a single window per desktop. I like to put my browser
windows (Firefox with [Vimperator](http://www.vimperator.org/vimperator)) and
PDF viewers ([mupdf](http://mupdf.com/)) onto separate desktops, so I just
need a way to quickly switch between them. And finally, sometimes I need to
view two vertically maximized windows side-by-side on the same desktop (e.g.
a terminal and a PDF viewer). That's pretty much it, anything else is so
infrequent and random that it can be just done easily with the mouse, which is
about 1% of the total use cases, so efficiency really doesn't matter there.
The important point is that 99% of the time I won't need to lift my fingers
off the home row with this configuration!

So with all this in mind, let's take a look at the main features
on a high-level:

Minimal & highly functional interface
: As hinted before, the main components of this setup will be OpenBox, zsh,
rxvt, tmux and vim. Both zsh and tmux have excellent vi modes, of which, of
course, we will take advantage of.

Global Vim-style navigation
: Seamless navigation between vim splits and tmux panes and a Vim-like way to
switch between 4 virtual desktops.

System clipboard support
: Vim and tmux have their own internal clipboards and other apps genenerally
use the system clipboard, so we'll need to invent a sane mechanism to
interoperate between these three different clipboards.

Mouse support
: As I said, I don't use the mouse very much, but when I do, I want it to work
correctly in tmux and vim (e.g. changing focus, resizing panes, copy/pasting
text etc.)

Unified colour scheme
: I really like the [Lucius](https://github.com/jonathanfilip/vim-lucius) Vim
color scheme (the default dark variant), so the whole setup will use Lucius
dark colors consistently everywhere.

In the following sub-sections we'll take a detailed look at each of these
features!

### Vimify all the things!

### Navigation

Seamless navigation among Vim splits and tmux panes is accomplished via the
excellent [Vim Tmux
Navigator](https://github.com/christoomey/vim-tmux-navigator). We'll just use
the default settings, which is Ctrl+hjkl to move between windows.

A side effect of this setup is that we won't be able to <kbd>Ctrl</kbd>+<kbd>L</kbd> to clear the
terminal anymore. There's an easy workaround for that, we'll remap <kbd>Ctrl</kbd>+<kbd>L</kbd> to
<kbd>&lt;Prefix&gt;</kbd>+<kbd>Ctrl</kbd>+<kbd>L</kbd> in the tmux config:

    bind C-l send-keys "C-l"

<table class="no-border">
  <tr>
    <td class="shortcut"><kbd>Ctrl</kbd>+<kbd>H</kbd><kbd>J</kbd><kbd>K</kbd><kbd>L</kbd></td>
    <td>Move between Vim splits & tmux panels</td>
  </tr>
  <tr>
    <td class="shortcut"><kbd>R Alt</kbd>+<kbd>J</kbd><kbd>K</kbd><kbd>L</kbd><kbd>;</kbd></td>
    <td>Switch to desktop 1 to 4</td>
  </tr>
  <tr>
    <td class="shortcut"><kbd>L Alt</kbd>+<kbd>R Alt</kbd>+<kbd>J</kbd><kbd>K</kbd><kbd>L</kbd><kbd>;</kbd></td>
    <td>Send window to desktop 1 to 4</td>
  </tr>
  <tr>
    <td class="shortcut"><kbd>Win</kbd>+<kbd>Shift</kbd>+<kbd>H</kbd><kbd>J</kbd><kbd>K</kbd><kbd>;</kbd></td>
    <td>Half-screen tile window</td>
  </tr>
</table>

ADD:
xmodmap ~/.Xmodmap &

    xev tool displaying keycodes
    capslock  37
    left ctrl 66
    right alt 108

openbox/rc.xml
http://openbox.org/wiki/Help:Bindings#Key_bindings

CHANGE:
    change number of desktops to 4
        <desktops>
          <number>4</number>
    DirectionalCycleWindows  hjkl

    W-t -> urxvt
    tiling - W-S-hjkl

    screendEdgeWarpTime -> 0
    screenEdgeWarpMouse -> true

    terminator & urxvt -> <decor>no</decor>

REMOVE:
    remove relative GoToDesktop shortcuts (left, right, up, down)
    DirectionalCycleWindows

ADD:
    keybing Reconfigure
    H-jkl; GoToDesktop



### Clipboard support

Getting the shared system clipboard (X11 selections) to work consistently
across different GUI and command line apps on Linux can undoubtedly be a hair
loss-inducing experience. One of the sources of confusion is that we are
usually dealing with two clipboards in X11, not just one like on Windows or OS
X. First, there's the normal clipboard most well-behaved GUI apps use for
the <kbd>Ctrl</kbd>+<kbd>X</kbd><kbd>C</kbd><kbd>V</kbd> operations (officially
referred to as the **clipboard selection**), and then there's the
select-with-mouse-and-paste-with-middle-click variant (the **primary
selection**). (There's a third one called **secondary selection** too, but
no one ever uses that for anything, as far as I'm aware. One less thing to
worry about!)

Most GUI apps handle the clipboard and primary selections just as expected
(the GTK apps included with Crunchbang certainly do). The problems start when
we want certain console apps---like tmux and vim---that have their own
internal buffers, to interoperate with X11 selections, so we can copy/paste
text from them into GUI apps, and vice versa. This is also needed for
clipboard interoperability with the guest OS; with bidirectional clipboard
support enabled in VirtualBox, the Windows clipboard operations will use the
X11 clipboard selection just like Linux GUI apps do (but note that the primary
selection is not supported, so no middle-click copy/paste between the host
and the guest).

My general idea is to use the
<kbd>Ctrl</kbd>+<kbd>X</kbd><kbd>C</kbd><kbd>V</kbd> shortcuts in tmux and vim
to interact with the clipboard selection, while retaining the ability to use
their internal buffers with their native clipboard commands. Let's see how can
we achieve that!

#### Vim

Teaching vim how to do this is quite simple, we'll define the following
mappings in our `.vimrc`:

    vnoremap <C-x> "+x
    vnoremap <C-c> "+y
    noremap  <C-v> "+gP
    inoremap <C-v> <C-r>+

However, we now have just overridden the default <kbd>Ctrl</kbd>+<kbd>V</kbd>
block selection shortcut. Let's remap it to <kbd>Ctrl</kbd>+<kbd>Q</kbd>
instead (which is the behaviour of gVim on Windows, by the way ):

    noremap <C-q> <C-v>

This is almost good, but sadly it turns out that <kbd>Ctrl</kbd>+<kbd>Q</kbd> and
<kbd>Ctrl</kbd>+<kbd>S</kbd> are reserved for an ancient terminal feature
called [flow control](https://en.wikipedia.org/wiki/Software_flow_control). We
definitely don't need that, so let's reclaim them and put them to a better
use:

    # reclaim Ctrl-S
    stty stop undef

    # reclaim Ctrl-Q
    stty start undef

Middle-click pasting from GUI apps into Vim works perfectly fine both in command
and insert mode, so we're done.

#### tmux

The situation gets quite a bit trickier in the case of tmux.

The clipboard manager Clipit included with Crunchbang has a command line interface to
interact with the system clipboard, however I never could get it to work (and
neither could others, according to the old Cruncbang forums).

    bind -t vi-copy "C-v" copy-pipe "xclip -selection clipboard"

a

    bind -n C-v if-shell "\$is_vim" "send-keys C-v" "run-shell \
        \"tmux set-buffer \\\"\$(xclip -o -selection clipboard)\\\"; \
        tmux paste-buffer\""


{: .no-math}
    is_vim="ps -o state= -o comm= -t '#{pane_tty}' \
        | grep -iqE '^[^TXZ ]+ +(\\S+\\/)?g?(view|n?vim?x?)(diff)?$'"

Obvious what it's doing, isn't it? I thought so.

### Mouse support

### Unified colour scheme




- - -

## Installation

First, we'll need the following ingredients:

{: .compact }
* [VirtualBox 5.1.8](https://www.virtualbox.org/wiki/Downloads) (or newer)
* [Crunchbang++ 1.0](https://crunchbangplusplus.org/) 64-bit image ([torrent](https://crunchbangplusplus.org/assets/misc/cbpp-1.0-amd64-20150428.iso.torrent))
* Internet connection (Crunchbang is based on Debian netinstall)

We'll need to create a new VM with *Linux 2.6 / 3.x / 4.x (64-bit)* selected
as the guest operating system type. *Debian (64-bit)* would probably work too,
but I haven't tested it. I'm on an Intel i7 4790k 4.0 GHz with 16 gigs of
RAM, so I just allocated 4 CPU cores and 4 gigs to the new VM and created a 40
GB dynamic storage on an SSD partition (recommended). Pretty standard stuff,
but pay attention to the following issues:

* Make sure that *Enable PAE/NX System* is checked under *System / Processor
/ Extended Features*, otherwise the installer will fail.

* Check *Enable VT-x/AMD-V* under *System / Acceleration / Hardware
Virtualization*, otherwise AVX passthrough won't work (if this doesn't make
sense to you, then you have nothing to worry about). Of course, your processor
must support that and it has to be enabled in the BIOS.

* I had network connectiviy issues with VirtualBox 4.x and
Crunchbang Waldorf when using NAT. In the end, I just switched to bridged
mode that made the problem go away. This might not be an issue anymore, but
I got used to bridged, so I haven't bothered experimenting with NAT this time.

From this point it's easy sailing, insert the ISO and proceed with the
install. I recommend using the text mode installer because the GUI one hung at
some point during downloading the packages. Everything should be
self-explanatory, just accept the default HDD partitioning scheme (or you can
complicate things, up to you).

## On first boot

About 30-60 minutes later, we will be greeted by the `cbpp-welcome` script
that will offer us to update the system and install some optional packages.
We'll do that, but later, so just exit for now. Our first objective is to get
the desktop environment up and running, then we'll do the system update and
finally we'll fix a few issues and perform some other usability enhancements.

### Set zsh as default shell

My first thing to do on a new system is switch to **zsh**, so let's install
that quickly with `sudo apt-get install zsh` and then set it as the default
login shell. Just run `chsh` and enter `/bin/zsh` as the new value. Note that
the change will only take effect on the next login.

It is also recommended to set `x-terminal-emulator` to zsh because the
built-in OpenBox menus use it:

    % sudo update-alternatives --config x-terminal-emulator

### Install VirtualBox Guest Additions

We need to install the VirtualBox Guest Additions to get fullscreen,
bidirectional clipboard and drag-and-drop support working. This will also make
the screen updates snappier and it will fix the default jerky mouse pointer
behaviour, which is quite horrible. But before we could proceed, the kernel
headers must be installed first:

    % sudo apt-get install linux-headers-$(uname -r)

After this, select *Insert Guest Additions CD image...* in the *Devices* menu
in VirtualBox. You might need to create a virtual optical drive first in the
VM settings if you haven't done so already (remember that you can only do that
when the VM is shut down, otherwise the *Add optical drive* button on the
*Storage* tab will be disabled).

Now we can install the additions:

    % cd /media/cdrom
    % sudo sh ./VBoxLinuxAdditions.run

Don't forget to set *Shared Clipboard* and *Drag'n'Drop* to *Bidirectional*
under *General / Advanced* in the VM settings. Enter fullscreen mode (Right
Ctrl + F), reboot, and you should be rewarded with a glorious fullscreen
Crunchbang desktop sporting a fluid mouse pointer for your efforts!

### Perform system update

CrunchBangPlusPlus 1.0 was released more than a year ago, so we should
definitely update the system to the latest Debian Jessie packages. The easiest
way to do this is to run the `cbpp-welcome` script again and let it update the
software sources and the system (answer *Yes* to the first two questions).
This will take a while, depending on the speed of your network (I think it was
about an hour for me). After this, you'll have the option to install a few
more additional packages.

### Fix Compton

For some reason, Compton (the compositor responsible for window transparency,
drop shadows and other eye candy) could not start up properly in my VirtualBox
setup. It turned out that the startup script tried to enable OpenGL vsync by
default and that was causing the issues, so we'll just disable that by
commenting lines 18-20 out in `/usr/bin/cbpp-compositor`:

    #if glxinfo | egrep -iq 'direct rendering: yes'; then
    #    EXECXCOMP+=' --vsync opengl'
    #fi

Restart Compton by selecting *Settings / Compositor / Restart Compositing* in
the OpenBox right-click menu and take a moment to marvel at the tasteful drop
shadows around your window edges!

### Disable the screensaver

    openbox/autostart
        COMMENT OUT:
        xscreensaver -no-splash &

    sudo apt-get remove xscreensaver


### Enable autologin

If you're the sole user of this VM, you'll probably want to enable autologin.
Edit `/etc/slim.conf` and change the following three parameters:

    login_cmd       exec /bin/bash -login /etc/X11/Xsession %session
    auto_login      yes
    default_user    YOUR_USERNAME

### Installing Powerline fonts

Some people maintain that one can live a full and prosperous life without
[Powerline fonts](https://github.com/powerline/fonts).  Needless to say, this
is utter bollocks. Those in the know will surely follow my wise advice and
issue the following sequence of commands:

    % cd /tmp
    % wget https://github.com/powerline/fonts/archive/2015-12-04.zip
    % unzip 2015-12-04.zip
    % mkdir ~/.fonts/
    % cp Literation\ Mono\ Powerline.ttf Liberation\ Mono\ Powerline.ttf ~/.fonts/
    % fc-cache -vf ~/.fonts/

### Setting the *right* wallpaper

No desktop Linux setup is ever complete without a wallpaper, but, of course, the
chosen wallpaper has to be the *right* one. Look

wallpaper:
    righ-click / Settings/ Change Wallpaper



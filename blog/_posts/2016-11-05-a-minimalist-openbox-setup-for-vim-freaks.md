---
layout: post
title:  "A minimalist OpenBox desktop for Vim freaks"
tags: [Linux, OpenBox, Crunchbang++, Vim]
date: 2016-11-05
published: false
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
starting point which is based on [Debian Jessie](https://www.debian.org/)
stable. Why not use vanilla Debian instead? Because I really like the choices
[Philip Newborough](https://corenominal.org/about/) had made for the original
Cruchbang series and it would be an awful lot of work to replicate them from
scratch. Crunchbang is small, fast, stable and prioritizes function over
form---it's the perfect OpenBox based system for a minimalist. Instead of
reinventing everything, we will just make a few strategic tweaks here and
there to to make it more Vim friendly.

Why VM? Because I also do [music](http://music.johnnovak.net/), [graphics
design](http://www.johnnovak.net/) and
[photography](http://photo.johnnovak.net/), and most creative apps on Linux
just suck[^linuxsucks], plus I don't like dual booting. The performance hit is
negligible nowadays anyway on these new 4 or 8 core Intel i7 CPUs.  But most
of the instructions will be applicable to non-VM installs as well as I will
always make it clear in the text whether a particular step is VM specific or
not.

The bulk of the information presented in this article is a distillation of
ideas, tips and config snippets from various online sources far too numerous
to mention (or even just remember). Still, the [old Crunchbang
forums](http://crunchbang.org/forums/) and the excellent [ArchLinux
wiki](https://wiki.archlinux.org/) definitely stand out as the two best sources of
quality information on more arcane issues that you can't always figure out by
reading the man pages alone.

[^linuxsucks]: There are a few good ones though, for example I'm using the Windows version of Inkscape, but there's really no match for Lightroom or Photoshop (if you want to recommend me The Gimp at this point, please save your energy).  Moreover, the driver support for (semi-)pro audio interfaces is just non-existant on Linux, and let's not even talk about the audio software front...


## Philosophy & main features

Although I like the concept of tiling window managers, after analysing my
common usage patterns I realised that they would be an overkill for my needs.
Most of the time I just use tmux inside a maximized terminal window and
I rarely use more than a single window per desktop. I like to put my browser
windows (Firefox with [Vimperator](http://www.vimperator.org/vimperator)) and
PDF viewers ([mupdf](http://mupdf.com/)) onto separate desktops, so I just
need a way to quickly switch between them. Sometimes I need to view two
vertically maximized windows side-by-side on the same desktop (e.g.
a terminal and a PDF viewer), but that's pretty much it. Anything else is so
infrequent and random that it can be just done easily with the mouse, which is
less than %% of the total use cases, so efficiency really doesn't matter
there.  The important point is that 95% of the time I won't need to lift my
fingers off the home row with this configuration!

So with all this in mind, let's take a look at the main features
on a high-level:

Minimal & highly functional interface
: I find the default Crunchbang theme just perfect, so we will be building
everything on top of that. The main components of the setup will be OpenBox,
zsh, urxvt, tmux and---of course---Vim.

Global Vim-style navigation
: Seamless navigation between Vim splits and tmux panes and a Vim-like way to
switch between 4 virtual desktops.

System clipboard support
: While Vim and tmux have their own internal clipboards, other GUI apps
generally use the system clipboard, so we'll need to invent a sane mechanism
to interoperate between them.

Mouse support
: I don't use the mouse very much, but when I do, I want it to work correctly
in tmux and Vim (e.g. changing focus, resizing panes, copy/pasting text etc.)

Unified colour scheme
: I really like the [Lucius](https://github.com/jonathanfilip/vim-lucius) Vim
color scheme (the default dark variant), so the whole setup will use Lucius
dark colors consistently.

In the following sub-sections we'll take a detailed look at some of the more
difficult to configure features. I won't go through every single line in every
config file because they I would be writing this article for the next two
months... Just take a look at [my
dotfiles](https://github.com/johnnovak/dotfiles) if you're interested, or
better yet, clone/download the repo and run `install.sh` to set it up on your
system. The installer assumes a vanilla [Crunchbang++
1.0](https://crunchbangplusplus.org/) with some extra packages. The second
part of this article provides detailed instructions on how to set up the whole
thing from scratch into a new VirtualBox VM (most for my own reference, but
maybe others will find it useful too).

### Navigation

#### Vim & tmux

Seamless navigation among Vim splits and tmux panes is accomplished via the
excellent [Vim Tmux
Navigator](https://github.com/christoomey/vim-tmux-navigator). We'll just use
the default settings that will map <kbd>Ctrl</kbd>+<kbd>H</kbd><kbd>J</kbd><kbd>K</kbd><kbd>L</kbd> to move between panes.

A side effect of this setup is that we won't be able to use
<kbd>Ctrl</kbd>+<kbd>L</kbd> to clear the terminal anymore. There's an easy
workaround for that; we'll remap <kbd>Ctrl</kbd>+<kbd>L</kbd> to
<kbd>&lt;Prefix&gt;</kbd>+<kbd>Ctrl</kbd>+<kbd>L</kbd> in the tmux config:

    bind C-l send-keys "C-l"

#### xmodmap

Hey, wait a minute, chief! What's xmodmap doing here? xmodmap is a tool for
modifying X keymaps and mouse button mappings. We are going to use it to
differentiate between the left and right <kbd>Alt</kbd> modifiers when
defining our OpenBox shortcuts. I happened to come up with this bright idea of
switching between desktops 1 to 4 with <kbd>R
Alt</kbd>+<kbd>J</kbd><kbd>K</kbd><kbd>L</kbd><kbd>;</kbd> and to send the
current window to another desktop with <kbd>L Alt</kbd>+<kbd>R
Alt</kbd>+<kbd>J</kbd><kbd>K</kbd><kbd>L</kbd><kbd>;</kbd>. Try them out,
they're really comfortable and quick to use from the home row if you pressed
the <kbd>Alt</kbd> buttons with your thumbs!

This is how our `~/.Xmodmap` file will look like. First, we'll need to map the
keycode of <kbd>L Alt</kbd> to `Alt_L` and <kbd>R Alt</kbd> to  `Hyper_R`.
Why `Hyper_R` and not `Alt_R`? Well, because my keyboard happens to generate
the keycode for `Hyper_R` when I press <kbd>R Alt</kbd>. To find out the exact
keycode for your keyboard (it might be different), use the `xev` (X Event
Viewer) utility.

    keycode 64 = Alt_L NoSymbol Alt_L
    keycode 108 = Hyper_R NoSymbol Hyper_R

After this

    clear Shift
    clear Control
    clear Mod1
    clear Mod2
    clear Mod3
    clear Mod4
    clear Mod5

    add Shift = Shift_L Shift_R
    add Control = Control_L Control_R
    add Mod1 = Alt_L
    add Mod2 = Num_Lock
    add Mod3 = Hyper_R
    add Mod4 = Super_L
    add Mod5 = ISO_Level3_Shift


So just to recap, here's all the shortcuts we have configured so far:

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
we want certain console apps---like tmux and Vim---that have their own
internal buffers, to interoperate with X11 selections, so we can copy/paste
text from them into GUI apps, and vice versa. This is also needed for
clipboard interoperability with the guest OS; with bidirectional clipboard
support enabled in VirtualBox, the Windows clipboard operations will use the
X11 clipboard selection just like Linux GUI apps do (but note that the primary
selection is not supported, so no middle-click copy/paste between the host
and the guest).

My general idea is to use the
<kbd>Ctrl</kbd>+<kbd>X</kbd><kbd>C</kbd><kbd>V</kbd> shortcuts in tmux and Vim
to interact with the clipboard selection, while retaining the ability to use
their internal buffers with their native clipboard commands. Let's see how we
can achieve that!

#### Vim

Teaching Vim how to do this is quite simple, we'll define the following
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

The situation gets a bit trickier in the case of tmux, which doesn't have any
direct support for X selections, so we'll need to resort to external tools
combined with some shell magic.

The GTK+ clipboard manager [ClipIt](https://github.com/CristianHenzel/ClipIt)
included with Crunchbang has a command line interface that can interact with
the system clipboard (in theory), however, I could never get it to work, and
neither could others, according to the old Cruncbang forums. So we'll need to
grab another tool that does actually work, and the aptly titled **xclip** happens
to just fit the bill:

    sudo apt-get install xclip

Armed with xclip, we can now configure tmux to pipe our selection to xclip
when hitting <kbd>Ctrl</kbd>+<kbd>C</kbd> in vi-copy mode:


    bind -t vi-copy "C-c" copy-pipe "xclip -selection clipboard"

Pasting is a bit more difficult because tmux shortcuts have precedence over
the Vim ones, so we need to detect whether we're pressing
<kbd>Ctrl</kbd>+<kbd>V</kbd> in a Vim session inside a tmux pane or just in
a regular terminal pane. In the Vim pane case we'll simply pass the
<kbd>Ctrl</kbd>+<kbd>V</kbd> through to Vim, otherwise we'll execute our tmux
specific paste magic. Without the passthrough trick tmux would send the
contents of the clipboard to Vim as a sequence of commands to execute, which
would be a total disaster in command mode. It would work in insert mode,
though, but that's a crappy half-assed solution--- let's just do this properly
and make it work correctly in both modes! Here's how (apologies for the two
levels of escaping, but that's unavoidable):

    bind -n C-v if-shell "\$is_vim" "send-keys C-v" "run-shell \
        \"tmux set-buffer \\\"\$(xclip -o -selection clipboard)\\\"; \
        tmux paste-buffer\""

This idea is taken from
[vim-tmux-navigator](https://github.com/christoomey/vim-tmux-navigator]), and
in fact, we are reusing the `is_vim` command from their tmux config snippet.
For the sake of completeness (and because it contains a marvellously repulsive
regular expression), I will include it here:

{: .no-math}
    is_vim="ps -o state= -o comm= -t '#{pane_tty}' \
        | grep -iqE '^[^TXZ ]+ +(\\S+\\/)?g?(view|n?vim?x?)(diff)?$'"

Quite obvious what it's doing, isn't it? I thought so too.

### Mouse support

#### Vim

Enabling mouse support in Vim is surprisingly easy:

    if has('mouse')
      set mouse=a
    endif

That's it! This will let us navigate and resize splits with the mouse, and use
the select/middle-click primary clipboard mechanism.  Of course, you'll need
a Vim version with mouse support enabled for this (I recommend the kitchen-sink
`vim-nox` package which was compiled with support for basically all Vim
features).

#### tmux

As we would expect, tmux is a harder nut to crack. The following will enable
mouse support on tmux &lt;2.0 (1.9-6 is the latest stable version for Jessie).

    set -g mode-mouse on
    set -g mouse-resize-pane on
    set -g mouse-select-pane on
    set -g mouse-select-window on

This is all good so far, but there are a few caveats with how mouse selections
will interact with the system clipboard handling we have configured earlier.
First of all, just selecting some text and then releasing the mouse button
will copy the selection into the internal tmux buffer. If we want it to be
copied into the clipboard selection instead, we must press
<kbd>Ctrl</kbd>+<kbd>C</kbd> *before* releasing the mouse button!

The handling of primary selections is similarly quirky: to paste the contents
of the primary selection into a tmux pane, we must hold <kbd>Shift</kbd> while
middle-clicking. To make a primary selection, we must again hold
<kbd>Shift</kbd> while click-dragging, but this unfortunately bypasses tmux
altogether, so multiline selections with vertically split panes won't work
very well (experiment with it a bit and you'll see what I mean). The
workaround for this is to maximize the pane before making the selection. To
the best of my knowledge, there are no better solutions for the tmux primary
selection issues at the moment.

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

{::options parse_block_html="true" /}
<section class="links">

## Further reading

{: .compact}
* [The big list of Vi[m]-like software](https://xaizek.github.io/2016-08-13/big-list-of-vim-like-software/)

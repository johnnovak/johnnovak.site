---
layout: post
title:  "Creating a Nim wrapper for FMOD"
tags: [coding, nim, c, audio]
date: 2018-07-07
---


{% include toc.html %}


## Overview

One of the many attractive things about Nim is its ability to interface with
C libraries relatively easily, be they either statically linked or dynamically
loaded. As all Nim source code is ultimately transformed to C code during
compilation [^javascript], Nim's
C [FFI](https://nim-lang.org/docs/manual.html#foreign-function-interface) is
unsurprisingly quite minimal. We still need to do some work, though, namely
creating a Nim wrapper that will define our Nim API to the C library.

Thankfully, we don't need to do all this by hand; there's a handy tool aptly
called `c2nim` that can automatically generate such a wrapper from the
C header files. But, as we'll shortly see, while the tool is a great help to
do the bulk of the grunt work, the generated files often need some further
manual massaging to become usable.

In this article, we'll examine the full process of creating a Nim wrapper for
the well-known [FMOD audio library](https://fmod.com), more specifically, for
the FMOD Low Level API. Fortunately, FMOD provides both a C++ and C API, so we
can just use the C headers which usually makes the job a lot easier than
dealing with all the C++ nonsense...

## Prerequisites

First, we need to register at the [FMOD website](https://fmod.com) to be able
to [download](https://fmod.com/download) the FMOD Studio API.  The naming is
a bit misleading because it actually contains the header and library files for
*both* the FMOD Studio API and the FMOD Low Level API. There are three
separate downloads for Windows, Linux and OS X. The C header files are located
in `api/lowlevel/inc` and the shared libraries in `api/lowlevel/lib` inside
the archives.

We'll also need to install the [c2nim](https://github.com/nim-lang/c2nim) tool
to convert the C header files into Nim wrappers (it doesn't come with the
standard Nim installation). The project's GitHub page contains the
installation instructions.

## Auto-generating the basic wrapper

The main header file is `fmod.h`, but if we just tried to convert it using
`c2nim`, we would get errors. The reasons for this is that `c2nim` does not
perform C preprocessor expansion---we'll need some help from `gcc` to do that
as the first step:

    gcc -E fmod.h -o fmod_prep.h

Now we can run `c2nim` on the resulting preprocessed header file without
errors:

    c2nim fmod_prep.h

Yikes! Let's try to compile it:

    % nim c fmod_prep.nim
    Hint: used config file '/Users/johnnovak/.choosenim/toolchains/nim-0.18.0/config/nim.cfg' [Conf]
    Hint: system [Processing]
    Hint: fmod_prep [Processing]
    fmod_prep.nim(219, 45) Error: undeclared identifier: 'FMOD_SYSTEM'

***[ CUE SAD TROMBONE... ]***

Well, looks like there's some extra work to be done here!

## Fixing conversion errors -- Part 1

Okay, first comes the easy part, let's fix the compilation errors!

### Opaqueue C structs

It turns out that the above error was raised because `c2nim` just ignores
opaque C structs. So we'll need to manually add the Nim equivalents of all
the opaque structs found in `fmod_common.h`:

{% highlight c %}
typedef struct FMOD_SYSTEM FMOD_SYSTEM;
typedef struct FMOD_SOUND          FMOD_SOUND;
typedef struct FMOD_CHANNELCONTROL FMOD_CHANNELCONTROL;
typedef struct FMOD_CHANNEL        FMOD_CHANNEL;
...
{% endhighlight %}

Here's the corresponding Nim conversion:

{% highlight nimrod %}
type
  FMOD_SYSTEM* = object
  FMOD_SOUND* = object
  FMOD_CHANNELCONTROL* = object
  FMOD_CHANNEL* = object
  ...
{% endhighlight %}

### Circular types

Our next compilation attempt is awarded with the following error:

    % nim c fmod_prep.nim
    Hint: used config file '/Users/johnnovak/.choosenim/toolchains/nim-0.18.0/config/nim.cfg' [Conf]
    Hint: system [Processing]
    Hint: fmod_prep [Processing]
    fmod_prep.nim(775, 52) Error: undeclared identifier: 'FMOD_DSP_STATE'

This is caused by circular type definitions in the C header and it's quite
easy to fix---we just need to collapse all individual type definitions
into a single `type` block (mutually dependent types are only allowed within
a single `type` block in Nim).

### Unsigned integer literals

The C type of the FMOD constants is `unsigned int`, which gets mapped to
unsigned 32-bit integers by most C compilers by tradition. In Nim, however,
integer literals are interpreted as Nim signed `int` types, which are mapped to
the word-length of the target architecture---signed 64-bit ints, in our case.
The current Nim implementation (0.18.0) has a quirk that it will convert such
signed 64-bit int literals only if they fit into the *signed* width range of
the target variable (which is signed 32-bit in this case):

So the following definition

{% highlight nimrod %}
type
  FMOD_MEMORY_TYPE* = cuint
  ...
  FMOD_MEMORY_ALL*: FMOD_MEMORY_TYPE = 0xFFFFFFFF
{% endhighlight %}

will result in the below compilation error:

    fmod.nim(2327, 40) Error: type mismatch: got <int64> but expected 'FMOD_MEMORY_TYPE = uint32'

This can get a bit confusing, but the workaround is quite simple: just append
the `'u32` suffix to all literals that cannot be represented in the signed
version of the target width:

{% highlight nimrod %}
  FMOD_MEMORY_ALL*: FMOD_MEMORY_TYPE = 0xFFFFFFFF'u32
{% endhighlight %}

## Dynamic linking

Alright, we can compile our Nim wrapper now, but we'll need to make a few
adjustments to make it work with the FMOD shared libraries.

This is how the generated Nim function signatures look like:

{% highlight nimrod %}
proc FMOD_System_PlaySound*(system: ptr FMOD_SYSTEM; sound: ptr FMOD_SOUND;
    channelgroup: ptr FMOD_CHANNELGROUP; paused: FMOD_BOOL;
    channel: ptr ptr FMOD_CHANNEL): FMOD_RESULT
{% endhighlight %}

The most flexible way to support shared library loading on multiple platforms
is to add a user-defined `fmodImport` pragma to all function signatures and
of course the `cdecl` pragma to use C calling conventions:

{% highlight nimrod %}
proc FMOD_System_PlaySound*(system: ptr FMOD_SYSTEM; sound: ptr FMOD_SOUND;
    channelgroup: ptr FMOD_CHANNELGROUP; paused: FMOD_BOOL;
    channel: ptr ptr FMOD_CHANNEL): FMOD_RESULT {.fmodImport, cdecl.}
{% endhighlight %}

The definition of the  `fmodImport` pragma is the following (note that it's
possible to link against the logging version of FMOD by specifying the
`-d:fmodDebugLog` compiler option):

{% highlight nimrod %}
import strformat

when defined(fmodDebugLog):
  var L {.compileTime.} = "L"
else:
  var L {.compileTime.} = ""

when defined(windows):
  when defined(amd64):
    const FmodDll = fmt"fmod{L}64.dll"
  when defined(i386):
    const FmodDll = fmt"fmod{L}.dll"

elif defined(macosx):
  const FmodDll = fmt"libfmod{L}.dylib"

else:
  const FmodDll = fmt"libfmod{L}.so"

{.pragma: fmodImport, dynlib: FmodDll.}
{% endhighlight %}

## Fixing conversion errors --- Part 2

So far so good, now we can compile the wrapper, we can load the shared library
and access its exported functions from Nim, but there's still one critical
adjustment that needs to be made, otherwise we'd get failures at runtime.
Apart from that, some useful constant and helper function definitions got lost
in the conversion process, so we'll need to add them in manually as well.

These problems are usually only spotted when one tries to actually use the
generated wrapper, so it's recommended to always give the wrappers some testing
before releasing them to the public and don't just assume that `c2nim` did the
right thing.

### FMOD callbacks and function pointers

FMOD makes an extensive use of user-defined callback functions in its
low-level API. Now, as we'll implement these callbacks in Nim, we need
to tell the compiler to use C calling conventions for them, otherwise we'd get
random crashes at runtime[^nimproc].

This is how a such callback definition looks like as output by `c2nim`:

{% highlight nimrod %}
FMOD_SOUND_PCMREAD_CALLBACK* = proc (sound: ptr FMOD_SOUND; data: pointer;
                                     datalen: cuint): FMOD_RESULT
{% endhighlight %}

All we need to do is add the `cdecl` pragma to all `FMOD_*_CALLBACK` type
definitions:

{% highlight nimrod %}
FMOD_SOUND_PCMREAD_CALLBACK* = proc (sound: ptr FMOD_SOUND; data: pointer;
                                     datalen: cuint): FMOD_RESULT {.cdecl.}
{% endhighlight %}

FMOD also exposes a large number of its internal C functions through structs
containing function pointers (all `FMOD_*_FUNC` type definitions); we'll need
to mark these as C functions as well:

{% highlight nimrod %}
FMOD_DSP_GETUSERDATA_FUNC* = proc (dsp_state: ptr FMOD_DSP_STATE;
                                   userdata: ptr pointer): FMOD_RESULT {.cdecl.}
{% endhighlight %}


{: .note}
I just realised at the end that if you supply the `--cdecl` option to `c2nim`,
it will correctly annotate all function and function pointer declarations with
the `cdecl` pragma---certainly much more convenient than having to do it
manually!

{: .warning}
FMOD creates its own threads (at least by default), so these callbacks will be
most likely invoked from different threads which would wreak havoc on the Nim
garbage collector (meaning we'll get random crashes). The solution is to
compile with thread local storage emulation turned off (`-d:tlsEmulation=off`)
and invoke `system.setupForeignThreadGc()` at the start of every callback proc.
For further details see the [Nim Backend Integration Manual](
https://nim-lang.org/docs/backends.html#memory-management-thread-coordination).

### Missing constants

It becomes quickly apparent during actual usage that lots of the `FMOD_*`
constants defined as `#define` macros in the C headers are missing from our
wrapper. We can instruct `gcc` to include all macro definitions in the
preprocessed output, but this will include *every* single `#define` macro,
including the internal ones used by the compiler, so it's best to narrow the
results down the ones we're actually interested in:

    gcc -E -dD fmod.h | grep "#define FMOD_" > fmod_constants.h

Now it's just a matter of simply converting them to Nim constants.
The reverb presets deserve a special mention:

{% highlight c %}
#define FMOD_PRESET_OFF { 1000, 7, 11, 5000, 100, 100, 100, 250, 0, 20, 96, -80.0f }
{% endhighlight %}

Observer how nicer these look in Nim :)

{% highlight nimrod %}
const
  FMOD_PRESET_OFF* = FMOD_REVERB_PROPERTIES(
    decayTime: 1000,
    earlyDelay: 7,
    lateDelay: 11,
    hfReference: 5000,
    hfDecayRatio: 100,
    diffusion: 100,
    density: 100,
    lowShelfFrequency: 250,
    lowShelfGain: 0,
    highCut: 20,
    earlyLateMix: 96,
    wetLevel: -80
  )
{% endhighlight %}

### Error handling helpers

Another thing that's missing is the `FMOD_ErrorString` helper function from
`fmod_error.h` to convert FMOD error codes into human readable messages. It's
trivial to convert the function, we're just mentioning it here for
completeness.

## Improving the wrapper

Now that the wrapper is fully functional, we'll make a little adjustment to
make it more Nim-like. Recall how a typical FMOD function looks like:

{% highlight nimrod %}
proc FMOD_System_PlaySound*(system: ptr FMOD_SYSTEM; sound: ptr FMOD_SOUND;
    channelgroup: ptr FMOD_CHANNELGROUP; paused: FMOD_BOOL;
    channel: ptr ptr FMOD_CHANNEL): FMOD_RESULT {.fmodImport, cdecl.}
{% endhighlight %}

This is the de-facto standard "object-oriented C" style, where the functions
are prefixed with the classname (`FMOD_System` in this case) and the first
argument is the `this` instance pointer. We can remove the prefix to make the
API more Nim like:

{% highlight nimrod %}
proc playSound*(system: ptr FMOD_SYSTEM; sound: ptr FMOD_SOUND;
    channelgroup: ptr FMOD_CHANNELGROUP; paused: FMOD_BOOL;
    channel: ptr ptr FMOD_CHANNEL): FMOD_RESULT {.fmodImport, cdecl.}
{% endhighlight %}

After performing the above adjustment on all functions (with the help of some
Vim macro magic), we can take advantage of Nim's [method call
syntax](https://nim-lang.org/docs/manual.html#procedures-method-call-syntax)
and [identifier equality
rules](https://nim-lang.org/docs/manual.html#lexical-analysis-identifier-equality)
to use the API in an object-oriented style (error checking is omitted for
brevity):

{% highlight nimrod %}
var
  res: FmodResult
  system: ptr FmodSystem
  sound: ptr FmodSound
  channel: ptr FmodChannel

discard create(system.addr)
discard system.init(512, FMOD_INIT_NORMAL, nil)
discard system.createSound("media/jaguar.wav", FMOD_DEFAULT, nil, sound.addr)
discard system.playSound(sound, nil, 0, channel.addr)
sound.release()

{% endhighlight %}

## Conclusion

That's it folks! It might seem a bit complicated first, but it's a pretty
quick process once you are aware of all the gotchas.

The biggest drawback of this approach, though, is its very manual nature.
Every time the API changes, the conversion process must be repeated which is
time consuming and error prone. There exists a helper tool called
[nimgen](https://github.com/genotrance/nimgen) that aims to automate this
process, so if I was to do this again, I would certainly give that tool a go.
Still, doing it fully manually at least once is a valuable learning experience
to understand what should actually be automated.

The finished version of the `nim-fmod` wrapper is available on
[GitHub](https://github.com/johnnovak/nim-fmod) with some examples included
and as a [Nimble](https://github.com/nim-lang/nimble) package.

Happy Nimming! :)


[^javascript]: Of course, this is not true in case of the experimental JavaScript backend.

[^nimproc]: One way to spot Nim proc pointers is that they occupy twice as much memory than C function pointers. So on 64-bit while a C function pointer is 8-bytes, a Nim proc pointer is 16-bytes (as of Nim 0.18.0). One beneficial side-effect of this is that all C structs containing function pointers will end up being the wrong size if the `cdecl` pragma is not added to the callback definitions, and because FMOD is strict about checking struct sizes passed in to its functions, we'd get struct size mismatch errors from FMOD instead of just crashing. In fact, this is how I spotted this problem in the first place.

{: .noline }
- - -

{::options parse_block_html="true" /}
<section class="links">

## Further links of interest

{: .compact}
* [FMOD Homepage](https://fmod.com/)
* [FMOD Low Level API &mdash; An Overview](https://fmod.com/resources/documentation-api?page=content/generated/common/lowlevel_introduction.html)
* [FMOD Low Level API Reference](https://fmod.com/resources/documentation-api?page=content/generated/lowlevel_api.html#/)
* [nim-fmod GitHub repository](https://github.com/johnnovak/nim-fmod)
* [c2nim GitHub repository](https://github.com/nim-lang/c2nim)
* [c2nim User's Manual](https://github.com/nim-lang/c2nim/blob/master/doc/c2nim.rst)
* [Nim Manual &mdash; Foreign function interface](https://nim-lang.org/docs/manual.html#foreign-function-interface)
* [Nim Backend Integration Manual](https://nim-lang.org/docs/backends.html#memory-management-thread-coordination)

---
title: "Most people don't need a colour managed workflow"
date:  2021-06-06
tags:  []
draft: true
---

Consider the following---and, in my view, quite common---scenario:

1. Joe buys a shiny new digital camera. Happiness ensues.

2. He starts getting into post-processing his photos on the computer.
   Eventually, he gets some of them printed at a lab.

3. The printed output doesn't quite match what he sees on the screen. Joe is
   now less happy.

4. He reads some blog post on a photography website about these so-called
   magical gadgets called *Monitor Calibration Tools* that claim to fix all
   his problems. Wow, what a wonderful time to be alive, Joe thinks to
   himself. Naturally, he goes and gets a $200 calibrator, effectively
   spending the cost of his monitor again.

6. After much tinkering and another round of tests prints, the results are
   better but still not perfect. Joe now has a second problem: he likes to use
   his computer for other things than photography too (e.g. web browsing,
   playing games, watching movies, etc.) But now the colours in his non-colour
   managed apps are strangely off. Moreover, his photos still look all over
   the place on other people's screens. Wasn't that calibrator thingy supposed
   to fix all that?

7. A year later, Joe realises that the HDMI output range of his Nvidia card was
   set to Limited (16-235), so he had been attempting to "fix" that with the
   monitor calibration all along...

8. Okay, time to buy a *wide RGB gamut* screen! That and calibration would
   *surely* make his photos on other people's phones look more like on his
   screen, he thinks (Hint: it will not, but it will make the problems
   outlined in #6 with the non-colour managed apps far worse.)

What I propose instead, is the following:

1. Buy a monitor in the $200-500 range that is factory-calibrated to sRGB.
2. Turn off colour management *completely* in all colour-managed apps, and make
   sure your video card is set to Full (0-255) RGB output.
3. Live a happy, uncomplicated life.
{class="compact"}

There, I just saved you a lot of money, time, and headache. Read on if you're
interested in the details.

*Disclaimer: This post is aimed at


## What is a colour managed workflow

The important thing to understand about colour management is that you need a
*closed system* that is entirely under your control for it to work well. A
printing press workflow is the best classic example; in such a system every
single stage of the whole capturing, processing and reproduction chain is
carefully calibrated to the same standard to make it easier to achieve
predictable results with the minimum amount of effort.

Another good example is movie production; movie theaters are highly controlled
environments, therefore video editors work in rooms that approximate movie
theater conditions to ensure that what they see on their monitors closely
matches what the audience will see on the big screen.

The important thing to realise is that in these controlled workflows, where
you really care about accuracy, all sorts of seemingly unimportant details
matter: the colour of your walls (ideally grey), the number of windows in your
room (ideally zero), the colour of your clothes (ideally black), the exact
type, colour temperature and intensity of the lights in your room, and
so on. All these details (and more) and are governed by standards (for
example, the [ISO 3664:2009 .  ISO 3664:2009 Graphic technology and
photography — Viewing conditions
manual](https://www.iso.org/standard/43234.html) is 34 pages long).

The main takeaway here is that there is *a lot more* to a properly colour
managed workflow than just calibrating your monitor to some standard, then
thinking that everything will just work out fine... You can spend hours
fine-tuning your photos on your perfectly calibrated [high-end $5,000
display](https://www.amazon.com/Eizo-ColorEdge-Hardware-Calibration-Monitor/dp/B07GRHVY71)
just to realise later that the end-results people see on their laptop, tablet
and phone screens---in a variety of lighting conditions!---is all over the place
anyway...

The thing is, unless you're doing *high-end professional work* in industries
where such workflows are a necessity (in which case you probably wouldn't be
reading this article because you would already know more than me on the
subject), you really don't need to bother with all this. Sure, you can buy
expensive monitor calibration gadgets and whatnot, and if you go to popular
photography websites, they will make you believe that calibration gadgets are
a "must" if you want to be a "serious" photographer (my guess is that a good
proportion of such content is actually camouflaged ad campaigns aimed at
hobbyists/semi-pros who don't know any better...)

But, as we'll shortly see, the good news is that for 99% of photographers and
artists expensive colour management workflows are unnecessary as they don't
really give you better results than what you could achieve with basic
calibration and some forethought (and yes, even at professional levels.) In
fact, they are more than unnecessary---they're a waste of money, they'll make
your user experience generally a lot worse, and you'll spend a lot of time and
mental energy on stuff that simply doesn't matter much.


## What is sRGB

sRGB stands for the **common standard RGB colour space**; it's a
[standard](https://www.w3.org/Graphics/Color/sRGB) introduced by Microsoft and
Hewlett-Packard in 1996. The situation before its introduction resembled the
Wild West; consumer grade screens were not calibrated to a common standard, so
the only viable way to get accurate colour reproduction across different
devices was to employ a fully colour-managed workflow, as explained in the
preceding section. Naturally, this was out of reach for most everyday users.
The introduction of sRGB had changed all that: the basic idea was that if all
consumer level digital cameras, screens and printers were factory calibrated to
sRGB, then the expensive and complicated colour managed workflows would become
unnecessary for the vast majority of users. 

Citation from the relevant section of the [original sRGB
standard](https://www.w3.org/Graphics/Color/sRGB]):

> Currently, the ICC has one means of tracking and ensuring that a color is
  correctly mapped from the input to the output color space. This is done by
  attaching a profile for the input color space to the image in question.
  **This is appropriate for high end users. However, there are a broad range
  of users that do not require this level of flexibility and control.
  Additionally, most existing file formats do not, and may never support
  color profile embedding,** and finally, there are a broad range of uses
  actually discourage people from appending any extra data to their files. A
  common standard RGB color space addresses these issues and is useful and
  necessary.


## sRGB is all you need

In 2021, sRGB is still the only ubiquitous colour standard that you can rely
on.  Virtually all cameras, monitors and printers support sRGB out of the box.
The colour space of the web is sRGB. Non-colour managed software
(the vast majority) assume sRGB by default.  Even colour-management aware
software that support images tagged with ICC profiles have to assume sRGB for
untagged files (the majority of images you can find in the wild).

Of course, not all sRGB devices are created equal. But most reasonably priced
($200-500) consumer displays of the IPS variety manufactured in the last 5
years are virtually perfectly calibrated for sRGB. My [Dell
U2414H](https://www.tftcentral.co.uk/reviews/dell_u2414h.htm) I bought 5 years
ago came with a calibration sheet from Dell with the following note:

> Every Dell U2414H is shipped incorporating pre-tuned sRGB with average
  Delta-E &lt;4. This helps prevent significant color inconsistency or inaccuracy
  when content is displayed onscreen. In addition, a tighter grey-scale tracking
  on each U2414H helps enable color gradation.

**Delta-E** is basically the difference between the displayed and the ideal
perfect colours. According to the
[ViewSonic](https://color.viewsonic.com/explore/content/DeltaE%E2%89%A62Color-Accuracy_2.html)
website (who know a few things about quality displays), a Delta-E error of
around 2 or less is so small that it's virtually undetectable to the human
eye. So a Delta-E of &lt;4 out of the box, without having to do anything at
all, is pretty good. This is how the [TFT Central
guys](https://www.tftcentral.co.uk/reviews/dell_u2414h.htm) assessed my
display after extensive measurements:

> The factory calibrated sRGB mode was even closer to the desired settings **(1%
  gamma and 1% white point deviance, dE average of 1.5)**

Don't know about you, but spending more money in an attempt to correct that 1%
error seems like a very bad idea to me.

[^deltae]:

Now, with all these various colour calibration gadgets that can easily cost as
much as your monitor, you can get Delta-E down to some crazy low value like
0.5 or lower, well below the human perception limit. But does it make much of
a practical difference? Well, it doesn't, really. Also bear in mind that
colorimeters you can buy in the $150-500 range are not terribly accurate, are
themselves prone to miscalibration after a few years time', and are sensitive
to environmental variations such as changes in humidity.

There are lots of reputable online sources that publish out-of-the factory
gamma, white balance, and colour accuracy measurements of a wide variety of
LCD screens. This one, for example, is a more recent one from [TFT
Central](https://www.tftcentral.co.uk/reviews/asus_rog_swift_pg32uqx.htm#calibration):
check out the **Comparison of Different Displays** table in the **Setup
Comparisons** section. The **Deviance from 2.2 (gamma)**, **Deviance from
6500K** and **Default dE Average** values are the important ones. If they are
all below about 3-4, the display is virtually perfectly calibrated out of the
box for all intents and purposes---which is actually most of the IPS panels in
this list.


## What about wide gamut screens?

Now, all these new *wide RGB gamut monitors* (AdobeRGB, Apple's P3, etc.) are
just not worth it, in my view. First of all, you would need to adopt a fully
colour managed workflow with all its problems and complications. What "wide
gamut" really means is that you still have your
2<sup>8</sup>&times;2<sup>8</sup>&times;2<sup>8</sup> = ~16 millions of
colours (assuming 8 bits per channel), but as they now represent more vivid
colours that lie outside the sRGB range, they are spaced "wider"
apart. So, in practice, if you have your display calibrated to AdobeRGB (or if
you're just simply switching it to AdobeRGB mode in hardware), all your
non-colour managed apps will display super saturated colours. Eeek.

The other thing to consider is that in the end you'd likely still end up
having your photos printed in a lab that only accepts sRGB (and quite possibly
didn't even bother to calibrate their equipment; after all, the
factory-default sRGB setting works well-enough, colour management is hard and
requires knowledge, training the staff costs money, and so on...) But if
you're not interested in making prints, then what do you need AdobeRGB, or any
"wider than sRGB" extended gamut monitor for, exactly? 99.99% of the world
uses sRGB-compliant displays, so if you want to share your images digitally
with other people, in most cases you'll need to convert to sRGB anyway.

## Disclaimer

Now, I'm not a complete retard, I'm not saying that *nobody* should buy
high-end displays and color calibrators *ever*. I'm just saying that for
regular users, hobbyists and semi-professionals (that's already 99.99%+ of all
people) it's a waste of time and money, and it's simply not worth all the
complications that it brings. If you're an average digital artist,
photographer, or guy making YouTube videos, just go and buy a $200-500 Dell,
ViewSonic, LG, BenQ or whatever else that's factory calibrated to sRGB and has
decent online review. Just adjust the black and white point to your viewing
conditions with some grayscale patterns, and job done. Disable colour
management in all software, and don't even think about calibration ever again.

On the other hand, if you're a professional who really needs the most accurate
colour representation, a suitable monitor would set you back in the $1500-5000
range (or more). But that's a different matter altogether, then the screen
would basically pay for itself, and most of the aforementioned compatibility
issues with non-colour managed apps and games don't apply (assuming you have a
dedicated work computer).

It's just this murky middle ground between the consumer devices (that are
capable of "professional" level results, nonetheless) and the high-end stuff
where things get confusing and 

- - -

<section class="links">

## Further reading

* [Photography Life -- The Basics of Monitor Calibration](https://photographylife.com/the-basics-of-monitor-calibration)
* [Photography Life -- How to Calibrate Dell Wide Gamut Monitors](https://photographylife.com/how-to-calibrate-dell-wide-gamut-monitors)
* [A Standard Default Color Space for the Internet - sRGB](https://www.w3.org/Graphics/Color/sRGB])
* [Ken Rockwell -- sRGB vs. Adobe RGB](https://www.kenrockwell.com/tech/adobe-rgb.htm)
* [Ken Rockwell -- Color Management is for Wimps](https://www.kenrockwell.com/tech/color-management/is-for-wimps.htm)
* [Who should calibrate their monitors? -- Discussion thread](https://fstoppers.com/post-production/who-should-calibrate-their-monitors-491726#comment-614667)
* [Fine art photo prints: “sRGB offers the highest quality” – No, not really…](https://www.insights4print.ceo/2020/08/fine-art-photo-prints-srgb-offers-the-highest-quality-no-not-really/)
* [Image Science -- X-Rite i1Display Pro vs. DataColor Spyder Range - Battle of the Calibrators!](https://imagescience.com.au/blog/i1display-pro-vs-spyder)

</section>

---
layout: post
title:  "The Nim Ray Tracer Project &ndash; Part 4: Lighting"
tags: [graphics, ray tracing, Nim]
date: 2016-10-23
published: false
---

## Lighting


### Examples

{% include image.html nameSmall="scene-warm.png" name="scene-warm.png" caption="Figure 1 &mdash; There's a slightly warm coloured key light right and an even warmer fill light from the left." captionAlign="center" %}

{% include image.html nameSmall="scene-blue.png" name="scene-blue.png" caption="Figure 1 &mdash; The main light is a strong backlight that matches the colour of the &quot;sky&quot;. There's a very faint front light too, otherwise the faces of the spheres would appear black." captionAlign="center" %}

{% include image.html nameSmall="scene-purple.png" name="scene-purple.png" caption="Figure 1 &mdash; Two strong differently colours backlights from opposite directions." captionAlign="center" %}

- - -

{::options parse_block_html="true" /}
<section class="links">

## Suggested reading

{: .compact}

* [Andrew Kensler &ndash; Correlated Multi-Jittered Sampling](http://graphics.pixar.com/library/MultiJitteredSampling/paper.pdf)

</section>

---
layout: post
title:  "The Nim Ray Tracer Project &ndash; Part 4: Calculating Box Normals"
tags: [graphics, ray tracing, Nim]
date: 2016-10-23
published: false
---

## Calculating box normals


{% include image.html name="box-normals.svg" alt="Figure 1 &mdash; The right-handed coordinate system used in our renderer." caption="Figure 1 &mdash; The right-handed coordinate system used in our renderer. The circular arrow indicates the direction of positive rotation." captionAlign="center" captionWidth="70%" %}

Our AABB is defined by its two diagonally opposite points \$V_{\min}\$ and \$V_{\max}\$, from which we can easily calculate its center point \$C\$:

\$\$ C=⟨{V_{\min_\x} + V_{\max_\x}} / 2, {V_{\min_\y} + V_{\max_\y}} / 2, {V_{\min_\z} + V_{\max_\z}} / 2⟩\$\$

Next we'll calculate the vector \$p↖{→}\$ that points from the center point to
the hit point \$P_{\hit}\$:

\$\$ p↖{→} = P_{\hit} - C \$\$

This vector corresponds to the blue vectors on the image above. We need to do
is to map these vectors to the unit cube by calculating divisor values for
each dimension:

\$\$ \dx = {\abs(\v_{\min_\x}-\v_{\max_\x})} / 2 \$\$
\$\$ \dy = {\abs(\v_{\min_\y}-\v_{\max_\y})} / 2 \$\$
\$\$ \dz = {\abs(\v_{\min_\z}-\v_{\max_\z})} / 2 \$\$

From \$p↖{→}\$ and the divisors we can calculate the normal \$n↖{→}\$
at the hit point:

\$\$ n↖{→} = ⟨\int(p_\x / \dx), \int(p_\y / \dy), \int(p_\z / \dz)⟩ \$\$

This is how the final code looks like in Nim:

{% highlight nimrod %}
type
  AABB* = ref object
    vmin, vmax: Vec4[float]

  Box* = ref object of Geometry
    aabb*: AABB
{% endhighlight %}

{% highlight nimrod %}
method normal*(b: Box, hit: Vec4[float]): Vec4[float] =
  let
    c = (b.aabb.vmin + b.aabb.vmax) * 0.5
    p = hit - c
    d = (b.aabb.vmin - b.aabb.vmax) * 0.5
    bias = 1.000001

  result = vec(((p.x / abs(d.x) * bias).int).float,
               ((p.y / abs(d.y) * bias).int).float,
               ((p.z / abs(d.z) * bias).int).float).normalize
{% endhighlight %}

Hang on a minute, what's that multiplier `bias` doing there? That, my friend,
is the amount of difference between theory of practice. This is what we would
get if we left it off:

{% include image.html nameSmall="boxes-bad.png" name="boxes-bad.png" caption="Figure 1 &mdash; The main light is a strong backlight that matches the colour of the &quot;sky&quot;. There's a very faint front light too, otherwise the faces of the spheres would appear black." captionAlign="center" %}

Ooops, not exactly the result we were hoping for! What's wrong here? The
problem is that because of the inaccuracies inherent to floating point
calculations, our final float coordinates that should result in 1 when casted
to integers will sometimes be a bit less than 1.0, for example 0.999999994. In
order to fix this, we'll need to nudge the points a tiny bit outward 
by scaling them up by a multiplicative epsilon value. With this nudging in
place we'll get the correct results:

{% include image.html nameSmall="boxes3.png" name="boxes3.png" caption="Figure 1 &mdash; The main light is a strong backlight that matches the colour of the &quot;sky&quot;. There's a very faint front light too, otherwise the faces of the spheres would appear black." captionAlign="center" %}


{% include image.html nameSmall="boxes.png" name="boxes.png" caption="Figure 1 &mdash; The main light is a strong backlight that matches the colour of the &quot;sky&quot;. There's a very faint front light too, otherwise the faces of the spheres would appear black." captionAlign="center" %}


---
layout: post
title:  "The Nim Ray Tracer Project &ndash; Part 2: The Basics"
tags: 2016-04-17
---

## Maths

TODO

### Coordinate system

We are going to use a [right-handed Cartesian coordinate system
](https://en.wikipedia.org/wiki/Cartesian_coordinate_system#In_three_dimensions)
to represents objects in our 3D world, where the *y-axis* points up, the *x-axis* to the right and the *z-axis* forward. In right-handed coordinate systems, positive rotation is [counter-clockwise](https://www.evl.uic.edu/ralph/508S98/coordinates.html) about the axis of rotation.

{% include image.html name="coordinate-system.svg" caption="Figure 1 &mdash; The left-handed coordinate system used in our renderer. The circular arrow indicates the direction of positive rotation." width="70%" captionAlign="center" %}

The choice of coordinate system handedness is nothing more than a convention: DirectX,
Unity, Maya and Pixar's RenderMan use left-handed coordinate systems, while OpenGL,
[pbrt](http://www.pbrt.org/) and most other 3D modelling software are
right-handed. For our purposes, compatibility with OpenGL and pbrt are the most
important. Also, right-handed coordinate systems are the norm in mathematics,
which will also make our life a bit easier.

### Notation

\$\$\cl\"ma-legend-align\"{\table
s, \text\"scalar\";
\P, \text\"point\";
(\P_x, \P_y, \P_z), \text\"point (by coordinates)\";
\AB, \text\"segment\";
v↖{→}, \text\"vector\";
⟨\P_x, \P_y, \P_z⟩, \text\"vector (by coordinates)\";
v↖{∧}, \text\"unit vector\";
{‖v‖}, \text\"magnitude of vector (length)\";
a·b, \text\"dot product\";
a×b, \text\"cross product\";
\bo M, \text\"matrix\";
}\$\$

Column notation is used for vectors:

\$\$ v↖{→}=[\table x; y; z; 1; ] \$\$

### Transform matrices

Translation and scaling:

\$\$\bo T=[\table
1, 0, 0, t_x;
0, 1, 0, t_y;
0, 0, 1, t_z;
0, 0, 0, 1;
]
\;\;\;\;\;\;\bo S=[\table
s_x,   0,   0, 0;
  0, s_y,   0, 0;
  0,   0, s_z, 0;
  0,   0,   0, 1;
]\$\$

Rotation around a given axis:

\$\$\bo R_x=[\table
1,      0,       0, 0;
0, \cos θ, -\sin θ, 0;
0, \sin θ,  \cos θ, 0;
0,      0,       0, 1;
]
\;\;\;\;\;\;\bo R_y=[\table
 \cos θ, 0, \sin θ, 0;
      0, 1,      0, 0;
-\sin θ, 0, \cos θ, 0;
      0, 0,      0, 1;
]\$\$

\$\$\bo R_z=[\table
\cos θ, -\sin θ, 0, 0;
\sin θ,  \cos θ, 0, 0;
     0,       0, 1, 0;
     0,       0, 0, 1;
]\$\$

### Calculating primary rays

Let $(\P_x, \P_y)$ be the **pixel coordinates** of a pixel of the final image, $w$ and $h$ the width and the height of the image in pixels and \$r = w / h\$ the image aspect ratio.

{% include image.html name="mappings.svg" caption="Figure 2 &mdash; The relationships between the raster, NDC and screen spaces." captionAlign="center" width="100%" %}

We have to shoot the rays through the middle of the pixels, thus the $(\R_x, \R_y)$ **raster coordinates** of a given pixel are as follows:

\$\$\cl\"ma-join-align\"{\table
\R_x ,= \P_x + 0.5;
\R_y ,= \P_y + 0.5;
}\$\$

From this follows the formula for calculating the $(N_x, N_y)$ **normalised device coordinates (NDC)**:

\$\$\cl\"ma-join-align\"{\table
\N_x ,= \R_x / w r;
\N_y ,= \R_y / h;
}\$\$

And finally the $(S_x, S_y)$ **screen coordinates**:

\$\$\cl\"ma-join-align\"{\table
\S_x ,= 2 \N_x - r;
\S_y ,= -(2 \N_y - 1)
}\$\$

Let $&alpha;$ be the **vertical field of view (FOV)** of the camera. From figure
TODO it can be seen that by default the field of view is 90&deg; (because $\tan
90&deg; / 2 = \tan 45&deg; = 1 = \BC $), and the length of BC is actually the
$f$ **field of view factor** of the camera.

\$\$\tan &alpha; / 2 = \BC / \AB = \BC / 1\$\$
\$\$\BC = \tan &alpha; / 2 = f$\$

To obtain the desired field of view, the image surface  has to be scaled by
the field of view factor (this is akin to zooming with a traditional camera
lens). Thus we yield the **camera coordinates**:

\$\$\cl\"ma-join-align\"{\table
\C_x ,= (2 \N_x - r) f;
\C_y ,= -(2 \N_y - 1) f;
}\$$

After substitutions, the final transform from pixel coordinates to camera
coordinates looks like this:

\$\$\cl\"ma-join-align\"{\table
\C_x ,= ({2 (\P_x + 0.5) r} / w - r) f;
\C_y ,= (1 - {2 (\P_y + 0.5)} / h) f;
}\$$

So for each pixel $(\P_x, \P_y)$ in the image we can now calculate the
corresponding camera coordinates $(\C_x, \C_y)$ we'll need to shoot the
primary ray through. Since the camera (the eye) is at the origin, the
direction vector $d↖{∧}$ of the ray corresponding to pixel $(\P_x, \P_y)$ is
simply the vector $⟨\C_x, \C_y⟩$ normalised:

\$\$ d↖{∧} = ⟨\C_x, \C_y⟩ / {‖⟨\C_x, \C_y⟩‖}\$\$

As the last step, we'll have to multiply the resulting direction vector with the
camera transform matrix:

\$\$ d↖{∧}' = \bo C d↖{∧}\$\$


### Ray-sphere intersection

The implicit equation of a **sphere** with centre point $\C\$ and radius $r$:

\$\$(x-\C_x)^2 + (y-\C_y)^2 + (z-\C_z)^2 = r^2\$\$

The parametric equation of a **half-open line segment** (the ray, in our case), where $\O$ is the starting point, $d↖{∧}$ the direction vector and $\P$ a point on the segment for any $t≧0$:

\$\$\P = \O + d↖{∧}t\$\$

Written component-wise:

\$\$\P_x = \O_x + d_xt \$\$
\$\$\P_y = \O_y + d_yt \$\$
\$\$\P_z = \O_z + d_zt \$\$

To get the ray-sphere intersection points, we'll need to substitute $\P_x$, $\P_y$ and $\P_z$ into the equation of the sphere:

\$\$(\O_x + d_xt - \C_x)^2 + (\O_y + d_yt-\C_y)^2 + (\O_z + d_zt-\C_z)^2 = r^2\$\$

The first parenthesised expression can be expanded like this:

\$\$\cl\"ma-join-align\"{\table
(\O_x + d_xt - \C_x)^2 ,= \O_x^2 + \O_x d_xt - \O_x\C_x + d_xt\O_x + d_x^2t^2 - d_xt\C_x - \C_x\O_x - \C_x\d_xt + \C_x^2;
 ,= \O_x^2 + 2\O_x d_xt - 2\O_x\C_x + d_x^2t^2 - 2\C_xd_xt + \C_x^2;
 ,= d_x^2t^2 + (2\O_x d_x - 2\C_xd_x)t + (\O_x^2 - 2\O_x\C_x + \C_x^2);
 ,= d_x^2t^2 + (2d_x(\O_x- C_x))t + (\O_x - \C_x)^2;
}\$\$

The remaining two expressions can be expanded in a similar way, so the final equation
will have the form of a quadratic equation \$ at^2 + bt + c = 0\$, where:

\$\$\cl\"ma-join-align\"{\table
a ,= d_x^2 + d_y^2 + d_z^2;
b ,= 2 (d_x(\O_x - C_x) + d_y(\O_y - C_y) + d_z(\O_z - C_z));
c ,= (\O_x - \C_x)^2 + (\O_y - \C_y)^2 + (\O_z - \C_z)^2;
}\$\$

First the discriminant \$\Δ\$ needs to be calculated. If \$\Δ &lt; 0\$, the ray does not intersect the sphere; if \$\Δ = 0\$, the ray touches the sphere (two intersection point); and if \$\Δ &gt; 0\$, it intersects the sphere in two points. The equation can be solved for $t$ by applying the following formula that takes care
of the [loss of
significance](https://en.wikipedia.org/wiki/Loss_of_significance#A_better_algorithm)
floating-point problem:

\$\$\Δ = b^2-4ac\$\$

\$\$t_1 = {-b-\sgn(b)√\Δ} / {4a}\;\;\;,\;\;\;t_2 = c/{a t_1}\$\$


### Ray-plane intersection

TODO


## In the next episode...

...we'll actually get to inspect the Nim code that rendered this singular
masterpiece of 80's CGI art below. Well, you gotta start somewhere, right?

{% include image.html name="render.jpg" caption="This might look like total crap, but it's 16x MSAA antialiased, yo, and it's the output of my first ray tracer!" captionAlign="center" width="80%" %}

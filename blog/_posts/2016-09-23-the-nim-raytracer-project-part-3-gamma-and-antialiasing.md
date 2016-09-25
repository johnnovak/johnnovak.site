---
layout: post
title:  "The Nim Ray Tracer Project &ndash; Part 3: Gamma & Antialiasing"
tags: [graphics, ray tracing, Nim]
date: 2016-09-23
published: false
---

## Some implementation details


http://stackoverflow.com/questions/7574125/multiplying-a-matrix-and-a-vector-in-glm-opengl

GLM mimics GLSL, matrices column-major
column-major matrix should be left-multiplied with a vector

http://stackoverflow.com/questions/24593939/matrix-multiplication-with-vector-in-glsl
 

{% highlight nimrod %}
template point*[T](x, y, z: T): Vec4[T] = vec4(x, y, z, 0.0)
template vec*[T](x, y, z: T): Vec4[T] = vec4(x, y, z, 1.0)
{% endhighlight %}


## Gamma

{% include image.html name="no-gamma.png" caption="Figure 1 &mdash; X" captionAlign="center" width="600px" %}

{% include image.html name="gamma.png" caption="Figure 1 &mdash; X" captionAlign="center" width="600px" %}

## Sampling

{% include image.html name="grid2x2-aa.png" caption="Figure 1 &mdash; X" captionAlign="center" width="600px" %}

{% include image.html name="no-aa.png" caption="Figure 1 &mdash; X" captionAlign="center" width="634px" %}

### Grid sampling

{% include image.html name="grid-aa.png" caption="Figure 1 &mdash; X" captionAlign="center" width="634px" %}

### Jittered sampling

{% include image.html name="jitter-aa.png" caption="Figure 1 &mdash; X" captionAlign="center" width="634px" %}

### Multi-jittered sampling

{% include image.html name="multi-aa.png" caption="Figure 1 &mdash; X" captionAlign="center" width="634px" %}

### Conclusion

overhead of sampling method is negligible, very small percentage of the total
workload


- simple grid AA never really gets rid of all artifacts, not even at 32x32
- jittered seems to completely get rid of aliasing artifacts (it converts
  aliasing to noise), but results in a slightly softer image overall (not
  really noticeable though)
- also jittered is not really usable below 8x8 (straight lines will appear
  jagged), 16x16 seems to be optimal with little noise, 32x32 ideal with
  almost no noise (but very slow)
- multi-jittered reduces aliasing, but never completely eliminates it (not
  even at 32x32)
- At lower settings of 4x4 and 8x8, multi-jittered clearly wins over the
  others. From 16x16 onwards, jittered vs multi-jittered is a tradeoff between
  no aliasing but 


{: .compact}
* 2x2: Grid
* 4x4: Multi-jittered
* 8x8: Multi-jittered
* 16x16: Jittered or multi-jittered
* 32x32: Jittered

{% include image.html name="aa-comparison.png" caption="Figure 1 &mdash; X" captionAlign="center" width="660px" %}

## Multithreading


{% include image.html name="8cores.png" caption="Figure 1 &mdash; Developer showing signs of uncontrollable euphoria over working multithreaded ray-tracer implementation." captionAlign="center" width="548px" %}


Intel Core i7-4790K @ 4.00 GHz  on Windows 7 Ultimate 64-bit


{% highlight c %}
Nim Compiler Version 0.14.3 (2016-09-17) [Windows: amd64]
gcc (x86_64-win32-seh-rev1, Built by MinGW-W64 project) 4.9.1
{% endhighlight %}

Image width:    1200
Image height:   800

run several times, best time taken

AA      Rendering time (s)
        8-threads

<table>
<tr>
  <th>Type of antialias</th>
  <th>Render time (s)</th>
</tr>
<tr>
  <td>None</td>
  <td>0.2</td>
</tr>
<tr>
  <td>Grid 2x2</td>
  <td>0.9</td>
</tr>
<tr>
  <td>Grid 4x4</td>
  <td>3.9</td>
</tr>
<tr>
  <td>Grid 8x8</td>
  <td>15.3</td>
</tr>
<tr>
  <td>Grid 16x16</td>
  <td>63.0</td>
</tr>
<tr>
  <td>Grid 32x32</td>
  <td>259.0</td>
</tr>
</table>

- - -

{::options parse_block_html="true" /}
<section class="links">

## Suggested reading

{: .compact}

* [Andrew Kensler &ndash; Correlated Multi-Jittered Sampling](http://graphics.pixar.com/library/MultiJitteredSampling/paper.pdf)

</section>

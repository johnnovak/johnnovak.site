---
layout: post
title:  "Workerpool"
tags: [workerpool, Nim]
published: false
---

## Stuff

I have always thought of ray tracing as some kind of black magic---something
utterly fascinating and very scary at the same time because of the complex
maths involved (which, as it turns out, is not quite true). This belief was
also strengthened by my modest excursions into OpenGL programming years later,
which uses a different method called
[rasterization](https://en.wikipedia.org/wiki/Rasterisation) to generate 3D
images.  Historically, there have been two main disparate approaches to
rendering 3D scenes, rasterization and ray tracing (the situation is not so
clear-cut nowadays, as we'll see later). While rasterization is by several
orders of magnitude more efficient at producing 3D animations at smooth frame
rates in real-time, ray tracing can produce vastly more photorealistic
results.  While many visual effects that happen in real life, such as
non-planar reflections, soft shadows, refractions and caustics, are quite
simple, albeit computationally very costly, to calculate with ray tracing, it
requires quite a bit of complicated trickery even just to fake them with
rasterization. At the risk of grossly oversimplifying matters, rasterization
is very efficient at projecting several hundreds of thousands of
three-dimensional triangles onto a two-dimensional surface (the screen) and
then colouring (shading) them according to some rules. In order to obtain
reasonable frame rates during real-time animation, certain simplifications and
optimisations have to be made. Photorealistic rendering that accurately
portrays how a given scene would look in real life is not necessarily of
primary importance as long as the end result looks pleasing (which is
a reasonable assumption for many applications such as visualisation and games,
where absolute fidelity to reality is not a requirement). It's the 3D artists'
job to arrange those coloured triangles so that the resulting image looks
good. Most graphics-accelerator cards today implement some sort of
rasterization pipeline in hardware.

{% highlight nimrod %}
proc isReady*[W, R](wp: var WorkerPool[W, R]): bool =
  if wp.ackCounter > 0:
    trace "Waiting for " & $wp.ackCounter & " ack signals"

    for i in 0..<wp.poolSize():
      let (available, _) = wp.ackChannels[i][].tryRecv()
      if available:
        trace "  Ack received from worker " & $i
        dec wp.ackCounter

  result = wp.ackCounter == 0
{% endhighlight %}

[Ray tracing](https://en.wikipedia.org/wiki/Ray_tracing_(graphics)), on the
other hand, is a pretty much a no-holds-barred approach of generating
realistic images on a computer by simulating the path of photons emitted by
light sources bouncing from surface to surface among the objects making
up the 3D scene, finally landing on the image surface of the virtual camera.
Photorealism is of primary importance here, which is achieved by calculating
the image pixel by pixel using algorithms that mimic the laws of physics as
closely as practically possible (certain simplifications must be made, of
course, otherwise we would end up writing a Universe Simulator!).

This begs the question, is ray tracing superior to rasterization then? In some
way, we can say it is.  As far as photorealistic rendering is concerned, ray
tracing is hard to beat, however this comes at a very steep computational
cost. But if we asked whether it was possible to create pleasing imagery using
rasterization alone, the answer would be a yes again. Just because
rasterization is not as much rooted in physical reality as ray tracing, it
would be foolish to think that it's not capable of producing stellar results
that can look very convincingly real (just look at any modern game released
post 2010!). Indeed, there's nothing preventing skilful artists from arranging
the triangles making up the scene in such a way that can convey very realistic
final results---similarly to how a master painter can create astonishingly
realistic works of art by nothing more than applying differently coloured
specks of paint onto a canvas with a mere paintbrush.

## In the next episode...

We will examine the mathematical foundations of writing a simple ray tracer.
Time to brush up those high-school trigonometry skills! Stay tuned!


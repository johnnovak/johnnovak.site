import math
import glm

import util/framebuf
import util/color


proc horizGradient(fb: var Framebuf, ox, oy, w, h: Natural,
                   c1, c2: Vec3[float32], sRGB: bool = false) =
  let
    sr = (c2.r - c1.r) / w.float32
    sg = (c2.g - c1.g) / w.float32
    sb = (c2.b - c1.b) / w.float32

  let dc = vec3[float32](sr, sg, sb)

  var
    c = c1
    cc: Vec3[float32]
  for x in ox..<ox+w:
    if sRGB:
      cc = sRGBToLinear(c)
    else:
      cc = c
    fb.rect(x, oy, 1, h, cc)
    c = c + dc


let
  BAR_HEIGHT = 30
  Y_PAD = 15
  WIDTH = 500
  HEIGHT = 5 * (BAR_HEIGHT*2 + Y_PAD)

var fb = newFramebuf(WIDTH, HEIGHT)
fb.rect(0, 0, WIDTH, HEIGHT, vec3[float32](1.0, 1.0, 1.0))

var y = 0

var c1 = vec3[float32](1.0, 0.0, 0.0)
var c2 = vec3[float32](0.0, 1.0, 0.0)
fb.horizGradient(0, y, WIDTH, BAR_HEIGHT, c1, c2)
y += BAR_HEIGHT
fb.horizGradient(0, y, WIDTH, BAR_HEIGHT, c1, c2, sRGB = true)

y += BAR_HEIGHT + Y_PAD

c1 = vec3[float32](0.0, 1.0, 0.0)
c2 = vec3[float32](0.0, 0.0, 1.0)
fb.horizGradient(0, y, WIDTH, BAR_HEIGHT, c1, c2)
y += BAR_HEIGHT
fb.horizGradient(0, y, WIDTH, BAR_HEIGHT, c1, c2, sRGB = true)

y += BAR_HEIGHT + Y_PAD

c1 = vec3[float32](0.0, 0.0, 1.0)
c2 = vec3[float32](1.0, 0.0, 0.0)
fb.horizGradient(0, y, WIDTH, BAR_HEIGHT, c1, c2)
y += BAR_HEIGHT
fb.horizGradient(0, y, WIDTH, BAR_HEIGHT, c1, c2, sRGB = true)

y += BAR_HEIGHT + Y_PAD

c1 = vec3[float32](1.0, 0.0, 1.0)
c2 = vec3[float32](1.0, 1.0, 0.0)
fb.horizGradient(0, y, WIDTH, BAR_HEIGHT, c1, c2)
y += BAR_HEIGHT
fb.horizGradient(0, y, WIDTH, BAR_HEIGHT, c1, c2, sRGB = true)

y += BAR_HEIGHT + Y_PAD

c1 = vec3[float32](1.0, 1.0, 0.0)
c2 = vec3[float32](0.0, 1.0, 1.0)
fb.horizGradient(0, y, WIDTH, BAR_HEIGHT, c1, c2)
y += BAR_HEIGHT
fb.horizGradient(0, y, WIDTH, BAR_HEIGHT, c1, c2, sRGB = true)

discard fb.writePpm("out/gradient.ppm")



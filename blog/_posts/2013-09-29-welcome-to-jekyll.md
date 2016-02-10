---
layout: post
title:  "Realtime raytracing 1"
date:   2013-09-29 21:38:05
tags:   java compression
---

This lesson will be **long and tedious** for most readers. If you are new to the
field of computer graphics, take the time to read it carefully though. Fully
understanding this part of the CG pipeline is of crucial importance and will
save you a lot of time later.

Introduction to Geometry
-----------------------

**Points**, **vectors**, **matrices** and **normals** are to computer graphics what the
alphabet is to literature; hence most CG books start with a chapter on linear
algebra and geometry. However, for many looking to learn graphics programming,
presenting $\cos^2θ+\sin^2θ=1$ a lot of maths **before** learning about making images can be quite
upsetting. If you don't think CG programming[^jekyll]  is for you because you do not
feel comfortable with maths or don't understand what a matrix is, don't give
up now.

{% highlight clojure %}

; syntax highlighter test
(ns examples.cryptovault-complete
  (:require [clojure.java.io :as io]
            [examples.protocols.io :as proto])
  (:import (java.security KeyStore KeyStore$SecretKeyEntry
                          KeyStore$PasswordProtection)
           (javax.crypto Cipher KeyGenerator CipherOutputStream
                         CipherInputStream)
           (java.io FileInputStream FileOutputStream)))
(defprotocol Vault
  (init-vault [vault])
  (vault-output-stream [vault])
  (vault-input-stream [vault]))
           (java.io FileInputStream FileOutputStream)))     ; max length 80 --->

{% endhighlight %}

We began the [Foundation of 3D Rendering](#) section with a couple
of lessons that do not require any prior knowledge of linear algebra for
a reason. While this is a fairly unconventional way of teaching CG programming
techniques, we
believe it's more exciting for you to get started with something practical and
fun: for example, an introductory ray tracer that requires very minor
knowledge of maths and some knowledge of programming[^archive]. Writing a renderer is
a much more exciting and rewarding way of learning maths, as you can see
incrementally how certain things are used to produce a concrete result (i.e.
your final image). That being said, points, vectors and matrices are
instrumental in the process of making [CG images](#); we will use
them extensively in pretty much every lesson.

Lessons learned
---------------

In this lesson, you will learn what these constructs are, how they work and
the various techniques that can be used to manipulate them. This lesson will
also explain the different conventions in linear algebra that CG researchers
have used over the years when solving their problems and writing their code.
You need to be aware of these conventions as they are very often not mentioned
in books (and poorly documented on the web). These conventions are important;
before you can read or use another developer's code or techniques, you must
first check what conventions they are using.

\$\$x={-b±√{b^2-4ac}}/{2a}\$\$

One quick note before we begin. If you are a mathematical purist, you might
find it strange to see things explained here that are not technically related
to linear algebra. We would like to keep the scope of this lesson broad and
include simple mathematical techniques commonly used in CG which may only
loosely relate to vectors and matrices. For instance, a point, mathematically
speaking, has nothing to do with linear algebra (a branch of mathematics only
concerned with vectors). We chose to cover points because they are extremely
common in CG (and that the same mathematical techniques from linear algebra
can be used to manipulate them). If you do not yet understand the distinction
between points and vectors, do not worry. We will cover that extensively in
this chapter.


[^jekyll]: Plugins would of course solve this problem---but remember my self-imposed constraint mentioned in Part 1? Pure vanilla Jekyll running on GitHub Pages. So, let's try to find another way.

[^archive]: How? With the HTML 5 multi-tool: JavaScript!


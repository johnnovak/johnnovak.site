Requirements
------------

* **GNU make**
* **jekyll** (3.1+) [blog]
* **python** (2.7+) [blog, photo]
* **sass** (3.4+) [blog, photo] — installed automatically by Jekyll
* **exiftool** (8.6+) [photo]
* **tidy** (5+) [blog]

These additional Python libraries are required for the generation of the photo
albums (`photo` make target):

* **jinja2**
* **yaml**
* **Python Imaging Library (pil)**


Usage
-----

Basic usage:

```
make home
make photo
make blog
```

Advanced usage (see `Makefile` for the full list of targets):

```
make watch_home_css
make symlink_home_js
make watch_photo_css
make symlink_photo_js
make serve_blog

```


blog notes
----------

Installing **jekyll** and **pygments.rb** for syntax higlighting support (the
**pygments** Python library has to be installed as well). Installing **jekyll** will install
**sass** as a dependency.

```
sudo gem install jekyll
sudo gem install pygments.rb
```


photo notes
----------

The photo gallery uses a custom hacked version of **Fotorama**.

TODO add instructions on updating to the latest Fotorama version

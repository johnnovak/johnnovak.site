Requirements
------------

* **GNU make**
* **jekyll** (3.1+) — *blog*
* **python** (2.7+) — *blog, photo*
* **sass** (3.4+) — *blog, photo*
* **exiftool** (8.6+) — *photo*
* **tidy** (5+) — *blog*

These additional Python libraries are required for the generation of the photo
albums (`photo` make target):

* jinja2
* yaml
* Python Imaging Library (pil)


Usage
-----

Basic usage:

```
make home
make photo
make blog
```

The output directories are hardcoded, see the `Makefile` for details
(`DEST_*_DIR`).

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

Installing **jekyll**, **pygments.rb** for syntax higlighting support (the
**pygments** Python library has to be installed as well) and **rmagick** for
the `image_dimensions.rb` plugin. Installing **jekyll** will automatically
install **sass** as a dependency.

```
sudo gem install jekyll
sudo gem install pygments.rb
sudo gem install rmagick
```


photo notes
----------

The photo gallery uses a custom hacked version of **Fotorama**.

Building the Fotorama library requires `npm` and `grunt`. Install `npm` first
with your OS specific package manager then issue the following command:

```
sudo npm install -g grunt-cli
```

Then in `$ROOT/photo/js/fotorama` issue the following:

```
npm install
grunt
```

From now on you can rebuild Fotorama by issue this command in `$ROOT`:

```
make build_fotorama
```

TODO add instructions on updating to the latest Fotorama version

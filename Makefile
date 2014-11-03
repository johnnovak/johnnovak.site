DEST_DIR=../johnnovak.github.io

DEST_HOME_DIR=$(DEST_DIR)/home
DEST_PHOTO_DIR=$(DEST_DIR)/photo
DEST_BLOG_DIR=$(DEST_DIR)/blog

SASS_OPTS=--cache-location=.sass_cache
SASS_BUILD_OPTS=$(SASS_OPTS) --force --style=compressed
SASS_WATCH_OPTS=$(SASS_OPTS)

HOME_CSS_LOCATION=home/css:$(DEST_HOME_DIR)/css
PHOTO_CSS_LOCATION=photo/css:$(DEST_PHOTO_DIR)/css
BLOG_CSS_LOCATION=blog/css:$(DEST_BLOG_DIR)/css

default: all
all: common home photo


### HOME ######################################################################

.PHONY: common clean_common

common:
	cp -r common/js $(DEST_DIR)

clean_common:
	rm -rf $(DEST_DIR)/img $(DEST_DIR)/js


### HOME ######################################################################

.PHONY: home watch_home_css clean_home

home:
	mkdir -p $(DEST_HOME_DIR)/css
	cp home/*.html $(DEST_DIR)
	cp -r home/img home/js $(DEST_HOME_DIR)
	sass $(SASS_BUILD_OPTS) --update $(HOME_CSS_LOCATION)

watch_home_css:
	sass $(SASS_WATCH_OPTS) --watch $(HOME_CSS_LOCATION)

home_css:
	sass $(SASS_WATCH_OPTS) --update $(HOME_CSS_LOCATION)

symlink_home_js:
	rm $(DEST_HOME_DIR)/js/home.js
	ln -s $(PWD)/home/js/home.js $(DEST_HOME_DIR)/js/home.js

clean_home:
	rm -rf $(DEST_HOME_DIR) $(DEST_DIR)/index.html


### PHOTO #####################################################################

.PHONY: photo fotorama watch_photo_css symlink_photo_js clean_photo

photo:
	mkdir -p $(DEST_PHOTO_DIR)
	photo/generate-albums.py -p photo photo/source $(DEST_PHOTO_DIR)
	mkdir -p $(DEST_PHOTO_DIR)/css
	mkdir -p $(DEST_PHOTO_DIR)/js/lib
	cp -r photo/img $(DEST_PHOTO_DIR)
	cp -r photo/js/lib $(DEST_PHOTO_DIR)/js/
	cp photo/js/*.js $(DEST_PHOTO_DIR)/js
	cp photo/js/fotorama/out/fotorama.js $(DEST_PHOTO_DIR)/js/lib/
	cp photo/js/fotorama/out/fotorama.css $(DEST_PHOTO_DIR)/css/
	touch $(DEST_PHOTO_DIR)/css/fotorama.png
	sass $(SASS_BUILD_OPTS) --update $(PHOTO_CSS_LOCATION)

fotorama:
	cd photo/js/fotorama; grunt build

watch_photo_css:
	sass $(SASS_WATCH_OPTS) --watch $(PHOTO_CSS_LOCATION)

photo_css:
	sass $(SASS_WATCH_OPTS) --update $(PHOTO_CSS_LOCATION)

symlink_photo_js:
	rm $(DEST_PHOTO_DIR)/js/photo.js
	ln -s $(PWD)/photo/js/photo.js $(DEST_PHOTO_DIR)/js/photo.js

clean_photo:
	rm -rf $(DEST_PHOTO_DIR)


### BLOG ######################################################################

.PHONY: blog watch_blog watch_blog_css clean_blog

blog:
	mkdir -p $(DEST_BLOG_DIR)/css
	jekyll build -s blog -d $(DEST_BLOG_DIR)
	cp -r blog/img blog/js $(DEST_BLOG_DIR)
	sass $(SASS_BUILD_OPTS) --update $(BLOG_CSS_LOCATION)

watch_blog:
	jekyll --watch -s blog -d $(DEST_BLOG_DIR)

watch_blog_css:
	sass $(SASS_WATCH_OPTS) --watch $(BLOG_CSS_LOCATION)

blog_css:
	sass $(SASS_WATCH_OPTS) --update $(BLOG_CSS_LOCATION)

clean_blog:
	rm -rf $(DEST_BLOG_DIR)


### MISC ######################################################################

.PHONY: clean clean_dest

clean:
	rm -rf .sass_cache

clean_dest: clean_common clean_home clean_photo clean_blog


DEST_DIR=../johnnovak.local

DEST_HOME_DIR=$(DEST_DIR)/home
DEST_PHOTO_DIR=$(DEST_DIR)/photo
DEST_BLOG_DIR=$(DEST_DIR)/blog

SASS_OPTS=--cache-location=.sass_cache

HOME_CSS_LOCATION=home/css:$(DEST_HOME_DIR)/css
PHOTO_CSS_LOCATION=photo/css:$(DEST_PHOTO_DIR)/css
BLOG_CSS_LOCATION=blog/css:$(DEST_BLOG_DIR)/css


default: all
all: common home photo blog


### HOME ######################################################################

.PHONY: common

common:
	cp -r common/img $(DEST_DIR)
	cp -r common/js $(DEST_DIR)


### HOME ######################################################################

.PHONY: home watch_home_css

home:
	mkdir -p $(DEST_HOME_DIR)/css
	cp home/index.html $(DEST_DIR)
	cp -r home/img home/js $(DEST_HOME_DIR)
	sass $(SASS_OPTS) --force --style=compressed --update $(HOME_CSS_LOCATION)

watch_home_css:
	sass $(SASS_OPTS) --watch $(HOME_CSS_LOCATION)


### PHOTO #####################################################################

.PHONY: photo fotorama watch_photo_css

photo:
	photo/generate-albums.py -p photo photo/source $(DEST_PHOTO_DIR)
	mkdir -p $(DEST_PHOTO_DIR)/css
	cp -r photo/img photo/js $(DEST_PHOTO_DIR)
	cp photo/js/fotorama/out/fotorama.js $(DEST_PHOTO_DIR)/js/lib
	cp photo/js/fotorama/out/fotorama.css $(DEST_PHOTO_DIR)/css
	touch $(DEST_PHOTO_DIR)/js/lib/fotorama.png
	sass $(SASS_OPTS) --force --style=compressed --update $(PHOTO_CSS_LOCATION)

fotorama:
	cd photo/js/fotorama; npm install && grunt build

watch_photo_css:
	sass $(SASS_OPTS) --watch $(PHOTO_CSS_LOCATION)


### BLOG ######################################################################

.PHONY: blog watch_blog watch_blog_css

blog:
	mkdir -p $(DEST_BLOG_DIR)/css
	jekyll build -s blog -d $(DEST_BLOG_DIR)
	cp -r blog/img blog/js $(DEST_BLOG_DIR)
	sass $(SASS_OPTS) --force --style=compressed --update $(BLOG_CSS_LOCATION)

watch_blog:
	jekyll --watch -s blog -d $(DEST_BLOG_DIR)

watch_blog_css:
	sass $(SASS_OPTS) --watch $(BLOG_CSS_LOCATION)


### MISC ######################################################################

.PHONY: clean clean_dest

clean:
	rm -rf .sass_cache

clean_dest:
	rm -rf $(DEST_DIR)/*


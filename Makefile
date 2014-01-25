DEST_DIR=out_test

DEST_HOME_DIR=$(DEST_DIR)
DEST_PHOTO_DIR=$(DEST_DIR)/photo
DEST_BLOG_DIR=$(DEST_DIR)/blog

SASS_OPTS=--cache-location=.sass_cache

HOME_CSS_LOCATION=home/css:$(DEST_HOME_DIR)/css
PHOTO_CSS_LOCATION=photo/css:$(DEST_PHOTO_DIR)/css
BLOG_CSS_LOCATION=blog/css:$(DEST_BLOG_DIR)/css


default: all
all: home photo blog


### HOME ######################################################################

.PHONY: home watch_home_css

home:
	cp home/index.html $(DEST_HOME_DIR)
	cp -r home/img $(DEST_HOME_DIR)
	cp -r home/js $(DEST_HOME_DIR)
	mkdir -p $(DEST_HOME_DIR)/css
	sass $(SASS_OPTS) --force --style=compressed --update $(HOME_CSS_LOCATION)

watch_home_css:
	sass $(SASS_OPTS) --watch $(HOME_CSS_LOCATION)


### PHOTO #####################################################################

.PHONY: photo watch_photo_css

photo:
	photo/generate-albums.py -p photo photo/input-test $(DEST_PHOTO_DIR)
	cp -r photo/img $(DEST_PHOTO_DIR)
	cp -r photo/js $(DEST_PHOTO_DIR)
	sass $(SASS_OPTS) --force --style=compressed --update $(PHOTO_CSS_LOCATION)

watch_photo_css:
	sass $(SASS_OPTS) --watch $(PHOTO_CSS_LOCATION)


### BLOG ######################################################################

.PHONY: blog watch_blog watch_blog_css

blog:
	jekyll build -s blog -d $(DEST_BLOG_DIR)
	cp -r blog/img $(DEST_BLOG_DIR)
	cp -r blog/js $(DEST_BLOG_DIR)
	mkdir -p $(DEST_BLOG_DIR)/css
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

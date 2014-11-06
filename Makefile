DEST_HOME_DIR  = ../johnnovak.github.io
DEST_PHOTO_DIR = ../photo
DEST_BLOG_DIR  = ../blog

SASS_OPTS = --cache-location=.sass_cache --sourcemap=none
SASS_BUILD_OPTS = $(SASS_OPTS) --force --style=compressed
SASS_WATCH_OPTS = $(SASS_OPTS)

HOME_CSS_LOCATION  = home/css:$(DEST_HOME_DIR)/css
PHOTO_CSS_LOCATION = photo/css:$(DEST_PHOTO_DIR)/css
BLOG_CSS_LOCATION  = blog/css:$(DEST_BLOG_DIR)/css

TIDY = /usr/local/bin/tidy5
TIDY_OPTS = -i -wrap 1000 -utf8

default: all
all: home photo blog

clean_dir = find $(1) \( ! -regex '.*/\..*' \) ! -path . ! -name CNAME \
			| xargs rm -rf

html_tidy_dir = -(find $(1) -name "*.html" \
				  | xargs $(TIDY) $(TIDY_OPTS) -m 2>/dev/null || true)


### HOME ######################################################################

.PHONY: home watch_home_css update_home_css symlink_home_js clean_home

home: clean_home
	mkdir -p $(DEST_HOME_DIR)/css
	cp home/*.html $(DEST_HOME_DIR)
	cp -r home/img home/js $(DEST_HOME_DIR)
	sass $(SASS_BUILD_OPTS) --update $(HOME_CSS_LOCATION)

watch_home_css:
	sass $(SASS_WATCH_OPTS) --watch $(HOME_CSS_LOCATION)

update_home_css:
	sass $(SASS_WATCH_OPTS) --update $(HOME_CSS_LOCATION)

symlink_home_js:
	rm $(DEST_HOME_DIR)/js/home.js
	ln -s $(PWD)/home/js/home.js $(DEST_HOME_DIR)/js/home.js

clean_home:
	$(call clean_dir,$(DEST_HOME_DIR)/*)


### PHOTO #####################################################################

.PHONY: photo fotorama watch_photo_css update_photo_css symlink_photo_js clean_photo

photo: clean_photo
	photo/generate-albums.py photo/source $(DEST_PHOTO_DIR)
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

update_photo_css:
	sass $(SASS_WATCH_OPTS) --update $(PHOTO_CSS_LOCATION)

symlink_photo_js:
	rm $(DEST_PHOTO_DIR)/js/photo.js
	ln -s $(PWD)/photo/js/photo.js $(DEST_PHOTO_DIR)/js/photo.js

clean_photo:
	$(call clean_dir,$(DEST_PHOTO_DIR)/*)


### BLOG ######################################################################

.PHONY: blog watch_blog watch_blog_css update_blog_css clean_blog

blog:
	make generate_blog
	make tidy_blog

generate_blog: TEMP_DIR = $(DEST_BLOG_DIR)/tmp
generate_blog: clean_blog
	mkdir -p $(TEMP_DIR)
	jekyll build -t -s blog -d $(TEMP_DIR)
	mv $(TEMP_DIR)/* $(DEST_BLOG_DIR)
	rm -rf $(TEMP_DIR)

tidy_blog:
	$(call html_tidy_dir,$(DEST_BLOG_DIR)/*)

serve_blog:
	jekyll serve -s blog -d $(DEST_BLOG_DIR)

clean_blog:
	$(call clean_dir,$(DEST_BLOG_DIR)/*)


### CLEAN  ######################################################################

.PHONY: clean clean_all

clean:
	rm -rf .sass_cache

clean_all: clean_home clean_photo clean_blog


DEST_HOME_DIR  = ../johnnovak.github.io
DEST_PHOTO_DIR = ../photo
DEST_BLOG_DIR  = ../blog
BLOG_SERVE_DIR  = /tmp/blog

SASS_OPTS = --no-source-map
SASS_BUILD_OPTS = $(SASS_OPTS) --style=compressed
SASS_WATCH_OPTS = $(SASS_OPTS)

HOME_CSS_LOCATION  = home/css:$(DEST_HOME_DIR)/css
PHOTO_CSS_LOCATION = photo/css:$(DEST_PHOTO_DIR)/css
BLOG_CSS_LOCATION  = blog/css:$(DEST_BLOG_DIR)/css

default: all
all: home photo blog

clean_dir = find $(1) \( ! -regex '.*/\..*' \) ! -path . ! -name CNAME \
			| xargs rm -rf

html_tidy_dir = -(find $(1) -name "*.html" \
				  | xargs tidy -i -wrap 1000 -utf8 -m 2>/dev/null || true)


### HOME ######################################################################

.PHONY: home watch_home_css update_home_css symlink_home_js clean_home

home: clean_home
	mkdir -p $(DEST_HOME_DIR)/css
	mkdir -p $(DEST_HOME_DIR)/best
	cp home/*.html $(DEST_HOME_DIR)
	cp home/best/*.html $(DEST_HOME_DIR)/best
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

.PHONY: photo generate_photo exif_cleanup build_fotorama symlink_photo_js \
		watch_photo_css update_photo_css clean_photo

photo:
	mkdir -p $(DEST_PHOTO_DIR)
	make generate_photo
	make exif_cleanup
	cp photo/*.html $(DEST_PHOTO_DIR)

generate_photo: clean_photo
	photo/generate-albums.py photo/source $(DEST_PHOTO_DIR)
	mkdir -p $(DEST_PHOTO_DIR)/css
	mkdir -p $(DEST_PHOTO_DIR)/js/lib
	cp -r photo/img $(DEST_PHOTO_DIR)
	cp photo/js/lib/*.js $(DEST_PHOTO_DIR)/js/lib
	cp photo/js/*.js $(DEST_PHOTO_DIR)/js
	cp photo/css/*.css $(DEST_PHOTO_DIR)/css
	touch $(DEST_PHOTO_DIR)/css/fotorama.png
	sass $(SASS_BUILD_OPTS) --update $(PHOTO_CSS_LOCATION)

exif_cleanup:
	exiftool -m -d %Y -all= --exif:all --icc_profile:all \
		-Software= \
		-Serialnumber= \
		-Artist="John Novak" \
		-Creator="John Novak" \
		-CreatorCity="Brisbane" \
		-CreatorCountry="Australia" \
		-CreatorWorkEmail="john@johnnovak.net" \
		-CreatorWorkURL="http://photo.johnnovak.net/" \
		-Comment="http://photo.johnnovak.net/" \
		'-Copyright<Copyright © $$CreateDate John Novak. All rights reserved.' \
		'-Rights<Copyright © $$CreateDate John Novak. All rights reserved.' \
		-Marked=True \
		-UsageTerms="All rights reserved." \
		-Format="image/jpeg" \
		-overwrite_original -R -ext jpg $(DEST_PHOTO_DIR)

build_fotorama:
	cd photo/js/fotorama; grunt
	cp photo/js/fotorama/out/fotorama.js $(DEST_PHOTO_DIR)/js/lib/
	cp photo/js/fotorama/out/fotorama.css $(DEST_PHOTO_DIR)/css

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

.PHONY: blog generate_blog tidyblog serve_blog clean_blog

blog:
	make generate_blog
#	make tidy_blog

generate_blog: TEMP_DIR = $(DEST_BLOG_DIR)/tmp
generate_blog: clean_blog
	mkdir -p $(TEMP_DIR)
	jekyll build -t -s blog -d $(TEMP_DIR)
	mv $(TEMP_DIR)/* $(DEST_BLOG_DIR)
	rm -rf $(TEMP_DIR)

tidy_blog:
	$(call html_tidy_dir,$(DEST_BLOG_DIR)/*)

serve_blog:
	jekyll serve --future --drafts --unpublished -s blog -d $(BLOG_SERVE_DIR)

clean_blog:
	$(call clean_dir,$(DEST_BLOG_DIR)/*)


### CLEAN  ######################################################################

.PHONY: clean clean_all

clean:
	rm -rf .sass_cache

clean_all: clean_home clean_photo clean_blog


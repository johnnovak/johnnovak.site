SRC_DIR  = '.'
DEST_DIR = '../johnnovak.local/'

ASSETS_DIR = File.join SRC_DIR,    'assets'
CSS_DIR    = File.join ASSETS_DIR, 'css/site'
IMG_DIR    = File.join ASSETS_DIR, 'img'
JS_DIR     = File.join ASSETS_DIR, 'js'

BLOG_DIR   = File.join SRC_DIR, 'blog'
HOME_DIR   = File.join SRC_DIR, 'home'
PHOTO_DIR  = File.join SRC_DIR, 'photo'

DEST_CSS_DIR  = File.join DEST_DIR, 'css'
DEST_BLOG_DIR = File.join DEST_DIR, 'blog'

SASS_CACHE    = File.join ASSETS_DIR, 'css/.sass-cache'
SASS_OPTS     = "--cache-location=#{SASS_CACHE}"
SASS_LOCATION = "#{CSS_DIR}:#{DEST_CSS_DIR}"


task :default => 'build_all'

desc "Generate full site"
task :build_all => [:blog, :photo, :home]

desc "Generate Jekyll blog"
task :blog => [:img, :css] do
  sh "jekyll build -s #{BLOG_DIR} -d #{DEST_BLOG_DIR}"
end

desc "Generate photo gallery"
task :photo do
  puts 'build_photo'
end

desc "Generate home page"
task :home => [:home_static, :img, :js, :css] do
  files = FileList[File.join HOME_DIR, "*"]
  cp_r files, DEST_DIR
end

desc "Copy static home page files"
task :home_static do
  files = FileList[File.join HOME_DIR, "*"]
  cp_r files, DEST_DIR
end

desc "Copy site images"
task :img do
  cp_r IMG_DIR, DEST_DIR
end

desc "Uglify and copy JavaScript files"
task :js do
  cp_r JS_DIR, DEST_DIR
end

desc "Generate CSS from SASS files"
task :css do
  mkdir_p DEST_CSS_DIR
  sh "sass #{SASS_OPTS} --force --update #{SASS_LOCATION}"
end

desc "Watch Jekyll blog changes"
task :watch_blog do
  sh "jekyll --watch -s #{BLOG_DIR} -d #{DEST_BLOG_DIR}"
end

desc "Watch SASS file changes"
task :watch_css do
  mkdir_p DEST_CSS_DIR
  sh "sass #{SASS_OPTS} --watch #{SASS_LOCATION}"
end

desc "Clean temporary files"
task :clean do
  rm_rf SASS_CACHE
end

desc "Clean dest dir"
task :clean_dest do
  rm_rf FileList[File.join DEST_DIR, "*"]
end


require 'rmagick'

img = Magick::Image.ping( 'jn-logo.png' ).first
width = img.columns
height = img.rows
print width
print "\n"
print height
print "\n"
print Dir.pwd
print "\n"

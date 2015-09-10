#!/usr/bin/env python

import sys
from pprint import pprint
from PIL import Image
from PIL.ExifTags import TAGS

def get_exif(path):
    ret = {}
    i = Image.open(path)
    info = i._getexif()
    for tag, value in info.items():
        decoded = TAGS.get(tag, tag)
        ret[decoded] = value
    return ret

exif = get_exif(sys.argv[1])

pprint(exif);

print

datetime     = exif['DateTimeOriginal'].replace(':', '-', 2)
camera       = exif['Model']
lens         = exif[42036]
aperture     = exif['FNumber']
shutter      = exif['ExposureTime']
iso          = exif['ISOSpeedRatings']
focal_length = exif['FocalLength']

print 'Date:         %s' % datetime
print 'Camera:       %s' % camera
print 'Lens:         %s' % lens
print 'Focal Length: %d mm' % focal_length[0]
print 'Shutter:      %d/%d' % shutter
print 'Aperture:     %.1f' % (float(aperture[0]) / float(aperture[1]))
print 'ISO:          %s' % iso

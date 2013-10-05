#!/usr/bin/env python

import json
import os.path
import shutil
import sys
from optparse import OptionParser

# from PIL import Image


VERBOSE = False


def info(msg):
    if VERBOSE:
        print msg


def urlize_title(title):
    s = ''
    for c in title:
        if c.isalnum():
            s += c
        elif c == ' ':
            s += '-'
    s = s.replace('--', '-')
    return s.lower()


def get_image_size(fname):
    info("  Reading image dimensions: '%s'" % fname)
    im = Image.open(fname)
    return im.size


def write_file(fname, data):
    outf = open(fname, 'w')
    outf.write(data.encode('utf8'))
    outf.close()


def copy_file(fname, dest_dir):
    dest_fname = os.path.join(dest_dir, fname)
    info("  Copying file '%s' to '%s" % (fname, dest_fname))
    shutil.copy2(fname, dest_fname)


def generate_albums(input_dir, output_dir, options):
    config = read_config(input_dir)
    shutil.rmtree(output_dir)
    os.mkdir(outpath)

    generate_album_page(config, inpath, outpath)
    generate_image_pages(config, inpath, outpath)


def main():
    usage = 'Usage: %prog [OPTIONS] INPUT-DIR OUTPUT-DIR'
    parser = OptionParser(usage=usage)

    parser.add_option('-v', '--verbose',
                      default=False, action='store_true',
                      help='talk more')

    options, args = parser.parse_args()

    if options.verbose:
        global VERBOSE
        VERBOSE = True

    if len(args) == 0:
        parser.error('input and output directories must be specified')
        return 2

    if len(args) == 1:
        parser.error('output directory must be specified')
        return 2

    input_dir = args[0]
    output_dir = args[1]

    generate_albums(input_dir, output_dir, options)
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        sys.exit(1)


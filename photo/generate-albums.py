#!/usr/bin/env python

import json
import os.path
import shutil
import sys
import yaml

from optparse import OptionParser
from pprint import pprint


VERBOSE = False


class ConfigException(Exception):
    pass


def info(msg):
    if VERBOSE:
        print msg


def read_config(fname):
    stream = file(fname, 'r')
    return yaml.load(stream)


def load_album_configs(path, conf=[]):
    for p in os.listdir(path):
        curr_path = os.path.join(path, p)
        if p == 'album.yaml':
            c = read_config(curr_path)
            c['basepath'] = path
            conf.append(c)
        elif os.path.isdir(curr_path):
            load_album_configs(curr_path, conf)
    return conf


def load_category_config(path):
    return read_config(os.path.join(path, 'categories.yaml'))


def preprocess_categories(categories):
    info('Preprocessing categories')
    conf = {}
    for c in categories:
        name = c['name']
        del c['name']
        conf[name] = c
    return conf


def preprocess_albums(conf, albums):
    for a in albums:
        info("Preprocessing album config '%s'" % a['basepath'])
        category = a['category']
        if category not in conf:
            raise ConfigException(
                "Album '%s' references non-existing category: '%s'" 
                % (a['name'], a['category']))
        del a['category']
        conf[category] = a
    return conf


def preprocess_config(categories, albums):
    conf = preprocess_categories(categories)
    return preprocess_albums(conf, albums)


def load_config(path):
    categories = load_category_config(path)
    albums = []
    load_album_configs(path, albums)
    return preprocess_config(categories, albums)


def generate_albums(input_dir, output_dir, options):
    shutil.rmtree(output_dir)
    os.mkdir(output_dir)

    generate_album_page(config, input_dir, output_dir)
    generate_image_pages(config, input_dir, output_dir)


def urlize_title(title):
    s = ''
    for c in title:
        if c.isalnum():
            s += c
        elif c in (' ', '_'):
            s += '-'
    # TODO regexp replace
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

    conf = load_config('.')

#    generate_albums(input_dir, output_dir, options)
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        sys.exit(1)


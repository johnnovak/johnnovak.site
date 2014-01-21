#!/usr/bin/env python

import json
import os.path
import shutil
import sys
import yaml

from collections import OrderedDict
from jinja2 import Environment, FileSystemLoader
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
    
def load_album_config(path):
    fname = os.path.join(path, 'album.yaml')
    config = read_config(fname)
    config['basepath'] = path
    return config


def load_album_configs_in_directory(path):
    configs = []
    for fname in os.listdir(path):
        album_path = os.path.join(path, fname)
        if os.path.isdir(album_path):
            configs.append(load_album_config(album_path))
    return configs


def load_album_configs(path, categories):
    configs = []
    for cat in categories:
        curr_path = os.path.join(path, cat['name'])
        configs += load_album_configs_in_directory(curr_path)
    return configs


def load_category_config(path):
    return read_config(os.path.join(path, 'categories.yaml'))


def process_categories(categories):
    info('Processing categories')
    conf = OrderedDict()
    conf = {}
    for c in categories:
        name = c['name']
        del c['name']
        conf[name] = c
    return conf


def process_albums(conf, albums):
    for a in albums:
        info("Processing album config '%s'" % a['basepath'])
        category = a['category']
        if category not in conf:
            raise ConfigException(
                "Album '%s' references non-existing category: '%s'" 
                % (a['name'], a['category']))
        del a['category']
        if not 'albums' in conf[category]:
            conf[category]['albums'] = []
        conf[category]['albums'].append(a)
    return conf


def process_config(categories, albums):
    conf = process_categories(categories)
    pprint(conf)
    return process_albums(conf, albums)


def load_config(path):
    categories = load_category_config(path)
    albums = load_album_configs(path, categories)
    return process_config(categories, albums)


def generate_albums(config, input_dir, output_dir):
    shutil.rmtree(output_dir)
    os.mkdir(output_dir)

    env = Environment(loader=FileSystemLoader('_templates'))

    generate_album_pages(env, config, input_dir, output_dir)
    generate_image_pages(env, config, input_dir, output_dir)


def generate_album_pages(env, config, input_dir, output_dir):
    template = env.get_template('album.html')
    categories = []
    for k, cat in config.iteritems():
        categories.append({
            'href': cat['basepath'],
            'caption': cat['name']}
        )


        html = template.render(categories=categories, albums=albums) 
        print html

def generate_image_pages(config, input_dir, output_dir):
    pass

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

    config = load_config(input_dir)
    pprint(config)

    generate_albums(config, input_dir, output_dir)
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        sys.exit(1)


#!/usr/bin/env python

import os
import shutil
import sys
import yaml

from collections import OrderedDict
from jinja2 import Environment, FileSystemLoader
from optparse import OptionParser
from os.path import join as joinpath
from pprint import pprint
from PIL import Image


VERBOSE = False


# {{{ UTILS


class ConfigException(Exception):
    pass


def info(msg):
    if VERBOSE:
        print msg


def warn(msg):
    print 'WARNING:', msg


def slur(title):
    s = ''
    for c in title:
        if c.isalnum():
            s += c
        elif c in (' ', '_'):
            s += '-'
    # TODO regexp replace
    s = s.replace('--', '-')
    return s.lower()


def read_image_size(fname):
    info("  Reading image dimensions: '%s'" % fname)
    im = Image.open(fname)
    return im.size


def read_yaml(fname):
    stream = file(fname, 'r')
    return yaml.load(stream)
    

def write_file(fname, data):
    outf = open(fname, 'w')
    outf.write(data.encode('utf8'))
    outf.close()
    

def copy_file(fname, dest_dir):
    dest_fname = joinpath(dest_dir, fname)
    info("  Copying file '%s' to '%s" % (fname, dest_fname))
    shutil.copy2(fname, dest_fname)


# }}}
# {{{ LOAD CONFIG


CATEGORIES_FNAME = 'categories.yaml'
ALBUMS_FNAME = 'album.yaml'


def load_config(path):
    categories = load_categories_config(path)
    albums = load_all_album_configs(path, categories)
    return categories, albums


def load_categories_config(path):
    fname = joinpath(path, CATEGORIES_FNAME)
    info("Loading categories config '%s'" % fname)
    return read_yaml(fname)


def load_all_album_configs(path, categories):
    configs = []
    for cat in categories:
        configs += load_album_configs_in_category(path, cat['name'])
    return configs


def load_album_configs_in_category(basepath, category_name):
    category_path = joinpath(basepath, category_name)
    configs = []
    for fname in os.listdir(category_path):
        rel_album_path = joinpath(category_name, fname)
        album_path = joinpath(basepath, rel_album_path)
        if os.path.isdir(album_path):
            if check_album_config_exists(album_path): 
                configs.append(load_album_config(basepath, rel_album_path))
    return configs


def check_album_config_exists(album_path):
    fname = get_album_config_fname(album_path)
    if not os.path.exists(fname):
        warn("Album configuration '%s' doesn't exist" % fname)
        return False
    return True


def load_album_config(basepath, rel_album_path):
    album_path = joinpath(basepath, rel_album_path)
    fname = get_album_config_fname(album_path)
    info("Loading album config '%s'" % fname)
    config = read_yaml(fname)
    config['rel_path'] = rel_album_path
    config['abs_path'] = album_path
    return config


def get_album_config_fname(path):
    return joinpath(path, ALBUMS_FNAME)


# }}}
# {{{ PROCESS CONFIG


def process_config(categories, albums):
    conf = process_categories(categories)
    return process_albums(conf, albums)


def process_categories(categories):
    info('Processing categories')
    conf = OrderedDict()
    # TODO remove after debugging
    conf = {}
    for c in categories:
        name = c['name']
        conf[name] = c
    return conf


def process_albums(conf, albums):
    for album in albums:
        info("Processing album config '%s'" % album['rel_path'])
        check_category_exists(conf, album)

        category = album['category']
        store_album_in_config(conf, album, category)
        del album['category']

        # TODO remove comment
        #process_images(album)

    return conf


def check_category_exists(conf, album):
    category = album['category']
    if category not in conf:
        raise ConfigException(
            "Album '%s' (in '%s') references non-existing category: '%s'" 
            % (album['name'], album['rel_path'], category))


def store_album_in_config(conf, album, category):
    # TODO use default dict
    albums_key = 'albums'
    if not albums_key in conf[category]:
        conf[category][albums_key] = []
    conf[category][albums_key].append(album)


def process_images(album):
    for image in album['images']:
        fname = joinpath(album['abs_path'], image['filename'])
        (image['width'], image['height']) = read_image_size(fname)


# }}}
# {{{ GENERATE OUTPUT


def generate_albums(config, input_dir, output_dir):
    shutil.rmtree(output_dir)
    os.mkdir(output_dir)

    env = Environment(loader=FileSystemLoader('_templates'))

    generate_album_pages(env, config, output_dir)
    generate_photo_pages(env, config, output_dir)


def generate_album_pages(env, config, output_dir):
    template = env.get_template('album.html')
    categories = assign_categories(config)
    for category in config.values():
        html = template.render(categories=categories,
                               albums=assign_albums(category)) 
        # TODO write output


def generate_photo_pages(env, config, output_dir):
    template = env.get_template('photo.html')
    for category in config.values():
        for album in category['albums']:
            html = template.render(photos=assign_photos(album)) 


def assign_categories(config):
    c = []
    for category in config.values():
        c.append({
            'href': category['name'],
            'caption': category['title']
        })
    return c


def assign_albums(category):
    a = []
    for album in category['albums']:
        a.append({
            'href': album['rel_path'],
            'img_href': joinpath(album['rel_path'], '_album.jpg'),
            'caption': album['name']
        })
    return a


def assign_photos(album):
    i = []
    album_path = album['rel_path']
    for image in album['images']:
        image_id = slur(image['title'])
        href = joinpath(album_path, image['filename'])
        caption = image['title']
        i.append({
            'id': image_id,
            'href': href,
            'caption': caption,
            'width': image['width']
        })
    return i


# }}}
# {{{ MAIN


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

    (categories, albums) = load_config(input_dir)
    config = process_config(categories, albums)
    pprint(config)

    generate_albums(config, input_dir, output_dir)
    return 0


# }}}


if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        sys.exit(1)

# vim:et ts=4 sts=4 foldmethod=marker

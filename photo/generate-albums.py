#!/usr/bin/env python

import collections
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

CATEGORIES_CONFIG_FNAME = '_categories.yaml'
ALBUM_CONFIG_FNAME = '_album.yaml'
ALBUM_IMAGE_FNAME = '_album.jpg'


# {{{ YAML ORDERDICT EXTENSION

# From: http://stackoverflow.com/a/21048064

def dict_representer(dumper, data):                                                            
    return dumper.represent_mapping(yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, data.iteritems())                                                                                         
def dict_constructor(loader, node):                                                            
    return collections.OrderedDict(loader.construct_pairs(node))                               

yaml.add_representer(collections.OrderedDict, dict_representer)                                
yaml.add_constructor(yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, dict_constructor)         


# }}}
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


def write_yaml(data, outfile):
    stream = yaml.dump(data, default_flow_style=False)
    stream = stream.replace('\n- ', '\n\n- ')
    f = open(outfile, 'w')
    f.write(stream)
    

def write_file(fname, data):
    outf = open(fname, 'w')
    outf.write(data.encode('utf8'))
    outf.close()
    

def copy_file(fname, dest_dir):
    dest_fname = joinpath(dest_dir, fname)
    info("  Copying file '%s' to '%s" % (fname, dest_fname))
    shutil.copy2(fname, dest_fname)


def get_categories_config_fname(path):
    return joinpath(path, CATEGORIES_CONFIG_FNAME)


def get_album_config_fname(path):
    return joinpath(path, ALBUM_CONFIG_FNAME)


def get_album_image_fname(path):
    return joinpath(path, ALBUM_IMAGE_FNAME)


# }}}
# {{{ CREATE CONFIG


def create_configs(path):
    info('Creating categories config')
    create_categories_config(path)

    info('Creating album configs')
    create_all_album_configs(path)


def create_categories_config(path):
    categories = []
    for fname in os.listdir(path):
        category_path = joinpath(path, fname)

        if os.path.isdir(category_path):
            category_name = fname
            info("  Category found: '%s'" % category_name)
            cat = OrderedDict([
                ('title', category_name),
                ('name', category_name)
            ])
            categories.append(cat)

    categories_config_fname = get_categories_config_fname(path)
    info("  Writing categories config '%s'\n" % categories_config_fname)
    write_yaml(categories, categories_config_fname)


def create_all_album_configs(path):
    for category_name in os.listdir(path):
        category_path = joinpath(path, category_name)
        if os.path.isdir(category_path):
            info("  Creating album configs for category: '%s'" % category_name)
            create_album_configs_for_category(category_path, category_name)


def create_album_configs_for_category(category_path, category_name):
    for album_name in os.listdir(category_path):
        album_path = joinpath(category_path, album_name)
        if os.path.isdir(album_path):
            info("    Album found: '%s'" % album_name)
            album = create_album_config(album_path, category_name, album_name)
            album_config_fname = get_album_config_fname(album_path)
            info("      Writing album config: '%s'\n" % album_config_fname)
            write_yaml(album, album_config_fname)


def create_album_config(album_path, category_name, album_name):
    album = OrderedDict()
    album['name'] = album_name
    album['date'] = ''
    album['category'] = category_name

    images = []
    for fname in os.listdir(album_path):
        if fname.endswith('.jpg') and fname != ALBUM_IMAGE_FNAME:
            info("      Image found: '%s'" % fname)
            img = OrderedDict([
                ('filename', fname),
                ('title', fname),
                ('location', ''),
                ('date', '')
            ])
            images.append(img)

    album['images'] = images
    return album


# }}}
# {{{ LOAD CONFIG


def load_config(path):
    categories = load_categories_config(path)
    albums = load_all_album_configs(path, categories)
    return categories, albums


def load_categories_config(path):
    fname = get_categories_config_fname(path)
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
            'img_href': get_album_image_fname(album['rel_path']),
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
    usage = ('\n'
             '  1. Generate default configuration files:\n'
             '         %prog -c [OPTIONS] INPUT-DIR\n\n'
             '  2. Generate site:\n'
             '         %prog [OPTIONS] INPUT-DIR OUTPUT-DIR')

    parser = OptionParser(usage=usage)

    parser.add_option('-c', '--create-configs',
                      default=False, action='store_true',
                      help='create default configuration files')

    parser.add_option('-v', '--verbose',
                      default=False, action='store_true',
                      help='talk more')

    options, args = parser.parse_args()

    if options.verbose:
        global VERBOSE
        VERBOSE = True

    if options.create_configs:
        if len(args) == 0:
            parser.error('input directory must be specified')
            return 2

        input_dir = args[0]
        create_configs(input_dir)

    else:
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

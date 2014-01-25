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
yaml.add_representer(collections.OrderedDict, dict_representer)                                

#def dict_constructor(loader, node):                                                            
#    return collections.OrderedDict(loader.construct_pairs(node))                               
#
#yaml.add_constructor(yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, dict_constructor)         


# }}}
# {{{ UTILS


class ConfigException(Exception):
    pass


def info(msg):
    if VERBOSE:
        print msg


def warn(msg):
    print 'WARNING:', msg


def read_image_size(fname):
    im = Image.open(fname)
    return im.size


def read_yaml(fname):
    stream = file(fname, 'r')
    return yaml.load(stream)


def write_yaml(data, fname):
    stream = yaml.dump(data, default_flow_style=False)
    stream = stream.replace('\n- ', '\n\n- ')
    f = open(fname, 'w')
    f.write(stream)
    

def write_file(data, fname):
    outf = open(fname, 'w')
    outf.write(data.encode('utf8'))
    outf.close()
    

def get_categories_config_fname(path):
    return joinpath(path, CATEGORIES_CONFIG_FNAME)


def get_album_config_fname(path):
    return joinpath(path, ALBUM_CONFIG_FNAME)


def get_category_path(category, path=''):
    return joinpath(path, category['name'], '')


def get_album_path(album, path=''):
    return joinpath(path, album['category'], album['name'], '')


def get_image_path(album, image, path=''):
    return joinpath(get_album_path(album, path=path), image['filename'])


def get_album_image_fname(album, path=''):
    return joinpath(get_album_path(album, path=path), ALBUM_IMAGE_FNAME)


# }}}
# {{{ CREATE CONFIG


def create_configs(path):
    categories = build_categories_config(path)
    write_categories_config(categories, path)

    info('Creating album configs')
    create_all_album_configs(path)


def build_categories_config(path):
    info('Building categories config')
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

    return categories


def write_categories_config(config, path):
    fname = get_categories_config_fname(path)
    info("  Writing categories config '%s'\n" % fname)
    write_yaml(config, fname)


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
            album = build_album_config(album_path, category_name, album_name)
            write_album_config(album_path, album)


def write_album_config(path, config):
    fname = get_album_config_fname(path)
    info("      Writing album config: '%s'\n" % fname)
    write_yaml(config, fname)


def build_album_config(album_path, category_name, album_name):
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
                ('title', os.path.splitext(fname)[0]),
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
        warn("Album config '%s' doesn't exist" % fname)
        return False
    return True


def load_album_config(basepath, rel_album_path):
    album_path = joinpath(basepath, rel_album_path)
    fname = get_album_config_fname(album_path)
    info("Loading album config '%s'" % fname)
    return read_yaml(fname)


# }}}
# {{{ PROCESS CONFIG


def process_config(categories, albums, input_dir):
    conf = process_categories(categories)
    return process_albums(conf, albums, input_dir)


def process_categories(categories):
    info('\nProcessing categories')
    conf = OrderedDict()
    for c in categories:
        name = c['name']
        conf[name] = c
    return conf


def process_albums(conf, albums, input_dir):
    for album in albums:
        info("Processing album config '%s'" % album['name'])
        check_category_exists(conf, album)

        category = album['category']
        store_album_in_config(conf, album, category)

        process_images(album, input_dir)

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


def process_images(album, input_dir):
    for image in album['images']:
        fname = get_image_path(album, image, path=input_dir)
        info("  Reading image dimensions: '%s'" % fname)
        (image['width'], image['height']) = read_image_size(fname)


# }}}
# {{{ GENERATE OUTPUT


def generate_albums(config, input_dir, output_dir, basepath):
    try:
        info("\nDeleting output directory '%s'" % output_dir)
        shutil.rmtree(output_dir)
    except OSError, e:
        print e

    info("Creating output directory '%s'" % output_dir)
    os.mkdir(output_dir)

    env = Environment(loader=FileSystemLoader(joinpath(input_dir,
                                                       '_templates')))

    generate_album_pages(env, config, output_dir, basepath)
    copy_default_album_page(config, output_dir)
    generate_photo_pages(env, config, output_dir, basepath)
    copy_images(config, input_dir, output_dir)


def get_categories(config):
    return config.values()


def get_albums(category):
    return category['albums']


def get_images(album):
    return album['images']


def generate_album_pages(env, config, output_dir, basepath):
    template = env.get_template('album.html')
    categories = assign_categories(config, basepath)

    for category in get_categories(config):
        dirname = joinpath(output_dir, category['name'])
        info("\nCreating category directory '%s'" % dirname)
        os.mkdir(dirname)

        html = template.render(page='albums', basepath=basepath,
                               current_category=category['name'],
                               categories=categories,
                               albums=assign_albums(category, basepath)) 

        fname = joinpath(dirname, 'index.html')
        info("Writing album page '%s'" % fname)
        write_file(html, fname)


def copy_default_album_page(config, output_dir):
    src_dir = get_category_path(config.items()[0][1], path=output_dir)
    srcpath = joinpath(src_dir, 'index.html')
    info("Copying default album page '%s' to '%s" % (srcpath, output_dir))
    shutil.copy2(srcpath, output_dir)
    

def generate_photo_pages(env, config, output_dir, basepath):
    template = env.get_template('photo.html')
    for category in get_categories(config):
        for album in get_albums(category):
            dirname = get_album_path(album, path=output_dir)
            info("\nCreating album directory '%s'" % dirname)
            os.mkdir(dirname)

            html = template.render(page='photo', basepath=basepath,
                                   photos=assign_photos(album)) 

            fname = joinpath(dirname, 'index.html')
            info("Writing photo page '%s'" % fname)
            write_file(html, fname)


def copy_images(config, input_dir, output_dir):
    for category in get_categories(config):
        info("\nCopying images in category '%s'" % category['name'])

        for album in get_albums(category):
            info("\n  Copying images in album '%s'" % album['name'])
            info("    Copying album image")
            shutil.copy2(get_album_image_fname(album, path=input_dir),
                         get_album_image_fname(album, path=output_dir))

            for image in get_images(album):
                srcpath = get_image_path(album, image, path=input_dir)
                destpath = get_image_path(album, image, path=output_dir)
                info("    Copying image '%s' to '%s" % (srcpath, destpath))
                shutil.copy2(srcpath, destpath)


def assign_categories(config, basepath):
    c = []
    for category in get_categories(config):
        c.append({
            'href': get_category_path(category, path=basepath),
            'caption': category['title'],
            'name': category['name']
        })
    return c


def assign_albums(category, basepath):
    a = []
    for album in get_albums(category):
        a.append({
            'href': get_album_path(album, path=basepath),
            'img_href': get_album_image_fname(album, path=basepath),
            'caption': album['name']
        })
    return a


def assign_photos(album):
    i = []
    for image in album['images']:
        image_id = image['filename']
        caption = image['title']
        i.append({
            'id': image_id,
            'href': image['filename'],
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

    parser.add_option('-p', '--basepath',
                      default='/',
                      help='basepath for absolute URLs (default: /)')

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
        basepath = '/'  + options.basepath.strip('/')

        (categories, albums) = load_config(input_dir)
        config = process_config(categories, albums, input_dir)

        generate_albums(config, input_dir, output_dir, basepath)

    return 0


# }}}


if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        sys.exit(1)

# vim:et ts=4 sts=4 foldmethod=marker

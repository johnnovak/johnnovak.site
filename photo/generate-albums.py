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
ALBUMS_CONFIG_FNAME = '_albums.yaml'

# rename 'photos' to 'images'
PHOTOS_CONFIG_FNAME = '_photos.yaml'
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


def get_albums_config_fname(path):
    return joinpath(path, ALBUMS_CONFIG_FNAME)


def get_photos_config_fname(path):
    return joinpath(path, PHOTOS_CONFIG_FNAME)


def get_category_path(path, category):
    return joinpath(path, category['name'], '')


def get_album_path(path, album):
    return joinpath(path, album['category'], album['url'], '')


def get_image_path(path, album, image):
    return joinpath(get_album_path(path, album), image['filename'])


def get_album_image_fname(path, album):
    return joinpath(get_album_path(path, album), ALBUM_IMAGE_FNAME)


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

        if not fname.startswith('_') and os.path.isdir(category_path):
            category_name = fname
            info("  Category found: '%s'" % category_name)
            cat = OrderedDict([
                ('name', category_name),
                ('title', category_name)
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
    config = load_all_album_configs(path, categories)
    return config


def load_categories_config(path):
    fname = get_categories_config_fname(path)
    info("Loading categories config '%s'" % fname)
    return read_yaml(fname)


def load_all_album_configs(path, categories):
    configs = OrderedDict()
    for category in categories:
        category_name = category['name']
        configs[category_name] = {
            'name': category_name,
            'title': category['title'],
            'albums': load_album_configs_in_category(path, category_name)
        }
    return configs


def load_album_configs_in_category(basepath, category_name):
    config = load_albums_config(basepath, category_name)

    for album in config:
        album_dir = album['name']
        album_path = joinpath(basepath, category_name, album_dir)
        album['images'] = load_images_config(album_path)
        album['url'] = album_dir
        album['category'] = category_name

    return config


def load_albums_config(basepath, category_name):
    fname = get_albums_config_fname(joinpath(basepath, category_name))
    config = read_yaml(fname)
    return config
    

def load_images_config(album_path):
    fname = get_photos_config_fname(album_path)
    info("Loading images config '%s'" % fname)
    config = read_yaml(fname)
    return config


# }}}
# {{{ PROCESS CONFIG


def process_images(album, input_dir):
    for image in album['images']:
        fname = get_image_path(input_dir, album, image)
        info("  Reading image dimensions: '%s'" % fname)


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

    generate_photo_pages(env, config, input_dir, output_dir, basepath)
    copy_images(config, input_dir, output_dir)

    generate_about_page(env, config, output_dir, basepath)


def get_categories(config):
    return config.values()


def get_albums(category):
    return category['albums']


def get_images(album):
    return album['images']


def generate_album_pages(env, config, output_dir, basepath):
    template = env.get_template('album.html')

    for category in get_categories(config):
        dirname = joinpath(output_dir, category['name'])
        info("\nCreating category directory '%s'" % dirname)
        os.mkdir(dirname)

        html = template.render(
            page='albums', basepath=basepath,
            current_category=category['name'],
            categories=assign_categories(config, basepath),
            albums=assign_albums(category, basepath)
        )

        fname = joinpath(dirname, 'index.html')
        info("Writing album page '%s'" % fname)
        write_file(html, fname)


def copy_default_album_page(config, output_dir):
    src_dir = get_category_path(output_dir, config.items()[0][1])
    srcpath = joinpath(src_dir, 'index.html')
    info("Copying default album page '%s' to '%s" % (srcpath, output_dir))
    shutil.copy2(srcpath, output_dir)
    

def generate_photo_pages(env, config, input_dir, output_dir, basepath):
    template = env.get_template('photo.html')
    for category in get_categories(config):
        for album in get_albums(category):
            dirname = get_album_path(output_dir, album)
            info("\nCreating album directory '%s'" % dirname)
            os.mkdir(dirname)

            html = template.render(
                page='photo', basepath=basepath,
                current_category=category['name'],
                categories=assign_categories(config, basepath),
                photos=assign_photos(album, input_dir)
            ) 

            fname = joinpath(dirname, 'index.html')
            info("Writing photo page '%s'" % fname)
            write_file(html, fname)


def copy_images(config, input_dir, output_dir):
    for category in get_categories(config):
        info("\nCopying images in category '%s'" % category['name'])

        for album in get_albums(category):
            info("\n  Copying images in album '%s'" % album['name'])
            info("    Copying album image")
            shutil.copy2(get_album_image_fname(input_dir, album),
                         get_album_image_fname(output_dir, album))

            for image in get_images(album):
                srcpath = get_image_path(input_dir, album, image)
                destpath = get_image_path(output_dir, album, image)
                info("    Copying image '%s' to '%s" % (srcpath, destpath))
                shutil.copy2(srcpath, destpath)


def assign_categories(config, basepath):
    c = []
    for category in get_categories(config):
        c.append({
            'href': get_category_path(basepath, category),
            'caption': category['title'],
            'name': category['name']
        })
    return c


def assign_albums(category, basepath):
    a = []
    for album in get_albums(category):
        caption = album['title']
        if album['date']:
            caption += ', ' + str(album['date'])

        a.append({
            'href': get_album_path(basepath, album),
            'img_href': get_album_image_fname(basepath, album),
            'caption': caption
        })
    return a


def assign_photos(album, input_dir):
    i = []
    for image in album['images']:
        image_id = os.path.splitext(image['filename'])[0]

        image_fname = joinpath(get_album_path(input_dir, album),
                               image['filename'])

        (width, height) = read_image_size(image_fname)

        caption = image['title']
        if image['location']:
            caption += ' &mdash; ' + image['location']
        if image['date']:
            caption += ', ' + str(image['date'])

        i.append({
            'id': image_id,
            'href': image['filename'],
            'caption': caption,
            'width': width
        })
    return i


def generate_about_page(env, config, output_dir, basepath):
    template = env.get_template('about.html')
    about_dir = joinpath(output_dir, 'about')

    info("Creating directory '%s'" % about_dir)
    os.mkdir(about_dir)

    html = template.render(page='about', basepath=basepath,
                           categories=assign_categories(config, basepath)) 

    fname = joinpath(about_dir, 'index.html')
    info("Writing about page '%s'" % fname)
    write_file(html, fname)


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

        config = load_config(input_dir)

        generate_albums(config, input_dir, output_dir, basepath)

    return 0


# }}}


if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        sys.exit(1)

# vim:et ts=4 sts=4 foldmethod=marker

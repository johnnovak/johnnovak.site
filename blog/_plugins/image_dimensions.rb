require 'rmagick'

module Jekyll
  module AssetFilter
    def width(image_url)
      img = loadImage(image_url)
      img.columns
    end

    def height(image_url)
      img = loadImage(image_url)
      img.rows
    end

    def loadImage(image_url)
      site = @context.registers[:site]
      image_path = File.join(site.config['source'], image_url)
      Magick::Image.ping(image_path).first
    end
  end
end

Liquid::Template.register_filter(Jekyll::AssetFilter)


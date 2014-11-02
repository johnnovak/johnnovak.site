# From:
# https://sendgrid.com/blog/creating-sustainable-documentation-with-jekyll/

# Generates a named anchor and wrapping tag from a string.

module Jekyll
  class AnchorBlock < Liquid::Block
    def initialize(tag_name, markup, tokens)
      @tag = markup
      super
    end

    def render(context)
      contents = super

      # pipe param through liquid to make additional replacements possible
      content = Liquid::Template.parse(contents).render context

      # strip whitespaces from both ends, strip out special chars and replace
      # spaces with hyphens
      safeContent = content.downcase.strip.gsub(/[^\w\s]/, '').gsub(/[\s]/, '-')

      output = "<#{@tag}><a name=\"#{safeContent}\" class=\"anchor\" href=\"##{safeContent}\">"
      output += content.strip
      output += "</a>"
      output += "</#{@tag}>"

      output
    end
  end
end

Liquid::Template.register_tag("anchor", Jekyll::AnchorBlock)

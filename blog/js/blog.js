$(document).ready(function() {
  replace2xImages();
  createSectionAnchors();
});

// From: http://ben.balter.com/2014/03/13/pages-anchor-links/
function createSectionAnchors() {
  $('h2, h3, h4, h5, h6').each(function(i, el) {
    var $el, link, id;
    $el = $(el);
    id = $el.attr('id');
    link = '¶';
    if (id) {
      return $el.append($('<a />')
                .addClass('header-link')
                .attr('href', '#' + id)
                .html(link));
    }
  });
}

function replace2xImages() {
  var $images = $("img[data-2x]");

  if (window.devicePixelRatio > 1.0) {
    $.each($images, function() {
      var $this = $(this);
      $this.attr("src", $this.data("2x"));
    });
  }
}


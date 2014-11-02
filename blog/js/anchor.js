// From: http://ben.balter.com/2014/03/13/pages-anchor-links/

$(function() {
  return $("h2, h3, h4, h5, h6").each(function(i, el) {
    var $el, link, id;
    $el = $(el);
    id = $el.attr('id');
    link = '#link';
    if (id) {
      return $el.append($("<a />").addClass("header-link").attr("href", "#" + id).html(link));
    }
  });
});


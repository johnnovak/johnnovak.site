$(document).ready(function() {
  replace2xImages();
  createSectionAnchors();
//  initFluidBox();
  initPhotoSwipe();
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

//function initFluidBox() {
//  $(function () {
//    $('figure.image a').fluidbox();
//  })
//}

function initPhotoSwipe() {
  createPhotoSwipeDOM();

	var pswpElement = document.querySelectorAll('.pswp')[0];

	// build items array
	var items = [
			{
					src: 'https://placekitten.com/600/400',
					w: 600,
					h: 400
			},
			{
					src: 'https://placekitten.com/1200/900',
					w: 1200,
					h: 900
			}
	];

	// define options (if needed)
	var options = {
			// optionName: 'option value'
			// for example:
			index: 0 // start at first slide
	};

	// Initializes and opens PhotoSwipe
	var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
//	gallery.init();
}

function createPhotoSwipeDOM() {
  $('body').append(
    '<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true">' +

      '<div class="pswp__bg"></div>' +

      '<div class="pswp__scroll-wrap">' +
        '<div class="pswp__container">' +
          '<div class="pswp__item"></div>' +
          '<div class="pswp__item"></div>' +
          '<div class="pswp__item"></div>' +
        '</div>' +

        '<div class="pswp__ui pswp__ui--hidden">' +
          '<div class="pswp__top-bar">' +
            '<div class="pswp__counter"></div>' +
            '<button class="pswp__button pswp__button--close" title="Close (Esc)"></button>' +
            '<button class="pswp__button pswp__button--share" title="Share"></button>' +
            '<button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>' +
            '<button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button>' +
            '<div class="pswp__preloader">' +
              '<div class="pswp__preloader__icn">' +
                '<div class="pswp__preloader__cut">' +
                  '<div class="pswp__preloader__donut"></div>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">' +
            '<div class="pswp__share-tooltip"></div> ' +
          '</div>' +

          '<button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)">' +
          '</button>' +

          '<button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)">' +
          '</button>' +

          '<div class="pswp__caption">' +
            '<div class="pswp__caption__center"></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

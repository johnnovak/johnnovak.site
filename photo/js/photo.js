// Disable text selection within element jQuery plugin
(function($){
  $.fn.disableSelection = function() {
    return this.attr('unselectable', 'on')
               .css('user-select', 'none')
               .on('selectstart', false);
  };
})(jQuery);


// Improved version jQuery find that finds root elements as well
$.fn.find2 = function(selector) {
    return this.filter(selector).add(this.find(selector));
};


// NOTE: The following two global params work only with my custom hacked
// fotorama.js
var CAPTION_HEIGHT = 80;
// TODO iphone: var CAPTION_HEIGHT = 50;

// Value to be subtracted from the stage height calculations (e.g. when
// height: '100%' is used)
var HEIGHT_OFFSET = 85;
// TODO iphone: var HEIGHT_OFFSET = 70;


/// GLOBAL MODULE START ////////////////////////////////////////////////////////
var site = function() {


// Load HTML fragment and fire a callback function when all images contained in
// it are fully loaded.
//
// url: URL of HTML fragment to load
// onLoad: Function to call after all images in the fragment have been loaded.
//         A single argument is passed to the function which holds the filtered
//         HTML fragment.
// selector (optional): filter the HTML fragment by running it through a CSS
//                      selector
// minDelay (default=0): minimum delay before onLoad() is called
// pollInterval (default=20): polling interval for checking whether all images
//                            have been loaded
//
function loadFragment(opts) {
  var fragment = null;
  var minDelay = opts.minDelay || 0;
  var pollInterval = opts.pollInterval || 20;

  setTimeout(function() {
    var interval = setInterval(function() {
      if (fragment) {
        clearInterval(interval);
        opts.onLoad(fragment);
      }
    }, pollInterval);
  }, minDelay);

  $.get(opts.url, function(frag) {
    if (opts.selector) {
      var frag = $(frag).find2(opts.selector);
    }
    frag.imagesLoaded(function() {
      fragment = frag;
    });
  });
}

function switchPage(newPage, pathname) {
  var currPage = site.currentPage;
  currPage.destroy();
  newPage.ajaxInit(pathname, currPage.destroyDuration());
  site.currentPage = newPage;
}

function switchPageByPathName(pathname) {
  var newPage = pageFromPathName(pathname);
  if (newPage.name != site.currentPage.name) {
    switchPage(newPage, pathname);
    pushState(pathname);
  }
}

function installMenuClickHandler() {
  if (!menuClickHandlerInstalled) {
    $('#header .menu a').each(function(i, link) {
      $(link).on('click', function(event) {
        event.preventDefault();
        switchPageByPathName(link.pathname);
      });
    });
    menuClickHandlerInstalled = true;
  }
};

function splitPathName(pathname) {
  var p = pathname.split('/');
  // Remove initial and trailing forward slashes, if present.
  if (!p[0]) {
    p.shift();
  }
  if (!p[p.length - 1]) {
    p.pop();
  }
  return p;
}

function pageNameFromPathName(pathname) {
  var path = splitPathName(pathname); 
  if (path.length == 2 && path[1] == 'about') {
    return 'about';
  } else if (path.length == 1 || path.length == 2) {
    return 'albums';
  } else if (path.length == 3) {
    return 'photo';
  }
}

function pageFromPathName(pathname) {
  return pageMappings[pageNameFromPathName(pathname)];
}

var historyPushed = false;

function pushState(url) {
  console.log('*** pushState:', url);
  history.pushState(null, null, url);
  historyPushed = true;
}

function replaceState(url) {
  console.log('*** replaceState:', url);
  history.replaceState(null, null, url);
  historyPushed = true;
}

function installPopStateHandler() {
  window.addEventListener('popstate', function(e) {
    if (historyPushed) {
      var currPage = site.currentPage;
      var pathname = location.pathname;
      var newPage = pageFromPathName(pathname);

      if (currPage.name == newPage.name) {
        if (currPage.popStateHandler) {
          currPage.popStateHandler();
        }
      } else {
        switchPage(newPage, pathname);
      }
    }
  });
}

var currentPage;
var menuClickHandlerInstalled = false;
var hasHistoryApi = !!(window.history && history.pushState);

if (hasHistoryApi) {
  installPopStateHandler();
}

/// PHOTO /////////////////////////////////////////////////////////////////////

var photo = function() {
  var fotorama;
  var fotoramaApi;

  function fotoramaize() {
    var a = $('#fotorama a');
    var img = $('#fotorama img');
    var h2 = $('#fotorama h2');

    for (var i = 0; i < a.length; i++) {
      var link = $(a[i]);
      var caption = link.attr('name');
      link.remove();

      var heading = $(h2[i]);
      var title = heading.text();
      heading.remove();

      var image = $(img[i]);
      image.attr('id', caption);
      image.attr('data-caption', title);
      image.attr('style', null);

    }
  }

  function createNavigation() {
    var navHtml =   '<ul class="counter">'
                  + '<li id="prev"><span>prev</span></li>'
                  + '<li id="imgcounter"></li>'
                  + '<li id="next"><span>next</span></li>'
                  + '<li id="fullscreen"></div>'
                  + '</ul>';

    $(navHtml).appendTo($('#nav'));
    $('#imgcounter').disableSelection();
  }

  function createFotorama() {
    fotorama = $('#fotorama');
    var opts = {
      width: '100%',
      height: '100%',
      nav: 'none',
      captions: true,
      transition: 'crossfade',
      transitionDuration: 400,
      allowfullscreen: 'native',
      arrows: false,
      hash: true
      // TODO investigate why this is broken keyboard: true,
    };
    if (hasHistoryApi) {
      opts.startIndex = location.hash.replace(/^#/, '');
    }
    fotorama.fotorama(opts);
    fotoramaApi = fotorama.data('fotorama');
  }

  function installNavButtonHandlers() {
    $('#prev').click(function() {
      fotoramaApi.show('<');
    });
    $('#next').click(function() {
      fotoramaApi.show('>');
    });
    $('#fullscreen').click(function() {
      fotoramaApi.requestFullScreen();
    });
  }

  function installImageCounterAndCaptionHandlers() {
    function updateNav(e, fotorama) {
      var curr = fotoramaApi.activeIndex + 1;
      if (curr == 1) {
        $('#prev').addClass('disabled');
      } else {
        $('#prev').removeClass('disabled');
      }
      if (curr == fotoramaApi.data.length) {
        $('#next').addClass('disabled');
      } else {
        $('#next').removeClass('disabled');
      }
      if (curr < 10) {
        curr = '0' + curr;
      }
      max = fotoramaApi.size
      if (max < 10) {
        max = '0' + max;
      }
      $('#imgcounter').text(curr + ' / ' + max);
      $('#caption').text(fotoramaApi.activeFrame.caption);
    };

    function pushCurrentPhoto(e, fotorama, replace) {
      var hash = fotorama.activeFrame.id || fotorama.activeIndex;
      if (location.hash.replace(/^#/, '') != hash) {
        if (replace) {
            replaceState('#' + hash);
        } else {
            pushState('#' + hash);
        }
      }
    }

    fotorama.on('fotorama:show', function(e, fotorama) { 
      if (hasHistoryApi) {
        pushCurrentPhoto(e, fotorama, false);
      }
      updateNav(e, fotorama);
    });

    fotorama.on('fotorama:load', function(e, fotorama) {
      if (hasHistoryApi) {
        pushCurrentPhoto(e, fotorama, true);
      }
      updateNav(e, fotorama);
    });
  }

  function init() {
    if (hasHistoryApi) {
      installMenuClickHandler()
    }
    fotoramaize();
    createNavigation();
    createFotorama();
    installNavButtonHandlers();
    installImageCounterAndCaptionHandlers();
  }

  function ajaxInit(url, delay) {
    loadFragment({
      url: url,
      selector: '#content',
      minDelay: delay,
      onLoad: function(fragment) {
        // TODO refactor into method
        $('#content').html(fragment);
        init();
      }
    });
  }

  var fadeOutDuration = 300;

  function destroy() {
    $('#fotorama').fadeTo(fadeOutDuration, 0);
    $('#nav').fadeTo(fadeOutDuration, 0);
  }

  function destroyDuration() {
    return fadeOutDuration;
  }

  function popStateHandler() {
    var hash = location.hash.replace(/^#/, '');
    if (hash) {
      fotoramaApi.show(hash);
    }
  }

  return {
    name: 'photo',
    init: init,
    ajaxInit: ajaxInit,
    destroy: destroy,
    destroyDuration: destroyDuration,
    popStateHandler: popStateHandler
  };
}();

/// ALBUMS ////////////////////////////////////////////////////////////////////

var albums = function() {
  var categories;
  var loading = false;

  function fadeInAlbums(initialDelay) {
    var fadeInDelay = 120;
    var fadeInDuration = 400;
    initialDelay |= 0;

    $('.album').each(function(i, album) {
      $(album).delay(initialDelay + i * fadeInDelay) .fadeTo(fadeInDuration, 1);
    });
  }

  var fadeOutAlbumsDelay = 120;
  var fadeOutAlbumDuration = 200;

  function fadeOutAlbums() {
    $('.album').each(function(i, album) {
      $(album).delay(i * fadeOutAlbumsDelay).fadeTo(fadeOutAlbumDuration, 0);
    });
  }

  function fadeOutAlbumsDuration() {
    return ($('.album').length - 1) * fadeOutAlbumsDelay + fadeOutAlbumDuration;
  }

  function categoryByHref(url) {
    var c = categories.find("[href='" + url + "']");
    if (c.length) {
      return c.parent();
    } else {
      return $(categories[0]);
    }
  }

  function changeCategory(url) {
    // Update selected
    categories.removeClass('sel');
    categoryByHref(url).addClass('sel');
    fadeOutAlbums();
    loadCategory(url);
  }

  function loadCategory(url) {
    loadFragment({
      url: url,
      selector: '.thumbs',
      minDelay: fadeOutAlbumsDuration(),
      onLoad: function(fragment) {
        $('.thumbs').html(fragment.children());
        fadeInAlbums();
        installAlbumClickHandler();
      }
    });
  }

  function fadeInCategories() {
    categories.each(function(i, album) {
      $(album).delay(500 + i * 130).fadeTo(300, 1);
    });
  }

  var fadeOutCategoriesInitialDelay = 50;
  var fadeOutCategoriesDelay = 120;
  var fadeOutCategoryDuration = 200;

  function fadeOutCategories() {
    categories.each(function(i, album) {
      $(album).delay(fadeOutCategoriesInitialDelay + i * fadeOutCategoriesDelay).fadeTo(fadeOutCategoryDuration, 0);
    });
  }

  function fadeOutCategoriesDuration() {
    return fadeOutCategoriesInitialDelay + ($('.album').length - 1) * fadeOutCategoriesDelay + fadeOutCategoryDuration;
  }

  function installCategoryClickHandler() {
    categories.find('a').each(function(i, link) {
      $(link).on('click', function(event) {
        event.preventDefault();
        changeCategory(link.pathname);
        pushState(link.pathname);
      });
    });
  }

  function installAlbumClickHandler() {
    $('.thumbs .album').each(function(i, album) {
      $('a', album).each(function(i, link) {
        $(link).on('click', function(event) {
          event.preventDefault();
          switchPageByPathName(link.pathname);
        });
      });
    });
  }

  function init() {
    categories = $('.categories li');
    // refactor into globalInit
    if (hasHistoryApi) {
      installMenuClickHandler()
      installCategoryClickHandler();
      installAlbumClickHandler();
    }
    fadeInAlbums(250);
    fadeInCategories();
  }

  function ajaxInit(url, delay) {
    loadFragment({
      url: url,
      selector: '#content',
      minDelay: delay,
      onLoad: function(fragment) {
        // TODO refactor into method
        $('#content').html(fragment.children());
        init();
      }
    });
  }

  function destroy() {
    fadeOutCategories()
    fadeOutAlbums();
  }

  function destroyDuration() {
    return Math.max(fadeOutCategoriesDuration(), fadeOutAlbumsDuration());
  }

  function popStateHandler() {
    changeCategory(location.pathname);
  }

  return {
    name: 'albums',
    init: init,
    ajaxInit: ajaxInit,
    destroy: destroy,
    destroyDuration: destroyDuration,
    changeCategory: changeCategory,
    popStateHandler: popStateHandler
  }
}();

/// ABOUT /////////////////////////////////////////////////////////////////////

var about = function() {
  function fadeIn() {
    $('#about img').delay(200).fadeTo(400, 1);
    $('#about .text').delay(400).fadeTo(600, 1);
  }

  var imgFadeOutDelay = 0;
  var imgFadeOutDuration = 150;
  var textFadeOutDelay = 60;
  var textFadeOutDuration = 250;

  function fadeOut() {
    $('#about img').delay(imgFadeOutDelay).fadeTo(imgFadeOutDuration, 0);
    $('#about .text').delay(textFadeOutDelay).fadeTo(textFadeOutDuration, 0);
  }

  function fadeOutDuration() {
    return Math.max(imgFadeOutDelay + imgFadeOutDuration,
                    textFadeOutDelay + textFadeOutDuration);
  }

  function init() {
    if (hasHistoryApi) {
      installMenuClickHandler()
    }
    fadeIn();
  }

  function ajaxInit(url, delay) {
    loadFragment({
      url: url,
      selector: '#content',
      minDelay: delay,
      onLoad: function(fragment) {
        // TODO refactor into method
        $('#content').html(fragment.children());
        init();
      }
    });
  }

  function destroy() {
    console.log("destroy about");
    fadeOut();
  }

  function destroyDuration() {
    return fadeOutDuration();
  }

  return {
    name: 'about',
    init: init,
    ajaxInit: ajaxInit,
    destroy: destroy,
    destroyDuration: destroyDuration
  }
}();

var pageMappings = {
  'about': about,
  'albums': albums,
  'photo': photo
}

/// GLOBAL MODULE EXPORTS //////////////////////////////////////////////////////

return {
  currentPage: currentPage,
  about: about,
  albums: albums,
  photo: photo
}

}();

/// GLOBAL MODULE END //////////////////////////////////////////////////////////

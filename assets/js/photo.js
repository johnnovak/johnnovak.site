// Disable text selection within element jQuery plugin
(function($){
  $.fn.disableSelection = function() {
    return this.attr('unselectable', 'on')
               .css('user-select', 'none')
               .on('selectstart', false);
  };
})(jQuery);


// NOTE: The following two global params work only with my custom hacked
// fotorama.js
var CAPTION_HEIGHT = 65;

// Value to be subtracted from the stage height calculations (e.g. when
// height: '100%' is used)
var HEIGHT_OFFSET = 130;    


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
      frag = $(opts.selector, frag);
    }
    frag.imagesLoaded(function() {
      fragment = frag;
    });
  });
}

function installMenuClickHandler() {
  if (!menuClickHandlerInstalled) {
    $('#header .menu a').each(function(i, link) {
      $(link).on('click', function(event) {
        event.preventDefault();
        site.currentPage.destroy();
      });
    });
    menuClickHandlerInstalled = true;
  }
};

var historyPushed = false;

function pushState(url) {
  history.pushState(null, null, url);
  historyPushed = true;
}

function installPopStateHandler() {
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

  window.addEventListener('popstate', function(e) {
    if (historyPushed) {
      var currPage = site.currentPage;
      var path = splitPathName(location.pathname); 
      var page;

      // about
      if (path.length == 1 && path[0] == 'about') {
        currPage.destroy();
        // TODO load 'about'
        console.log('load(about)');

      // albums
      } else if (path.length == 1 || path.length == 2) {
        if (currPage.name == 'albums') {
          currPage.changeCategory(location.pathname);
        } else {
          currPage.destroy();
          // TODO load 'albums'
          console.log('load(albums)');
        }

      // photo
      } else if (path.length == 3) {
        if (currPage.name == 'photo') {
          var hash = location.hash.replace(/^#/, '');
          if (hash) {
            currPage.getFotoramaApi().show(hash);
          }
        } else {
          currPage.destroy();
          // TODO load 'photo'
          console.log('load(photo)');
        }
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
      console.log(title);
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
      hash: true,
      keyboard: true,
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
      $('#imgcounter').text(curr + ' / ' + fotoramaApi.size);
      $('#caption').text(fotoramaApi.activeFrame.caption);
    };

    function pushCurrentPhoto(e, fotorama) {
      var hash = fotorama.activeFrame.id || fotorama.activeIndex;
      console.log('fotorama:show', hash);
      if (location.hash.replace(/^#/, '') != hash) {
        pushState('#' + hash);
      }
    }

    fotorama.on('fotorama:show', function(e, fotorama) { 
      if (hasHistoryApi) {
        pushCurrentPhoto(e, fotorama);
      }
      updateNav(e, fotorama);
    });
    fotorama.on('fotorama:load', updateNav);
  }

  function init() {
    installMenuClickHandler()
    fotoramaize();
    createNavigation();
    createFotorama();
    installNavButtonHandlers();
    installImageCounterAndCaptionHandlers();
  }

  function destroy() {
    console.log('photo.destroy');
  }

  return {
    name: 'photo',
    init: init,
    destroy: destroy,
    getFotoramaApi: function() { return fotoramaApi; }
  };
}();

/// ALBUMS ////////////////////////////////////////////////////////////////////

var albums = function() {
  var categories;
  var loading = false;
  var fadeInDone = false;

  function fadeInAlbums(initialDelay) {
    var fadeInDelay = 120;
    var fadeInDuration = 400;
    initialDelay |= 0;

    fadeInDone = false;
    $('.album').each(function(i, album) {
      $(album).delay(initialDelay + i * fadeInDelay) .fadeTo(fadeInDuration, 1);
    });
    var duration = initialDelay + ( $('.album').length - 1)
                                * fadeInDelay + fadeInDuration;
    setTimeout(function() { fadeInDone = true }, duration);
  }

  var fadeOutDelay = 120;
  var fadeOutDuration = 200;
  var fadeOutDone = false;

  function fadeOutAlbums() {
    fadeOutDone = false;
    $('.album').each(function(i, album) {
      $(album).delay(i * fadeOutDelay).fadeTo(fadeOutDuration, 0);
    });
    var duration = fadeOutAlbumsDuration();
    setTimeout(function() { fadeOutDone = true }, duration);
  }

  function fadeOutAlbumsDuration() {
    return ($('.album').length - 1) * fadeOutDelay + fadeOutDuration;
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
    loading = true;
    loadCategory(url);
  }

  function loadCategory(url) {
    loadFragment({
      url: url,
      selector: '.thumbs > *',
      minDelay: fadeOutAlbumsDuration(),
      onLoad: function(fragment) {
        loading = false;
        $('.thumbs').html(fragment);
        fadeInAlbums();
      }
    });
  }

  function fadeInCategories() {
    categories.each(function(i, album) {
      $(album).delay(500 + i * 130).fadeTo(300, 1);
    });
  }

  function installCategoryClickHandler() {
    categories.find('a').each(function(i, link) {
      $(link).on('click', function(event) {
        event.preventDefault();
        if (!loading && fadeInDone) {
          pushState(link.pathname);
          changeCategory(link.pathname);
        }
      });
    });
  }

  function init() {
    installMenuClickHandler()
    categories = $('.categories li');
    if (hasHistoryApi) {
      installPopStateHandler();
      installCategoryClickHandler();
    }
    fadeInAlbums(250);
    fadeInCategories();
  }

  function destroy() {
    console.log('albums.destroy');
  }

  return {
    name: 'albums',
    init: init,
    destroy: destroy,
    changeCategory: changeCategory
  }
}();

/// ABOUT /////////////////////////////////////////////////////////////////////

var about = function() {
  function fadeIn() {
    $('#about img').delay(200).fadeTo(400, 1);
    $('#about .text').delay(400).fadeTo(600, 1);
  }

  function init() {
    installMenuClickHandler()
    fadeIn();
  }

  function destroy() {
    console.log('about.destroy');
  }

  return {
    name: 'about',
    init: init,
    destroy: destroy
  }
}();

/// GLOBAL MODULE EXPORTS //////////////////////////////////////////////////////

return {
  currentPage: currentPage,
  about: about,
  albums: albums,
  photo: photo
}

}();

/// GLOBAL MODULE END //////////////////////////////////////////////////////////

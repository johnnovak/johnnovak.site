$(document).ready(function() {

  var MAX_ACCELERATION = 25;
  var SCROLL_EASE = .1;
  var WHEEL_STEP = 250;

  var SECTION_NAMES = ['about', 'music', 'photo', 'code'];

  var g_animatingScroll = false;
  var g_scrollToSection = false;
  var g_scrollInterval;
  var g_currentScroll;
  var g_scrollDest;
  var g_speed = 0;

  var g_resizeTimer;
  var g_isParallaxInstalled = false;
  var g_isParallax = false;
  var g_isMac;

  var g_sectionPositions = [];

  init();

/////////////////////////////////////////////////////////////////////////////

  function init() {
    if (getDevicePixelRatio() > 1) {
      replace2xImages();
    }

    displayPage();

    if (!g_isDesktop) {
      return;
    } else {
      $('html').addClass('desktop');
    }

    // Detect OS
    // from http://stackoverflow.com/a/11752533
    g_isMac = navigator.platform.toUpperCase().indexOf('MAC') !== -1;

    installInputHandlers();

    g_isParallax = !isMobileView();
    if (g_isParallax) {
      installParallax();
    }

    installResizeHandler();
    installMainMenuHandlers();
  }

  function getDevicePixelRatio() {
    var r = window.devicePixelRatio;
    return r === undefined ? 1 : r;
  }

  function replace2xImages() {
    var $images = $("img[data-2x]");

    $.each($images, function() {
      var $this = $(this);
      $this.attr("src", $this.data("2x"));
    });
  }

  function displayPage() {
    $('#wrapper').css('display', 'block');
  }

  // Detect CSS3 transform availability
  // from http://stackoverflow.com/a/12625986
  function hasTransform() {
    // TODO: why doesn't work in IE9 and Opera?
    // var prefixes = 'transformProperty WebkitTransform MozTransform OTransform msTransform'.split(' ');
    var p = 'transformProperty WebkitTransform MozTransform OTransform';
    var prefixes = p.split(' ');
    for (var i = 0; i < prefixes.length; i++) {
      if (document.createElement('div').style[prefixes[i]] !== undefined) {
        return prefixes[i];
      }
    }
    return false;
  }

  function isMobileView() {
    return $('#mainmenu').css('position') != 'fixed';
  }

  function getCurrentSection() {
    var minDist = 9999999;
    var currentSection = 0;
    for (i = 0; i < g_sectionPositions.length; i++) {
      var d = Math.abs(g_currentScroll - g_sectionPositions[i])
      if (d < minDist) {
        minDist = d;
        currentSection = i;
      }
    }
    return currentSection;
  }

  // Scrolling code ripped from http://www.ascensionlatorre.com/home
  function scrollTo(target) {
    g_animatingScroll = true;

    var windowHeight = $(window).height();
    var documentHeight = $(document).height();
    var maxScrollDest = documentHeight - windowHeight;

    g_scrollDest = target;
    if (g_scrollDest < 0) {
      g_scrollDest = 0;
    } else if (g_scrollDest > maxScrollDest) {
      g_scrollDest = maxScrollDest;
    }

    if (g_scrollInterval) {
      return;
    }

    g_currentScroll = $(window).scrollTop();

    g_scrollInterval = setInterval(function() {
      var scrollDiff = (g_scrollDest - g_currentScroll) * SCROLL_EASE;
      var way = scrollDiff / Math.abs(scrollDiff);
      g_speed += MAX_ACCELERATION * way;

      if (Math.abs(scrollDiff) > Math.abs(g_speed)) {
        scrollDiff = g_speed;
      } else {
        g_speed = scrollDiff;
      }
      g_currentScroll += scrollDiff;
      $(window).scrollTop(g_currentScroll);

      if (Math.abs(g_currentScroll - g_scrollDest) < .5) {
        g_animatingScroll = false;
        g_currentScroll = g_scrollDest;

        clearInterval(g_scrollInterval);

        g_scrollInterval = undefined;
        g_scrollToSection = false;
      }
    }, 1000 / 60);
  }

  function installInputHandlers() {
    $(document).bind('mousewheel', mouseWheelHandler);
    $(document).bind('keydown', keyDownHandler);
    $(document).bind('scroll', scrollHandler);
  }

  function keyDownHandler(event) {
    if (!g_isParallax) {
      return;
    }
    var destSection = getCurrentSection();
    switch (event.keyCode) {
      case 38: // up arrow
      case 33: // page up
        event.preventDefault();
        destSection--;
        break;

      case 40: // down arrow
      case 34: // page down
        event.preventDefault();
        destSection++;
        break;

      case 36: // home
        event.preventDefault();
        destSection = 0;
        break;

      case 35: // end
        event.preventDefault();
        destSection = g_sectionPositions.length - 1;
        break;

      case 37: // left
      case 39: // right
        event.preventDefault();
        return;

      default:
        return;
    }
    destSection = Math.max(Math.min(destSection,
                                    g_sectionPositions.length - 1), 0);

    g_scrollToSection = true;
    scrollTo(g_sectionPositions[destSection]);
  }

  function scrollHandler() {
    if (g_isParallax && !g_scrollToSection) {
      currentSection = getCurrentSection();
    }
  }

  function mouseWheelHandler(event, delta, deltaX, deltaY) {
    // Don't mess with the mousewheel on Macs due to the notorious (and
    // unresolvable) touchpad vs oldschool-clicky-mousewheel issue
    if (!g_isParallax) {
      return;
    }
    if (g_isMac) { 
      if (g_scrollToSection) {
        event.preventDefault();
      }
    } else {
      event.preventDefault();
      if (!g_scrollToSection) {
          scrollTop = $(window).scrollTop();
          scrollTo(scrollTop + (-WHEEL_STEP * delta));
      }
    }
  }

  function installParallax() {
    initSectionPositions();

    // Install parallax
    $.stellar({
      // Fallback to 'position' for IE8
      positionProperty: hasTransform() ? 'transform' : 'position',
      horizontalScrolling: false,
      parallaxBackgrounds: false
    });

    g_isParallaxInstalled = true;
  }

  function initSectionPositions() {
    for (var i = 0; i < SECTION_NAMES.length; i++) {
      g_sectionPositions[i] = $('#' + SECTION_NAMES[i]).offset().top;
    }
  }

  function installResizeHandler() {
    $(window).bind('resize', function() { 
      clearTimeout(g_resizeTimer);
      g_resizeTimer = setTimeout(resizeHandler, 100);
    });
  }

  function resizeHandler() {
    g_isParallax = !isMobileView();
    if (!g_isParallaxInstalled && g_isParallax) {
      installParallax();
    }
  }

  function installMainMenuHandlers() {
    for (var i = 0; i < SECTION_NAMES.length; i++) {
      name = SECTION_NAMES[i];
      $('#menu-' + SECTION_NAMES[i]).bind('click',
                                          generateMainMenuHandler(i));
    }
  }

  function generateMainMenuHandler(i) {
    return function(event) {
      if (g_isParallax) {
        event.preventDefault();
        g_scrollToSection = true;
        scrollTo(g_sectionPositions[i]);
      }
    }
  }
});


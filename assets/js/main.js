$(document).ready(function() {

  //// GLOBALS ///////////////////////////////////////////////////////////////
  
  var sectionPositions;

  var MAX_ACCELERATION = 25;
  var SCROLL_EASE = .1;
  var WHEEL_STEP = 250;

  var animatingScroll = false;
  var scrollToSection = false;
  var scrollInterval;
  var currentScroll;
  var scrollDest;
  var speed = 0;

  var resizeTimer;
  var isParallaxInstalled = false;
  var isParallax = false;
  var isMac;

  //// INIT //////////////////////////////////////////////////////////////////
  
  displayPage();

  if (!isDesktop) {
    return;
  } else {
    $('html').addClass('desktop');
  }

  // Detect OS
  // from http://stackoverflow.com/a/11752533
  isMac = navigator.platform.toUpperCase().indexOf('MAC') !== -1;

  $(document).bind('mousewheel', mouseWheelHandler);
  $(document).bind('keydown', keyDownHandler);
  $(document).bind('scroll', scrollHandler);

  isParallax = !isMobileView();
  if (isParallax) {
    installParallax();
  }

  //// FUNCTIONS /////////////////////////////////////////////////////////////
  
  function displayPage() {
    $('#wrapper').css('display', 'block');
  }

  // Detect CSS3 transform availability
  // from http://stackoverflow.com/a/12625986
  function hasTransform() {
    // TODO: why doesn't work in IE9 and Opera?
    // var prefixes = 'transformProperty WebkitTransform MozTransform OTransform msTransform'.split(' ');
    var prefixes = 'transformProperty WebkitTransform MozTransform OTransform'.split(' ');
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
    for (i = 0; i < sectionPositions.length; i++) {
      var d = Math.abs(currentScroll - sectionPositions[i])
      if (d < minDist) {
        minDist = d;
        currentSection = i;
      }
    }
    return currentSection;
  }

  // Scrolling code ripped from http://www.ascensionlatorre.com/home
  function scrollTo(target) {
    animatingScroll = true;

		var windowHeight = $(window).height();
    var documentHeight = $(document).height();
    var maxScrollDest = documentHeight - windowHeight;

    scrollDest = target;
    if (scrollDest < 0) {
      scrollDest = 0;
    } else if (scrollDest > maxScrollDest) {
      scrollDest = maxScrollDest;
    }
    
    if (scrollInterval) {
      return;
    }

    currentScroll = $(window).scrollTop();

    scrollInterval = setInterval(function() {
      var scrollDiff = (scrollDest - currentScroll) * SCROLL_EASE;
      var way = scrollDiff / Math.abs(scrollDiff);
      speed += MAX_ACCELERATION * way;

      if (Math.abs(scrollDiff) > Math.abs(speed)) {
        scrollDiff = speed;
      } else {
        speed = scrollDiff;
      }
      currentScroll += scrollDiff;
      $(window).scrollTop(currentScroll);

      if (Math.abs(currentScroll - scrollDest) < .5) {
        animatingScroll = false;
        currentScroll = scrollDest;
        clearInterval(scrollInterval);
        scrollInterval = undefined;
        scrollToSection = false;
      }
    }, 1000 / 60);
  }

  function keyDownHandler(event) {
    if (!isParallax) {
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
        destSection = sectionPositions.length - 1;
        break;

      case 37: // left
      case 39: // right
        event.preventDefault();
        return;
      
      default:
        return;
    }
    destSection = Math.max(Math.min(destSection, sectionPositions.length - 1), 0);
    scrollToSection = true;
    scrollTo(sectionPositions[destSection]);
  }

  function scrollHandler() {
    if (isParallax && !scrollToSection) {
      currentSection = getCurrentSection();
    }
  }
  
  function mouseWheelHandler(event, delta, deltaX, deltaY) {
    // Don't mess with the mousewheel on Macs due to the notorious (and
    // unresolvable) touchpad vs oldschool-clicky-mousewheel issue
    if (!isParallax) {
      return;
    }
    if (isMac) { 
      if (scrollToSection) {
        event.preventDefault();
      }
    } else {
      event.preventDefault();
      if (!scrollToSection) {
          scrollTop = $(window).scrollTop();
          scrollTo(scrollTop + (-WHEEL_STEP * delta));
      }
    }
  }

  function installParallax() {
    sectionPositions = [
      $('#about').offset().top,
      $('#music').offset().top,
      $('#photo').offset().top,
      $('#code').offset().top
    ];

    // Install parallax
    $.stellar({
      // Fallback to 'position' for IE8
      positionProperty: hasTransform() ? 'transform' : 'position',
      horizontalScrolling: false,
      parallaxBackgrounds: false
    });

    isParallaxInstalled = true;
  }

  function resizeHandler() {
    isParallax = !isMobileView();
    if (!isParallaxInstalled && isParallax) {
      installParallax();
    }
  }

  $(window).bind('resize', function() { 
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeHandler, 100);
  });

  // Install main menu callbacks
  $('#menu-about').click(function(event) {
    if (isParallax) {
      event.preventDefault();
      var i = 0;
      scrollToSection = true;
      scrollTo(sectionPositions[i]);
    }
  });

  $('#menu-music').click(function(event) {
    if (isParallax) {
      event.preventDefault();
      var i = 1;
      scrollToSection = true;
      scrollTo(sectionPositions[i]);
    }
  });

  $('#menu-photo').click(function(event) {
    if (isParallax) {
      event.preventDefault();
      var i = 2;
      scrollToSection = true;
      scrollTo(sectionPositions[i]);
    }
  });

  $('#menu-code').click(function(event) {
    if (isParallax) {
      event.preventDefault();
      var i = 3;
      scrollToSection = true;
      scrollTo(sectionPositions[i]);
    }
  });
});


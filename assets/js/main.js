function displayPage() {
  $('#wrapper').css('display', 'block');
}

$(document).ready(function() {

  var ua = navigator.userAgent;
  var isMobileWebkit = /WebKit/.test(ua) && /Mobile/.test(ua);

  if (isMobileWebkit) {
    $('html').addClass('mobile');
    displayPage();
    return;
  }

  // Detect OS
  // from http://stackoverflow.com/a/11752533
  var isMac = navigator.platform.toUpperCase().indexOf('MAC') !== -1;
  var isWindows = navigator.platform.toUpperCase().indexOf('WIN') !== -1;
  var isLinux = navigator.platform.toUpperCase().indexOf('LINUX') !== -1;

  // Adjust static section heights & image positions for a nice parallax effect
  $('#about-section').css('height', '750px');
  $('#music-section').css('height', '700px');
  $('#photo-section').css('height', '700px');
  $('#code-section').css('height', '1400px');

  $('#about-bg').css('top', '190px');

  $('#music-bg').css('top', '-120px');

  $('#photo-bg-leg1').css('top', '60px');
  $('#photo-bg-leg2').css('top', '-330px');
  $('#photo-bg-skull').css('top', '100px');

  $('#code-bg').css('top', '-200px');

  $('#footer-bg-building').css('top', '-450px');
  $('#footer-bg-gate').css('top', '-690px');
  $('#footer-bg-sun').css('top', '-325px');
  $('#footer-bg').css('margin-top', '-36px');

  // Display page
  displayPage();

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

  sectionPositions = [
    $('#about').offset().top,
    $('#music').offset().top,
    $('#photo').offset().top,
    $('#code').offset().top
  ];

  sectionNames = [
    'about',
    'music',
    'photo',
    'code'
  ];

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

  var MAX_ACCELERATION = 25;
  var SCROLL_EASE = .1;
  var WHEEL_STEP = 250;

  var animatingScroll = false;
  var scrollInterval;
  var currentScroll;

  var scrollDest;
  var speed = 0;

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

  var scrollToSection = false;

  function scrollHandler(event) {
    if (!scrollToSection) {
        currentSection = getCurrentSection();
        //History.replaceState(null, null, '/' + sectionNames[currentSection]);
    }
  }

  // Don't mess with the mousewheel on Macs due to the notorious (and
  // unresolvable) touchpad vs oldschool-clicky-mousewheel issue
  $(document).mousewheel(function(event, delta, deltaX, deltaY) {
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
  });

  $(document).keydown(keyDownHandler);
  $(document).scroll(scrollHandler);

  // Install parallax
  $.stellar({
    // Fallback to 'position' for IE8
    positionProperty: hasTransform() ? 'transform' : 'position',
    horizontalScrolling: false,
    parallaxBackgrounds: false
  });

  // Install main menu callbacks
  $('#menu-about').click(function(e) {
    e.preventDefault();
    var i = 0;
    scrollToSection = true;
    scrollTo(sectionPositions[i]);
    //History.replaceState(null, null, '/' + sectionNames[i]);
  });

  $('#menu-music').click(function(e) {
    e.preventDefault();
    var i = 1;
    scrollToSection = true;
    scrollTo(sectionPositions[i]);
    //History.replaceState(null, null, '/' + sectionNames[i]);
  });

  $('#menu-photo').click(function(e) {
    e.preventDefault();
    var i = 2;
    scrollToSection = true;
    scrollTo(sectionPositions[i]);
    //History.replaceState(null, null, '/' + sectionNames[i]);
  });

  $('#menu-code').click(function(e) {
    e.preventDefault();
    var i = 3;
    scrollToSection = true;
    scrollTo(sectionPositions[i]);
    //History.replaceState(null, null, '/' + sectionNames[i]);
  });

});


HEIGHT_OFFSET = 130;
CAPTION_HEIGHT = 65;

$(function() {
  $('#fotorama a').remove();
  var captions = $('#fotorama h2').remove();

  var navHtml =
        '<ul class="counter">'
      + '<li id="prev"><span>prev</span></li>'
      + '<li id="imgcounter"></li>'
      + '<li id="next"><span>next</span></li>'
      + '<li id="fullscreen"></div>'
      + '</ul>';

  $(navHtml).appendTo($('#nav'));

  var fotorama = $('#fotorama');

  fotorama.fotorama({
    width: '100%',
    height: '100%',
    nav: 'none',
    captions: true,
    transition: 'crossfade',
    transitionDuration: 400,
    allowfullscreen: 'native',
    arrows: false,
    hash: true,
    keyboard: true
  });

  var fotoramaApi = fotorama.data('fotorama');

  $('#prev').click(function() {
    fotoramaApi.show('<');
  });
  $('#next').click(function() {
    fotoramaApi.show('>');
  });
  $('#fullscreen').click(function() {
    fotoramaApi.requestFullScreen();
  });

  var updateNav = function(e, fotorama) {
    var curr = fotoramaApi.activeIndex + 1;
    if (curr < 10) curr = '0' + curr;
    $('#imgcounter').text(curr + ' / ' + fotoramaApi.size);
    $('#caption').text(fotoramaApi.activeFrame.caption);
  };

  fotorama.on('fotorama:show', updateNav);
  fotorama.on('fotorama:load', updateNav);
});

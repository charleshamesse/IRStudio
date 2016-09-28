// Nav resizable feature
let resizeNav = function() {
    $('#nav').resizable({ maxWidth: Math.floor($('.container-fluid').innerWidth()/2), handles: 'e'});
    $('#main').css('width', Math.floor($('.container-fluid').innerWidth() - $( "#nav" ).innerWidth() - $( "#settings" ).innerWidth()));
}
$(function() {

    $('#nav').resizable({ maxWidth: Math.floor($('.container-fluid').innerWidth()/2), handles: 'e'});

    $(window).resize(function() {
        resizeNav();
    });
});


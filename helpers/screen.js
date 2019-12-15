export function fullScreen() {
    let content = document.getElementsByTagName("body")[0];
    let fullscreen = false;
    if (!document.fullscreenElement &&    // alternative standard method
        !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {  // current working methods

        fullscreen = true;
        if (content.requestFullscreen) {
            content.requestFullscreen();
        } else if (content.msRequestFullscreen) {
            content.msRequestFullscreen();
        } else if (content.mozRequestFullScreen) {
            content.mozRequestFullScreen();
        } else if (content.webkitRequestFullscreen) {
            content.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    } else {
        fullscreen = false;
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
    return fullscreen;
}
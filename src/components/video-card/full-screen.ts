import utils from "@/utils/utils";

class FullScreen {
    container: Document;
    lastScrollPosition: { left: number; top: number; };
    constructor(container: Document) {
        this.container = container;
        this.lastScrollPosition = { left: 0, top: 0 };
    }

    isFullScreen(type = 'browser') {
        switch (type) {
            case 'browser':
                return document.fullscreenElement;
            case 'web':
                return this.container.classList.contains('dplayer-fulled');
        }
    }

    request(type = 'browser') {
        const anotherType = type === 'browser' ? 'web' : 'browser';
        const anotherTypeOn = this.isFullScreen(anotherType);
        if (!anotherTypeOn) {
            this.lastScrollPosition = utils.getScrollPosition();
        }

        switch (type) {
            case 'browser':
                if (this.container.requestFullscreen) {
                    this.container.requestFullscreen();
                } else if (this.container.mozRequestFullScreen) {
                    this.container.mozRequestFullScreen();
                } else if (this.container.webkitRequestFullscreen) {
                    this.container.webkitRequestFullscreen();
                } else if (this.container.msRequestFullscreen) {
                    this.container.msRequestFullscreen();
                }
                break;
            case 'web':
                this.container.classList.add('dplayer-fulled');
                document.body.classList.add('dplayer-web-fullscreen-fix');
                break;
        }

        if (anotherTypeOn) {
            this.cancel(anotherType);
        }

    }

    cancel(type = 'browser') {
        switch (type) {
            case 'browser':
                if (document.cancelFullScreen) {
                    document.cancelFullScreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                } else if (document.webkitCancelFullscreen) {
                    document.webkitCancelFullscreen();
                } else if (document.msCancelFullScreen) {
                    document.msCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
                break;
            case 'web':
                this.container.classList.remove('dplayer-fulled');
                document.body.classList.remove('dplayer-web-fullscreen-fix');
                break;
        }
    }

    toggle(type = 'browser') {
        if (this.isFullScreen(type)) {
            this.cancel(type);
        } else {
            this.request(type);
        }
    }

    destroy() {

    }
}

export default FullScreen;

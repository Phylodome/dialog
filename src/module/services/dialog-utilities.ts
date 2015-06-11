
module tri.dialog {

    'use strict';

    var docBody = document.body;
    var docElem = document.documentElement;

    /* tslint:disable:triple-equals */
    var viewportStyle = {
        isW3C: (typeof window.innerWidth != 'undefined'),
        isIE: (typeof docElem != 'undefined' && typeof docElem.clientWidth != 'undefined' && docElem.clientWidth != 0)
    };
    /* tslint:enable:triple-equals */

    class DialogUtilities implements ITriDialogUtilitiesService {

        getViewportSize(): ITriElementSize {
            if (viewportStyle.isW3C) {
                return {
                    width: window.innerWidth,
                    height: window.innerHeight
                };
            }
            if (viewportStyle.isIE) {
                return {
                    width: docElem.clientWidth,
                    height: docElem.clientHeight
                };
            }
            return {
                width: docBody.clientWidth,
                height: docBody.clientHeight
            };
        }

        getTopScroll(): number {
            return docBody.scrollTop || docElem.scrollTop;
        }

        getTopOffset(topOffset?: any): string {
            var _vh = this.getViewportSize().height;
            var _ts = this.getTopScroll();
            var _parsed = parseInt(topOffset, 10);

            /* tslint:disable:triple-equals */
            if (topOffset == null) {
                /* tslint:enable:triple-equals */
                return _ts + _vh / 5 + 'px';
            } else if (!isNaN(_parsed)) {
                if (angular.isString(topOffset) && topOffset.charAt(topOffset.length - 1) === '%') {
                    return _ts + _vh * _parsed / 100 + 'px';
                }
                return _ts + _parsed + 'px';
            }
            return _ts + 'px';

        }

    }

    mod.service('triDialogUtilities', DialogUtilities);

}
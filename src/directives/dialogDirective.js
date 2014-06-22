'use strict';

var docBody = document.body;
var docElem = document.documentElement;

var getTopScroll = function () {
    return docBody.scrollTop || docElem.scrollTop;
};

var getViewportSize = (function (viewportStyle) {
    if (viewportStyle.isW3C) {
        return function () {
            return {
                width: window.innerWidth,
                height: window.innerHeight
            };
        };
    } else if (viewportStyle.isIE) {
        return function () {
            return {
                width: docElem.clientWidth,
                height: docElem.clientHeight
            };
        };
    }
    return function () {
        return {
            width: docBody.clientWidth,
            height: docBody.clientHeight
        };
    };
}({
    /* jshint -W041 */
    isW3C: (typeof window.innerWidth != 'undefined'),

    /* jshint -W041 */
    isIE: (typeof docElem != 'undefined' &&
        typeof docElem.clientWidth != 'undefined' &&
        docElem.clientWidth != 0)
}));

var getTopOffset = function (cfgTopOffset) {
    /* jshint -W041 */
    var parsed = cfgTopOffset != null ? parseInt(cfgTopOffset, 10) : 20;
    if (isNaN(parsed)) {
        return getTopScroll() + 'px';
    }
    return (getTopScroll() + getViewportSize().height * (parsed / 100)) + 'px';
};

mod.directive('dialog', [
    '$rootScope',
    '$timeout',
    'dialogManager',
    function ($rootScope, $timeout, dialogManager) {

        var link = function (scope, element, attrs) {

            var dialog = dialogManager.dialogs[attrs.dialog];

            scope.data = scope.data || {};
            angular.extend(scope.data, dialog.data);

            dialog.hasOwnProperty('dynamicParams') && angular.extend(scope, {
                params: dialog.dynamicParams
            });

            var dynamicCSS = {
                zIndex: dialogManager.cfg.baseZindex + (dialog.label + 1) * 2,
                top: getTopOffset(dialog.topOffset)
            };

            element
                .css(dynamicCSS)
                .addClass(dialogManager.cfg.dialogClass)
                .addClass(dialogManager.cfg.hideClass)
                .addClass(dialog.dialogClass);

            $timeout(function () {
                element
                    .removeClass(dialogManager.cfg.hideClass)
                    .addClass(dialogManager.cfg.showClass);
            }, 100);

            scope.closeClick = function () {
                $rootScope.$emit(dialog.namespace + '.dialog.close', dialog);
            };

            $rootScope.$on(dialog.namespace + '.dialog.close', function (e, closedDialog) {
                if (closedDialog.label == dialog.label) {
                    $timeout(function () {
                        element
                            .removeClass(dialogManager.cfg.showClass)
                            .addClass(dialogManager.cfg.hideClass)
                            .css({zIndex: -1});
                        $timeout(function () {
                            element.remove();
                        }, 600);
                    }, 0);
                }
            });

        };

        return {
            restrict: 'A',
            require: '?ngController',
            link: link,
            scope: true
        };
    }
]);
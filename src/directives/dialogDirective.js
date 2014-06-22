'use strict';
mod.directive('dialog', [
    '$rootScope',
    '$timeout',
    'dialogManager',
    function ($rootScope, $timeout, dialogManager) {

        var docBody = document.body;

        var docElem = document.documentElement;

        var viewportStyle = {
            /* jshint -W041 */
            isW3C: (typeof window.innerWidth != 'undefined'),

            isIE: (typeof docElem != 'undefined' &&
                typeof docElem.clientWidth != 'undefined' &&
                docElem.clientWidth != 0)
        };

        var getTopScroll = function () {
            return docBody.scrollTop || docElem.scrollTop;
        };

        var getViewportSize = function () {

            var ohIsIt = [viewportStyle.isW3C, viewportStyle.isIE, true];

            var yesItIS = [
                {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                {
                    width: docElem.clientWidth,
                    height: docElem.clientHeight
                },
                {
                    width: docBody.clientWidth,
                    height: docBody.clientHeight
                }
            ];

            return yesItIS[ohIsIt.indexOf(true)];
        };

        var getTopOffset = function (cfgTopOffset) {
            var parsed = cfgTopOffset != null ? parseInt(cfgTopOffset, 10) : 20;
            return {
                'true': (getTopScroll() + getViewportSize().height * (parsed / 100)) + 'px', // null, undefined, number..
                'false': getTopScroll() + 'px' // false, true, string, array, object...
            }[!isNaN(parsed)];
        };


        var link = function (scope, element, attrs, ctrl) {

            var dialog = dialogManager.dialogs[attrs.dialog];

            if (ctrl != null) {
                ctrl.data = ctrl.data || {};
                angular.extend(ctrl.data, dialog.data);
            } else {
                scope.data = scope.data || {};
                angular.extend(scope.data, dialog.data);
            }

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
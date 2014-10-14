'use strict';
mod.directive('triDialogMask', [
    '$animate',
    'triDialogConfig',
    'triDialogManager',
    function ($animate, dialogConfig, dialogManager) {

        var postLink = function (scope, element, attrs, rootCtrl, $transclude) {
            var root = element.parent();
            var previousElement = null;
            var currentElement = null;

            var updateZIndex = function (mask) {
                mask.css('z-index', dialogConfig.baseZindex + dialogManager.dialogs.length * 2 - 1);
            };

            var update = function () {
                if (dialogManager.hasAny(rootCtrl.namespace)) {
                    if (currentElement) {
                        updateZIndex(currentElement);
                    } else {
                        currentElement = $transclude(function (clone) {
                            $animate.enter(clone, root);
                            updateZIndex(clone);
                            if (previousElement) {
                                previousElement.remove();
                                previousElement = null;
                            }
                        });
                    }
                } else if (currentElement) {
                    $animate.leave(currentElement, function () {
                        previousElement = null;
                    });
                    previousElement = currentElement;
                    currentElement = null;
                }
            };

            scope.$on(rootCtrl.namespace + '.dialog.open', update);
            scope.$on(rootCtrl.namespace + '.dialog.closing', update);

            $animate.leave(currentElement);
        };

        return {
            link: postLink,
            priority: 100,
            require: '^triDialogRoot',
            restrict: 'A',
            terminal: true,
            transclude: 'element'
        };
    }
]);

mod.directive('triDialogMask', [
    'triDialogManager',
    'triDialogConfig',
    function (dialogManager, dialogConfig) {
        var preLink = function (scope, element, attrs, rootCtrl) {
            element.addClass(rootCtrl.maskClass + ' ' + dialogConfig.maskClass);
        };

        var postLink = function (scope, element, attrs, rootCtrl) {
            element.on('click', function () {
                var upperDialog = dialogManager.getUpperDialog();
                if (upperDialog && !upperDialog.modal) {
                    rootCtrl.broadcast('close', upperDialog);
                    scope.$digest();
                }
            });
        };

        return {
            link: {
                pre: preLink,
                post: postLink
            },
            priority: -100,
            require: '^triDialogRoot',
            restrict: 'A'
        };
    }
]);



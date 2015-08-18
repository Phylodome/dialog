
module tri.dialog {

    'use strict';

    mod.directive('triDialogMask', [
        '$animate',
        'triDialogConfig',
        'triDialogManager',
        function (
            $animate: ng.IAnimateService,
            dialogConfig: ITriDialogBaseConfig,
            dialogManager: ITriDialogManagerService
        ) {

            var postLink = function (scope, element, attrs, rootCtrl, $transclude) {

                var root: ng.IAugmentedJQuery = element.parent();
                var previousElement: ng.IAugmentedJQuery = null;
                var currentElement: ng.IAugmentedJQuery = null;

                var updateZIndex = function (mask) {
                    mask.css('z-index', dialogConfig.baseZindex + dialogManager.dialogs.length * 2 - 1);
                };

                var update = function () {
                    if (dialogManager.hasAny(rootCtrl.namespace)) {
                        if (currentElement) {
                            updateZIndex(currentElement);
                        } else {
                            currentElement = $transclude((clone) => {
                                $animate.enter(clone, root, element);
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

                scope.$on(rootCtrl.namespace + dialogConfig.eventCore + dialogConfig.eventOpen, update);
                scope.$on(rootCtrl.namespace + dialogConfig.eventCore + dialogConfig.eventClosing, update);

            };

            return {
                link: postLink,
                priority: 100,
                require: '^triDialogRoot',
                restrict: 'EA',
                terminal: true,
                transclude: 'element'
            };
        }
    ]);

    mod.directive('triDialogMask', [
        'triDialogManager',
        'triDialogConfig',
        function (dialogManager: ITriDialogManagerService, dialogConfig: ITriDialogBaseConfig) {
            var preLink = function (scope, element, attrs, rootCtrl) {
                element.addClass(rootCtrl.maskClass + ' ' + dialogConfig.maskClass);
            };

            var postLink = function (scope, element, attrs, rootCtrl) {
                element.on('click', function () {
                    var upperDialog = dialogManager.getUpperDialog();
                    if (upperDialog && !upperDialog.modal) {
                        rootCtrl.broadcast(dialogConfig.eventClose, {
                            accepted: false,
                            dialog: upperDialog.notify(noty.ClosingMask),
                            reason: 'maskClick'
                        });
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
                restrict: 'EA'
            };
        }
    ]);

}



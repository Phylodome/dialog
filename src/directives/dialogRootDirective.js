'use strict';

mod.directive('dialogRoot', [
    '$compile',
    '$rootScope',
    '$document',
    '$animate',
    'dialogConfig',
    'dialogManager',
    'dialogUtilities',
    function ($compile, $rootScope, $document, $animate, dialogConfig, dialogManager, dialogUtilities) {

        var compile = function (tElement, tAttrs) {
            var tMask = angular.element('<div />');
            var namespaceForEvents = tAttrs.dialogRoot || dialogConfig.mainNamespace;

            tElement.append(tMask);

            tMask.addClass(
                dialogUtilities.extendClass(tAttrs.dialogRoot, dialogConfig.maskClass)
            );

            tMask.bind('click', function () {
                var upperDialog = dialogManager.getUpperDialog();
                if (!upperDialog.modal) {
                    $rootScope.$emit(dialogUtilities.eventLabel(namespaceForEvents, 'close'), upperDialog);
                    $rootScope.$digest();
                }
            });

            return function (scope, element, attrs) {

                var rootClass = dialogUtilities.extendClass(attrs.dialogRoot, dialogConfig.rootClass);

                var openDialog = function (e, dialog) {
                    element.addClass(rootClass);

                    $animate.enter(
                        $compile(dialogUtilities.getElem(dialog))(scope),
                        element,
                        tMask
                    );

                    (!$rootScope.$$phase) && $rootScope.$digest(); // because user can trigger dialog inside $apply

                    dialogUtilities.updateMask(tMask, namespaceForEvents);
                };

                var closeDialog = function (e, dialog) {
                    dialogManager.unRegisterDialog(dialog.label);
                    !dialogManager.hasAny(namespaceForEvents) && element.removeClass(rootClass);

                    dialogUtilities.updateMask(tMask, namespaceForEvents);
                };

                $rootScope.$on(dialogUtilities.eventLabel(namespaceForEvents, 'open'), openDialog);
                $rootScope.$on(dialogUtilities.eventLabel(namespaceForEvents, 'close'), closeDialog);
            };
        };

        return {
            restrict: 'A',
            compile: compile
        };
    }
]);

mod.directive('body', [
    '$rootScope',
    '$document',
    'dialogConfig',
    'dialogManager',
    function ($root, $document, dialogConfig, dialogManager) {
        var link = function postLink() {
            $document.on('keydown keypress', function (event) {
                var upperDialog = dialogManager.getUpperDialog();
                if (event.which === 27 && upperDialog) {
                    $root.$emit(
                        (upperDialog.namespace || dialogConfig.mainNamespace) + '.dialog.close',
                        upperDialog
                    );
                    $root.$digest();
                }
            });
        };
        return {
            restrict: 'E',
            link: link
        };
    }
]);
'use strict';

mod.directive('triDialog', [
    '$http',
    '$animate',
    '$compile',
    '$controller',
    '$templateCache',
    'triDialogManager',
    'triDialogConfig',
    'triDialogUtilities',
    function ($http, $animate, $compile, $controller, $templateCache, dialogManager, dialogConfig, dialogUtilities) {

        var postLink = function (scope, element, attrs, dialogRootCtrl) {

            var dialog = dialogManager.dialogs[attrs.triDialog];

            var locals = {
                $dialog: dialog,
                $data: dialog.data,
                $scope: scope
            };

            var dialogCtrl;

            var init = function (element) {
                var innerLink = $compile(element.contents());
                if (dialogCtrl) {
                    element.data('$triDialogController', dialogCtrl);
                    element.children().data('$triDialogController', dialogCtrl);
                }
                innerLink(scope);
            };

            if (dialog.controller) { // TODO: instantiate just before transclude inclusion
                dialogCtrl = $controller(dialog.controller, locals);
                if (dialog.controllerAs) {
                    scope[dialog.controllerAs] = dialogCtrl;
                }
            }

            $http
                .get(dialog.templateUrl, {
                    cache: $templateCache
                })
                .success(function (response) {
                    element.html(response);
                    init(element);
                    scope.$emit(dialogConfig.eventPrefix + dialogConfig.eventTemplate + dialogConfig.eventLoaded);
                })
                .error(function () {
                    // TODO... Finking what to do here :/
                    scope.$emit(dialogConfig.eventPrefix + dialogConfig.eventTemplate + dialogConfig.eventError);
                });

            scope.$emit(dialogConfig.eventPrefix + dialogConfig.eventTemplate + dialogConfig.eventRequested);

            // TODO: move to dialog entity
            //
            scope.closeClick = function () {
                dialogRootCtrl.broadcast(dialogConfig.eventClose, dialog);
            };
            //
            // end TODO


            scope.$on(dialog.namespace + dialogConfig.eventCore + dialogConfig.eventClose, function (e, closedDialog) {
                if (closedDialog.label == dialog.label) {
                    $animate.leave(element, function () {
                        scope.$destroy();
                        dialog.destroy();
                        element = dialog = null;
                    });
                    dialogManager.unRegisterDialog(dialog.label);
                    dialogRootCtrl.broadcast(dialogConfig.eventClosing, closedDialog);
                }
            });
        };

        var compile = function (tElement, tAttrs) {
            var dialog = dialogManager.dialogs[tAttrs.triDialog];
            tElement
                .addClass(dialogConfig.dialogClass + ' ' + dialog.dialogClass)
                .css({ // TODO do that during transclude inclusion
                    zIndex: dialogConfig.baseZindex + (dialog.label + 1) * 2,
                    top: dialogUtilities.getTopOffset(dialog.topOffset)
                });
            return postLink;
        };

        return {
            compile: compile,
            require: '^triDialogRoot',
            restrict: 'A',
            scope: true
        };
    }
]);
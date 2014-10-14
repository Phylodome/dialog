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
                $data: dialog.data,
                $scope: scope
            };

            var init = function (innerLink, element, dialog) {
                var dialogCtrl;
                if (dialog.controller) {
                    // TODO: move it out of here to catch template requested event
                    dialogCtrl = $controller(dialog.controller, locals);
                    element.data('$triDialogController', dialogCtrl);
                    element.children().data('$triDialogController', dialogCtrl);
                    if (dialog.controllerAs) {
                        scope[dialog.controllerAs] = dialogCtrl;
                    }
                }
                innerLink(scope);
            };

            $http
                .get(dialog.templateUrl, {
                    cache: $templateCache
                })
                .success(function (response) {
                    element.html(response);
                    init($compile(element.contents()), element, dialog);
                    scope.$emit(dialogConfig.eventPrefix + dialogConfig.eventTemplate + dialogConfig.eventLoaded);
                })
                .error(function () {
                    // TODO... Finking what to do here :/
                    scope.$emit(dialogConfig.eventPrefix + dialogConfig.eventTemplate + dialogConfig.eventError);
                });

            scope.$emit(dialogConfig.eventPrefix + dialogConfig.eventTemplate + dialogConfig.eventRequested);

            scope.closeClick = function () {
                dialogRootCtrl.broadcast(dialogConfig.eventClose, dialog);
            };

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
                .css({
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
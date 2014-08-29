'use strict';

mod.directive('dialog', [
    '$rootScope',
    '$http',
    '$animate',
    '$compile',
    '$controller',
    '$templateCache',
    'dialogManager',
    'dialogConfig',
    'dialogUtilities',
    function ($root, $http, $animate, $compile, $controller, $templateCache, dialogManager, dialogConfig, dialogUtilities) {

        var preLink = function () {};

        var postLink = function (scope, element, attrs) {

            var dialog = dialogManager.dialogs[attrs.dialog];

            var locals = {
                $data: dialog.data,
                $scope: scope
            };

            var init = function (innerLink) {
                var dialogCtrl;
                if (dialog.controller) {
                    dialogCtrl = $controller(dialog.controller, locals);
                    element.data('$ngControllerController', dialogCtrl);
                    element.children().data('$ngControllerController', dialogCtrl);
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
                    init($compile(element.contents()));
                    scope.$emit('$triNgDialogTemplateLoaded');
                })
                .error(function () {
                    // TODO... Finking what to do here :/
                    scope.$emit('$triNgDialogTemplateError');
                });

            scope.$emit('$triNgDialogTemplateRequested');

            scope.closeClick = function () {
                $root.$emit(dialog.namespace + '.dialog.close', dialog);
            };

            $root.$on(dialog.namespace + '.dialog.close', function (e, closedDialog) {
                if (closedDialog.label == dialog.label) {
                    $animate.leave(element, function () {
                        scope.$destroy();
                    });
                    dialogManager.unRegisterDialog(dialog.label);
                    $root.$emit(dialog.namespace + '.dialog.closing', closedDialog);
                }
            });
        };

        var compile = function (tElement, tAttrs) {
            var dialog = dialogManager.dialogs[tAttrs.dialog];
            tElement
                .addClass(dialogConfig.dialogClass + ' ' + dialog.dialogClass)
                .css({
                    zIndex: dialogConfig.baseZindex + (dialog.label + 1) * 2,
                    top: dialogUtilities.getTopOffset(dialog.topOffset)
                });
            return {
                pre: preLink,
                post: postLink
            };
        };

        return {
            compile: compile,
            require: '^dialogRoot',
            restrict: 'A',
            scope: true
        };
    }
]);
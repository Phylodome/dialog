'use strict';

mod.directive('dialog', [
    '$rootScope',
    '$http',
    '$animate',
    '$compile',
    '$controller',
    '$templateCache',
    'dialogManager',
    function ($root, $http, $animate, $compile, $controller, $templateCache, dialogManager) {

        var link = function (scope, element, attrs) {

            var dialog = dialogManager.dialogs[attrs.dialog];
            var locals = {
                $data: dialog.data,
                $scope: scope
            };

            var init = function (innerLink) {
                if (dialog.controller) {
                    scope.dialogCtrl = $controller(dialog.controller, locals);
                    element.data('$ngControllerController', scope.dialogCtrl);
                    element.children().data('$ngControllerController', scope.dialogCtrl);
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
                    scope.$destroy();
                    $animate.leave(element);
                }
            });
        };

        return {
            restrict: 'A',
            link: link,
            scope: true
        };
    }
]);
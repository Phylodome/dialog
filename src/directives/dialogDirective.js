'use strict';

mod.directive('dialog', [
    '$rootScope',
    '$http',
    '$animate',
    '$compile',
    '$templateCache',
    'dialogManager',
    function ($root, $http, $animate, $compile, $templateCache, dialogManager) {

        var link = function (scope, element, attrs) {

            var dialog = dialogManager.dialogs[attrs.dialog];

            /*
             * LEGACY
             */
            scope.data = scope.data || {};
            angular.extend(scope.data, dialog.data);
            dialog.hasOwnProperty('dynamicParams') && angular.extend(scope, {
                params: dialog.dynamicParams
            });
            /*
             * END LEGACY
             */

            angular.isObject(dialog.scope) && angular.extend(scope, dialog.scope);

            $http
                .get(dialog.templateUrl, {
                    cache: $templateCache
                })
                .success(function (response) {
                    element.html(response);
                    $compile(element.contents())(scope);
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
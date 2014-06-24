'use strict';

mod.directive('dialog', [
    '$rootScope',
    '$animate',
    'dialogManager',
    function ($root, $animate, dialogManager) {

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
            require: '?ngController',
            link: link,
            scope: true
        };
    }
]);
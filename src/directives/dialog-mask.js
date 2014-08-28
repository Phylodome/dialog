'use strict';

mod.directive('triDialogMask', [
    '$animate',
    '$rootScope',
    'dialogConfig',
    'dialogManager',
    'dialogUtilities',
    function ($animate, $rootScope, dialogConfig, dialogManager, dialogUtilities) {

        var controller = function ($scope, $element, dialogConfig, dialogManager) {
            return angular.extend(this, {

                visible: false,
                parent: null,

                update: function () {
                    if (dialogManager.hasAny(this.namespace)) {
                        $element.css('z-index', dialogConfig.baseZindex + dialogManager.dialogs.length * 2 - 1);

                        if (!this.visible) {
                            this.visible = true;
                            $animate.enter(
                                $element,
                                this.parent,
                                this.holder
                            );
                        }
                    } else if (this.visible) {
                        this.visible = false;
                        $animate.leave($element);
                    }
                }
            });
        };

        var preLink = function (scope, element, attrs, ctrl) {
            var rootCtrl = ctrl[0];
            var maskCtrl = ctrl[1];
            maskCtrl.holder = rootCtrl.holder;
            maskCtrl.namespace = rootCtrl.namespace;
            maskCtrl.parent = element.parent();
            element.addClass(rootCtrl.maskClass + ' ' + dialogConfig.maskClass);
        };

        var postLink = function (scope, element, attrs, ctrl) {
            var maskCtrl = ctrl[1];

            $rootScope.$on(dialogUtilities.eventLabel(maskCtrl.namespace, 'open'), function () {
                maskCtrl.update();
            });

            $rootScope.$on(dialogUtilities.eventLabel(maskCtrl.namespace, 'closing'), function () {
                maskCtrl.update();
            });

            element.on('click', function () {
                var upperDialog = dialogManager.getUpperDialog();
                if (upperDialog && !upperDialog.modal) {
                    $rootScope.$emit(dialogUtilities.eventLabel(maskCtrl.namespace, 'close'), upperDialog);
                    $rootScope.$digest();
                }
            });

            element.remove();
        };

        return {
            controller: ['$scope', '$element', 'dialogConfig', 'dialogManager', controller],
            link: {
                pre: preLink,
                post: postLink
            },
            require: ['^dialogRoot', 'triDialogMask'],
            restrict: 'A'
        };
    }
]);



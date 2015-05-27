'use strict';

mod.directive('triDialogRoot', [
    '$rootScope',
    '$document',
    'triDialogConfig',
    'triDialogManager',
    function ($rootScope, $document, dialogConfig, dialogManager) {


        // TODO: add some namespaces here and move it somewhere
        //
        $document.on('keydown keypress', function (event) {
            // kind'a imperative, but we do not know if ng-app/$rootElement is on body/html or not
            var upperDialog;
            if (event.which === 27 && dialogManager.dialogs.length) {
                upperDialog = dialogManager.getUpperDialog();
                if (!upperDialog.blockedDialog) {
                    $rootScope.$broadcast(
                        upperDialog.namespace + dialogConfig.eventCore + dialogConfig.eventClose,
                        upperDialog
                    );
                    $rootScope.$digest();
                }
            }
        });
        //
        //

        var controller = function ($scope, $attrs, dialogConfig, dialogManager) {
            this.namespace = $attrs.triDialogRoot || dialogConfig.mainNamespace;
            dialogManager.registerRoot(this);
            $scope.$on('$destroy', angular.bind(this, function () {
                //noinspection JSPotentiallyInvalidUsageOfThis
                dialogManager.unRegisterRoot(this);
            }));
            return angular.extend(this, {
                maskClass: this.namespace + '-' + dialogConfig.maskClass,
                rootClass: this.namespace + '-' + dialogConfig.rootClass,
                dialogs: {},

                broadcast: function (eType, eData) {
                    //noinspection JSPotentiallyInvalidUsageOfThis
                    $scope.$broadcast(this.namespace + dialogConfig.eventCore + eType, eData);
                },

                listen: function (eType, eFn) {
                    //noinspection JSPotentiallyInvalidUsageOfThis
                    $scope.$on(this.namespace + dialogConfig.eventCore + eType, eFn);
                }

            });
        };

        var postLink = function (scope, element, attrs, dialogRootCtrl) {
            dialogRootCtrl.listen(dialogConfig.eventOpen, function () {
                element.addClass(dialogRootCtrl.rootClass + ' ' + dialogConfig.rootClass);
            });

            dialogRootCtrl.listen(dialogConfig.eventClosing, function () {
                if (!dialogManager.hasAny(dialogRootCtrl.namespace)) {
                    element.removeClass(dialogRootCtrl.rootClass + ' ' + dialogConfig.rootClass);
                }
            });
        };

        var template = function (tElement) {
            tElement.append('<div tri:dialog-mask/><div tri:dialog/>');
        };

        return {
            controller: ['$scope', '$attrs', 'triDialogConfig', 'triDialogManager', controller],
            link: postLink,
            require: 'triDialogRoot',
            restrict: 'A',
            template: template
        };
    }
]);
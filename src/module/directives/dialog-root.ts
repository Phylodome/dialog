
module tri.dialog {

    'use strict';

    mod.run([
        '$rootScope',
        '$document',
        'triDialogConfig',
        'triDialogManager',
        function (
            $rootScope: ng.IRootScopeService,
            $document: ng.IDocumentService,
            dialogConfig: ITriDialogBaseConfig,
            dialogManager: ITriDialogManagerService
        ) {

            // TODO: add some namespaces
            $document.on('keydown keypress', function (event) {
                // kind'a imperative, but we do not know if ng-app/$rootElement is on body/html or not
                var upperDialog: ITriDialog;
                var notification: ITriDialogPromiseNotification;
                if (event.which === 27 && dialogManager.dialogs.length) {
                    upperDialog = dialogManager.getUpperDialog();
                    notification = {
                        accepted: false,
                        dialog: upperDialog,
                        status: 'closing',
                        reason: 'esc'
                    };
                    if (!upperDialog.blockedDialog) {
                        $rootScope.$broadcast(
                            upperDialog.namespace + dialogConfig.eventCore + dialogConfig.eventClose,
                            notification
                        );
                        $rootScope.$digest();
                    }
                }
            });

        }
    ]);


    mod.directive('triDialogRoot', [
        'triDialogConfig',
        'triDialogManager',
        function (dialogConfig: ITriDialogBaseConfig, dialogManager: ITriDialogManagerService) {

            var controller = function (
                $scope,
                $attrs,
                dialogConfig: ITriDialogBaseConfig,
                dialogManager: ITriDialogManagerService
            ) {
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

}
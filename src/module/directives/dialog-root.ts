
module tri.dialog {

    'use strict';

    mod.run([
        '$rootScope',
        '$document',
        'triDialogManager',
        function (
            $rootScope: ng.IRootScopeService,
            $document: ng.IDocumentService,
            dialogManager: ITriDialogManagerService
        ) {

            // TODO: add some namespaces
            $document.on('keydown keypress', function (event) {
                // kind'a imperative, but we do not know if ng-app/$rootElement is on body/html or not
                var upperDialog: ITriDialog;
                if (event.which === 27 && dialogManager.dialogs.length) {
                    upperDialog = dialogManager.getUpperDialog();
                    if (!upperDialog.blockedDialog && dialogManager.hasRoot(upperDialog.namespace)) {
                        dialogManager.getRoot(upperDialog.namespace).broadcast(conf.eventClose, {
                            accepted: false,
                            dialog: upperDialog.notify(noty.ClosingEsc),
                            reason: 'esc'
                        });
                        $rootScope.$digest();
                    }
                }
            });

        }
    ]);


    mod.directive('triDialogRoot', ['triDialogManager', (dialogManager: ITriDialogManagerService) => {

        var controller = function (
            $scope,
            $attrs,
            dialogManager: ITriDialogManagerService
        ) {
            this.namespace = $attrs.triDialogRoot || conf.mainNamespace;
            dialogManager.registerRoot(this);
            $scope.$on('$destroy', () => {
                dialogManager.unRegisterRoot(this);
            });
            angular.extend(this, {
                maskClass: this.namespace + '-' + conf.maskClass,
                rootClass: this.namespace + '-' + conf.rootClass,
                dialogs: {},

                broadcast(eType, eData) {
                    $scope.$broadcast(this.namespace + conf.eventCore + eType, eData);
                },

                listen(eType, eFn) {
                    $scope.$on(this.namespace + conf.eventCore + eType, eFn);
                }

            });
        };

        var postLink = (scope, element, attrs, dialogRootCtrl) => {
            dialogRootCtrl.listen(conf.eventOpen, () => {
                element.addClass(conf.rootClass + ' ' + conf.rootClass);
            });

            dialogRootCtrl.listen(conf.eventClosing, () => {
                if (!dialogManager.hasAny(dialogRootCtrl.namespace)) {
                    element.removeClass(dialogRootCtrl.rootClass + ' ' + conf.rootClass);
                }
            });
        };

        var template = (tElement) => {
            tElement.append('<div tri:dialog-mask/><div tri:dialog/>');
        };

        return {
            controller: ['$scope', '$attrs', 'triDialogManager', controller],
            link: postLink,
            require: 'triDialogRoot',
            restrict: 'A',
            template: template
        };
    }]);

}
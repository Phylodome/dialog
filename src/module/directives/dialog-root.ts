
module tri.dialog {

    'use strict';

    mod.run([
        '$rootScope',
        '$document',
        'triDialogManager',
        function (
            $rootScope: angular.IRootScopeService,
            $document: angular.IDocumentService,
            dialogManager: ITriDialogManagerService
        ) {

            // TODO: add some namespaces
            $document.on('keydown keypress', function (event: KeyboardEvent) {
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


    mod.directive('triDialogRoot', ['$animate', 'triDialogManager', (
        $animate: angular.IAnimateService,
        dialogManager: ITriDialogManagerService
    ) => {

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
            const rootClass = dialogRootCtrl.rootClass + ' ' + conf.rootClass;

            dialogRootCtrl.listen(conf.eventOpen, () => {
                $animate.addClass(element, rootClass);
            });

            dialogRootCtrl.listen(conf.eventClosing, () => {
                if (!dialogManager.hasAny(dialogRootCtrl.namespace)) {
                    $animate.removeClass(element, rootClass);
                }
            });
        };

        var template = (tElement) => {
            if (!tElement.find('tri-dialog')[0]) {
                tElement.append('<div tri-dialog-mask/><div tri-dialog/>');
            }
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
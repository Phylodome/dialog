
module tri.dialog {

    'use strict';

    triDialogManipulator.$inject = [
        '$animate', '$rootScope', '$controller', '$timeout',
        'triDialogManager', 'triDialogConfig', 'triDialogUtilities'
    ];
    function triDialogManipulator(
        $animate: ng.IAnimateService,
        $rootScope: ng.IRootScopeService,
        $controller: ng.IControllerService,
        $timeout: ng.ITimeoutService,
        dialogManager: ITriDialogManagerService,
        dialogConfig: ITriDialogBaseConfig,
        dialogUtilities: ITriDialogUtilitiesService
    ) {

        var postLink = (scope, element, attrs, dialogRootCtrl, $transcludeFn) => {

            dialogRootCtrl.listen(dialogConfig.eventOpen, function (e, dialog: ITriDialog) {

                var setController = (clone, dialogScope) => {
                    var dialogCtrl = $controller(dialog.controller, {
                        $dialog: dialog,
                        $data: dialog.data,
                        $scope: dialogScope
                    });
                    if (dialog.controllerAs) {
                        dialogScope[dialog.controllerAs] = dialogCtrl;
                    }
                    clone.data('$triDialogController', dialogCtrl);
                };

                var getCss = () => {
                    var css: ITriDialogStyle = {
                        zIndex: dialogConfig.baseZindex + (dialog.label + 1) * 2
                    };
                    /* tslint:disable:triple-equals */
                    if (dialogConfig.processTopOffset || dialog.topOffset != null) {
                        /* tslint:enable:triple-equals */
                        css.top = dialogUtilities.getTopOffset(dialog.topOffset);
                    }
                    return css;
                };

                $transcludeFn($rootScope.$new(), (clone, dialogScope) => {

                    if (dialog.controller) {
                        setController(clone, dialogScope);
                    } else {
                        dialogScope.$dialog = dialog;
                    }

                    clone
                        .data('$triDialog', dialog)
                        .css(getCss())
                        .addClass(dialogConfig.dialogClass + ' ' + dialog.dialogClass);

                    dialogRootCtrl.dialogs[dialog.label] = clone;

                    $timeout(() => {
                        dialog.notify(noty.Opening);
                    }, 1);

                    $animate.enter(clone, element.parent(), element, () => {
                        dialog.notify(noty.Open);
                    });
                });
            });

            dialogRootCtrl.listen(dialogConfig.eventClose, (e, notification: ITriDialogPromiseFinalisation) => {
                var closedDialog: ITriDialog = notification.dialog;
                var dialogElement = dialogRootCtrl.dialogs[closedDialog.label];
                var dialogElementScope;

                if (dialogElement && dialogElement.data('$triDialog') === closedDialog) {
                    dialogElementScope = dialogElement.scope();

                    $animate.leave(dialogElement, () => {
                        closedDialog.notify(noty.Closed);
                        dialogElementScope.$destroy();
                        dialogElement.removeData().children().removeData();
                        closedDialog.destroy(notification);
                        closedDialog = dialogElement = null;
                    });

                    delete dialogRootCtrl.dialogs[closedDialog.label];
                    dialogManager.unRegisterDialog(closedDialog.label);
                    dialogRootCtrl.broadcast(dialogConfig.eventClosing, closedDialog);
                }
            });
        };

        return {
            link: postLink,
            require: '^triDialogRoot',
            restrict: 'EA',
            scope: true,
            transclude: 'element',
            priority: 600
        };
    }

    triDialog.$inject = ['$http', '$compile', '$templateCache', 'triDialogConfig'];
    function triDialog(
        $http: ng.IHttpService,
        $compile: ng.ICompileService,
        $templateCache: ng.ITemplateCacheService,
        dialogConfig: ITriDialogBaseConfig
    ) {

        var postLink = (scope, element, attrs, dialogRootCtrl) => {

            const dialog: ITriDialog = element.data('$triDialog');
            const dialogCtrl = element.data('$triDialogController');

            function wrapperCloseClick(e: MouseEvent): void {
                if (!dialog.modal && e.target === element[0]) {
                    element.off('click', wrapperCloseClick);
                    dialogRootCtrl.broadcast(dialogConfig.eventClose, {
                        accepted: false,
                        dialog: dialog.notify(noty.ClosingMask),
                        reason: 'maskClick'
                    });
                    scope.$digest();
                }
            }

            // simulate that wrapper is a mask
            if (attrs.hasOwnProperty('triIsMask')) {
                element.on('click', wrapperCloseClick);
            }

            $http.get(dialog.templateUrl, {
                cache: $templateCache
            }).success((response: string) => {
                const contentElement: ng.IAugmentedJQuery = element.find('tri-dialog-content');
                let innerLink: ng.ITemplateLinkingFunction;

                if (contentElement[0]) {
                    contentElement.html(response);
                } else {
                    element.html(response);
                }

                innerLink = $compile(element.contents());

                if (dialogCtrl) {
                    element.children().data('$triDialogController', dialogCtrl);
                }

                innerLink(scope);
                dialog.notify(noty.TemplateLoaded);
                scope.$broadcast(dialogConfig.eventPrefix + dialogConfig.eventTemplate + dialogConfig.eventLoaded);
            }).error(() => {
                scope.$broadcast(dialogConfig.eventPrefix + dialogConfig.eventTemplate + dialogConfig.eventError);
                dialog.notify(noty.TemplateError);
                throw new Error('triDialog: could not load template!');
            });

            scope.$broadcast(dialogConfig.eventPrefix + dialogConfig.eventTemplate + dialogConfig.eventRequested);

        };

        return {
            link: postLink,
            require: '^triDialogRoot',
            restrict: 'EA'
        };
    }

    mod.directive('triDialog', triDialog);
    mod.directive('triDialog', triDialogManipulator);

}
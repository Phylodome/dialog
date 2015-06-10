
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
                    if (dialogConfig.processTopOffset || dialog.topOffset != null) {
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
                        dialog.notify('opening');
                    }, 1);

                    $animate.enter(clone, element.parent(), element, () => {
                        dialog.notify('open');
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
                        closedDialog.notify('closed');
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
            restrict: 'A',
            scope: true,
            transclude: 'element',
            priority: 600
        };
    }

    triDialog.$inject = ['$log', '$http', '$compile', '$templateCache', 'triDialogConfig'];
    function triDialog(
        $log: ng.ILogService,
        $http: ng.IHttpService,
        $compile: ng.ICompileService,
        $templateCache: ng.ITemplateCacheService,
        dialogConfig: ITriDialogBaseConfig
    ) {

        var postLink = (scope, element) => {

            var dialog: ITriDialog = element.data('$triDialog');
            var dialogCtrl = element.data('$triDialogController');

            $http.get(dialog.templateUrl, {
                cache: $templateCache
            }).success((response) => {
                var innerLink;
                element.html(response);
                innerLink = $compile(element.contents());
                if (dialogCtrl) {
                    element.children().data('$triDialogController', dialogCtrl);
                }
                innerLink(scope);
                dialog.notify('templateLoaded');
                scope.$broadcast(dialogConfig.eventPrefix + dialogConfig.eventTemplate + dialogConfig.eventLoaded);
            }).error(() => {
                scope.$broadcast(dialogConfig.eventPrefix + dialogConfig.eventTemplate + dialogConfig.eventError);
                dialog.notify('templateError');
                $log.error(new Error('triDialog: could not load template!'));
            });

            scope.$broadcast(dialogConfig.eventPrefix + dialogConfig.eventTemplate + dialogConfig.eventRequested);

        };

        return {
            link: postLink,
            require: '^triDialogRoot',
            restrict: 'A'
        };
    }

    mod.directive('triDialog', triDialog);
    mod.directive('triDialog', triDialogManipulator);

}
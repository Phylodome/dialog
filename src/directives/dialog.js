'use strict';


function triDialogManipulator($animate, $rootScope, $controller, dialogManager, dialogConfig, dialogUtilities) {

    var postLink = function (scope, element, attrs, dialogRootCtrl, $transcludeFn) {

        dialogRootCtrl.listen(dialogConfig.eventOpen, function (e, dialog) {
            var dialogScope = $rootScope.$new(); // isolated from other contexts
            var dialogCtrl;
            var locals = {
                $dialog: dialog,
                $data: dialog.data,
                $scope: dialogScope
            };

            if (dialog.controller) {
                dialogCtrl = $controller(dialog.controller, locals);
                if (dialog.controllerAs) {
                    dialogScope[dialog.controllerAs] = dialogCtrl;
                }
            } else {
                dialogScope.$dialog = dialog;
            }

            $transcludeFn(dialogScope, function (clone) {
                if (dialogCtrl) {
                    clone.data('$triDialogController', dialogCtrl);
                }

                clone
                    .data('$triDialog', dialog)
                    .css({
                        zIndex: dialogConfig.baseZindex + (dialog.label + 1) * 2,
                        top: dialogUtilities.getTopOffset(dialog.topOffset)
                    })
                    .addClass(dialogConfig.dialogClass + ' ' + dialog.dialogClass);

                dialogRootCtrl.dialogs[dialog.label] = clone;
                $animate.enter(clone, element.parent(), element);
            });
        });

        dialogRootCtrl.listen(dialogConfig.eventClose, function (e, closedDialog) {
            var dialogElement = dialogRootCtrl.dialogs[closedDialog.label];
            var dialogElementScope;

            if (dialogElement && dialogElement.data('$triDialog') === closedDialog) {
                dialogElementScope = dialogElement.scope();

                $animate.leave(dialogElement, function () {
                    dialogElementScope.$destroy();
                    dialogElement.removeData().children().removeData();
                    closedDialog.destroy();
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

function triDialog($log, $http, $compile, $templateCache, dialogConfig) {

    var postLink = function (scope, element) {
        var dialog = element.data('$triDialog');
        var dialogCtrl = element.data('$triDialogController');

        $http
            .get(dialog.templateUrl, {
                cache: $templateCache
            })
            .success(function (response) {
                var innerLink;

                element.html(response);
                innerLink = $compile(element.contents());

                if (dialogCtrl) {
                    element.children().data('$triDialogController', dialogCtrl);
                }

                innerLink(scope);
                scope.$broadcast(dialogConfig.eventPrefix + dialogConfig.eventTemplate + dialogConfig.eventLoaded);
            })
            .error(function () {
                scope.$broadcast(dialogConfig.eventPrefix + dialogConfig.eventTemplate + dialogConfig.eventError);
                $log.error(new Error('triDialog: could not load template!'));
            });

        scope.$broadcast(dialogConfig.eventPrefix + dialogConfig.eventTemplate + dialogConfig.eventRequested);

    };

    return {
        link: postLink,
        require: '^triDialogRoot',
        restrict: 'A',
        scope: true
    };
}

mod.directive('triDialog', ['$log', '$http', '$compile', '$templateCache', 'triDialogConfig', triDialog]);
mod.directive('triDialog', ['$animate', '$rootScope', '$controller', 'triDialogManager', 'triDialogConfig', 'triDialogUtilities', triDialogManipulator]);
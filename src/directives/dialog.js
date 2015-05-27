'use strict';


function triDialogManipulator($animate, $rootScope, $controller, dialogManager, dialogConfig, dialogUtilities) {

    var postLink = function (scope, element, attrs, dialogRootCtrl, $transcludeFn) {

        dialogRootCtrl.listen(dialogConfig.eventOpen, function (e, dialog) {

            var setController = function (clone, dialogScope) {
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

            var getCss = function () {
                var css = {
                    zIndex: dialogConfig.baseZindex + (dialog.label + 1) * 2
                };
                /* jshint -W041 */
                if (dialogConfig.processTopOffset || dialog.topOffset != null) {
                    css.top = dialogUtilities.getTopOffset(dialog.topOffset);
                }
                return css;
            };

            $transcludeFn($rootScope.$new(), function (clone, dialogScope) {

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
        restrict: 'A'
    };
}

mod.directive('triDialog', ['$log', '$http', '$compile', '$templateCache', 'triDialogConfig', triDialog]);
mod.directive('triDialog', ['$animate', '$rootScope', '$controller', 'triDialogManager', 'triDialogConfig', 'triDialogUtilities', triDialogManipulator]);
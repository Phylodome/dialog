'use strict';

mod.directive('triDialogRoot', [
    '$compile',
    '$rootScope',
    '$document',
    '$animate',
    'triDialogConfig',
    'triDialogManager',
    function ($compile, $rootScope, $document, $animate, dialogConfig, dialogManager) {

        $document.on('keydown keypress', function (event) {
            // kind'a imperative, but we do not know if ng-app/$rootElement is on body/html or not
            var upperDialog;
            if (event.which === 27 && dialogManager.dialogs.length) {
                upperDialog = dialogManager.getUpperDialog();
                $rootScope.$broadcast(
                    upperDialog.namespace + dialogConfig.eventCore + dialogConfig.eventClose,
                    upperDialog
                );
                $rootScope.$digest();
            }
        });

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
            dialogRootCtrl.listen(dialogConfig.eventOpen, function (e, dialog) {
                var dialogElement = angular.element('<section tri:dialog="' + dialog.label + '"></section>');
                $animate.enter(dialogElement, element.addClass(dialogRootCtrl.rootClass));
                $compile(dialogElement)(scope);
                (!scope.$$phase) && scope.$digest(); // because user can trigger dialog inside $apply
            });
            dialogRootCtrl.listen(dialogConfig.eventClosing, function () {
                !dialogManager.hasAny(dialogRootCtrl.namespace) && element.removeClass(dialogRootCtrl.rootClass);
            });
        };

        var template = function (tElement) {
            tElement.append('<div tri:dialog-mask></div>');
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
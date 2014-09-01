'use strict';

mod.directive('dialogRoot', [
    '$compile',
    '$rootScope',
    '$document',
    '$animate',
    'dialogConfig',
    'dialogManager',
    function ($compile, $rootScope, $document, $animate, dialogConfig, dialogManager) {

        $document.on('keydown keypress', function (event) {
            // kind'a imperative, but we do not know if ng-app/$rootElement is on body/html or not
            var upperDialog;
            if (event.which === 27 && dialogManager.dialogs.length) {
                upperDialog = dialogManager.getUpperDialog();
                $rootScope.$broadcast(upperDialog.namespace + '.dialog.close', upperDialog);
                $rootScope.$digest();
            }
        });

        var controller = function ($scope, $attrs, dialogConfig) {
            this.namespace = $attrs.dialogRoot || dialogConfig.mainNamespace;
            return angular.extend(this, {
                maskClass: this.namespace + '-' + dialogConfig.maskClass,
                rootClass: this.namespace + '-' + dialogConfig.rootClass,

                broadcast: function (eType, eData) {
                    //noinspection JSPotentiallyInvalidUsageOfThis
                    $scope.$broadcast(this.namespace + '.dialog.' + eType, eData);
                },

                listen: function (eType, eFn) {
                    //noinspection JSPotentiallyInvalidUsageOfThis
                    $scope.$on(this.namespace + '.dialog.' + eType, eFn);
                }

            });
        };

        var postLink = function (scope, element, attrs, dialogRootCtrl) {
            dialogRootCtrl.listen('open', function (e, dialog) {
                var dialogElement = angular.element('<section dialog="' + dialog.label + '"></section>');
                $animate.enter(dialogElement, element.addClass(dialogRootCtrl.rootClass));
                $compile(dialogElement)(scope);
                (!scope.$$phase) && scope.$digest(); // because user can trigger dialog inside $apply
            });
            dialogRootCtrl.listen('closing', function () {
                !dialogManager.hasAny(dialogRootCtrl.namespace) && element.removeClass(dialogRootCtrl.rootClass);
            });
        };

        var template = function (tElement) {
            tElement.append('<div tri:dialog-mask></div>');
        };

        return {
            controller: ['$scope', '$attrs', 'dialogConfig', controller],
            link: postLink,
            require: 'dialogRoot',
            restrict: 'A',
            template: template
        };
    }
]);
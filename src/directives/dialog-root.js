'use strict';

mod.directive('dialogRoot', [
    '$compile',
    '$rootScope',
    '$document',
    '$animate',
    'dialogConfig',
    'dialogManager',
    'dialogUtilities',
    function ($compile, $rootScope, $document, $animate, dialogConfig, dialogManager, dialogUtilities) {

        var controller = function ($attrs, dialogConfig) {

            this.namespace = $attrs.dialogRoot || dialogConfig.mainNamespace;

            return angular.extend(this, {
                holder: null,
                mask: null,
                maskClass: this.namespace + '-' + dialogConfig.maskClass,
                rootClass: this.namespace + '-' + dialogConfig.rootClass
            });
        };

        var compile = function (tElement, tAttrs) {
            var holder = angular.element('<!-- triNgDialog for ' + tAttrs.dialogRoot + ' dialog -->');
            var mask = angular.element('<div tri:dialog-mask></div>');
            tElement.append(holder);

            return function (scope, element, attrs, dialogRootCtrl) {


                dialogRootCtrl.holder = holder;

                var openDialog = function (e, dialog) {
                    $animate.enter(
                        $compile(dialogUtilities.getElem(dialog))(scope),
                        element.addClass(dialogRootCtrl.rootClass),
                        dialogRootCtrl.holder
                    );
                    (!$rootScope.$$phase) && $rootScope.$digest(); // because user can trigger dialog inside $apply
                };

                var closeDialog = function () {
                    !dialogManager.hasAny(dialogRootCtrl.namespace) && element.removeClass(dialogRootCtrl.rootClass);
                };

                $animate.enter(
                    mask,
                    element,
                    dialogRootCtrl.holder,
                    function () {
                        $compile(mask)(scope);
                    }
                );

                $rootScope.$on(dialogUtilities.eventLabel(dialogRootCtrl.namespace, 'open'), openDialog);
                $rootScope.$on(dialogUtilities.eventLabel(dialogRootCtrl.namespace, 'closing'), closeDialog);
            };
        };

        return {
            compile: compile,
            controller: ['$attrs', 'dialogConfig', controller],
            require: 'dialogRoot',
            restrict: 'A'
        };
    }
]);

mod.directive('body', [
    '$rootScope',
    '$document',
    'dialogConfig',
    'dialogManager',
    function ($root, $document, dialogConfig, dialogManager) {
        var link = function postLink() {
            $document.on('keydown keypress', function (event) {
                var upperDialog = dialogManager.getUpperDialog();
                if (event.which === 27 && upperDialog) {
                    $root.$emit(
                        (upperDialog.namespace || dialogConfig.mainNamespace) + '.dialog.close',
                        upperDialog
                    );
                    $root.$digest();
                }
            });
        };
        return {
            restrict: 'E',
            link: link
        };
    }
]);
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
                $rootScope.$emit(upperDialog.namespace + '.dialog.close', upperDialog);
                $rootScope.$digest();
            }
        });

        var controller = function ($attrs, dialogConfig) {
            this.namespace = $attrs.dialogRoot || dialogConfig.mainNamespace;
            return angular.extend(this, {
                holder: null,
                mask: null,
                maskClass: this.namespace + '-' + dialogConfig.maskClass,
                rootClass: this.namespace + '-' + dialogConfig.rootClass
            });
        };

        var postLink = function (scope, element, attrs, dialogRootCtrl) {
            var openDialog = function (e, dialog) {
                var dialogElement = angular.element('<section dialog="' + dialog.label + '"></section>');
                $animate.enter(
                    dialogElement,
                    element.addClass(dialogRootCtrl.rootClass),
                    dialogRootCtrl.holder
                );
                $compile(dialogElement)(scope);
                (!$rootScope.$$phase) && $rootScope.$digest(); // because user can trigger dialog inside $apply
            };

            var closeDialog = function () {
                !dialogManager.hasAny(dialogRootCtrl.namespace) && element.removeClass(dialogRootCtrl.rootClass);
            };

            dialogRootCtrl.holder.after(dialogRootCtrl.mask);
            $compile(dialogRootCtrl.mask)(scope);
            $rootScope.$on(dialogRootCtrl.namespace + '.dialog.open', openDialog);
            $rootScope.$on(dialogRootCtrl.namespace + '.dialog.closing', closeDialog);
        };

        var compile = function (tElement, tAttrs) {
            var holder = angular.element('<!-- triNgDialog for ' + tAttrs.dialogRoot + ' dialog -->');
            var mask = angular.element('<div tri:dialog-mask></div>');
            tElement.append(holder);

            return {
                pre: function (scope, element, attrs, dialogRootCtrl) {
                    dialogRootCtrl.holder = holder;
                    dialogRootCtrl.mask = mask;
                },
                post: postLink
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
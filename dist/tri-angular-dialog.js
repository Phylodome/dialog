/*!
 * triAngular Dialog
 */

(function (mod) {
'use strict';

// Source: src/directives/dialogDirective.js
mod.directive('dialog', [
    '$rootScope',
    '$http',
    '$animate',
    '$compile',
    '$templateCache',
    'dialogManager',
    function ($root, $http, $animate, $compile, $templateCache, dialogManager) {

        var link = function (scope, element, attrs) {

            var dialog = dialogManager.dialogs[attrs.dialog];

            /*
             * LEGACY
             */
            scope.data = scope.data || {};
            angular.extend(scope.data, dialog.data);
            dialog.hasOwnProperty('dynamicParams') && angular.extend(scope, {
                params: dialog.dynamicParams
            });
            /*
             * END LEGACY
             */

            angular.isObject(dialog.scope) && angular.extend(scope, dialog.scope);

            $http
                .get(dialog.templateUrl, {
                    cache: $templateCache
                })
                .success(function (response) {
                    element.html(response);
                    $compile(element.contents())(scope);
                    scope.$emit('$triNgDialogTemplateLoaded');
                })
                .error(function () {
                    // TODO... Finking what to do here :/
                    scope.$emit('$triNgDialogTemplateError');
                });

            scope.$emit('$triNgDialogTemplateRequested');

            scope.closeClick = function () {
                $root.$emit(dialog.namespace + '.dialog.close', dialog);
            };

            $root.$on(dialog.namespace + '.dialog.close', function (e, closedDialog) {
                if (closedDialog.label == dialog.label) {
                    scope.$destroy();
                    $animate.leave(element);
                }
            });
        };

        return {
            restrict: 'A',
            link: link,
            scope: true
        };
    }
]);

// Source: src/directives/dialogRootDirective.js
mod.directive('dialogRoot', [
    '$compile',
    '$location',
    '$rootScope',
    '$interpolate',
    '$document',
    '$animate',
    'dialogManager',
    function ($compile, $location, $rootScope, $interpolate, $document, $animate, dialogManager) {

        var docBody = document.body;
        var docElem = document.documentElement;

        var utils = {

            getViewportSize: (function (viewportStyle) {
                if (viewportStyle.isW3C) {
                    return function () {
                        return {
                            width: window.innerWidth,
                            height: window.innerHeight
                        };
                    };
                } else if (viewportStyle.isIE) {
                    return function () {
                        return {
                            width: docElem.clientWidth,
                            height: docElem.clientHeight
                        };
                    };
                }
                return function () {
                    return {
                        width: docBody.clientWidth,
                        height: docBody.clientHeight
                    };
                };
            }({
                /* jshint -W041 */
                isW3C: (typeof window.innerWidth != 'undefined'),

                /* jshint -W041 */
                isIE: (typeof docElem != 'undefined' &&
                    typeof docElem.clientWidth != 'undefined' &&
                    docElem.clientWidth != 0)
            })),

            getTopScroll: function () {
                return docBody.scrollTop || docElem.scrollTop;
            },

            getTopOffset: function (percentTopOffset) {
                /* jshint -W041 */
                var parsed = percentTopOffset != null ? parseInt(percentTopOffset, 10) : 20;
                if (isNaN(parsed)) {
                    return this.getTopScroll() + 'px';
                }
                return (this.getTopScroll() + this.getViewportSize().height * (parsed / 100)) + 'px';
            },

            getElem: function (dialog) {
                return angular
                    .element($interpolate(
                        '<section dialog="{{ label }}"' +
                            (dialog.controller ? ' ng-controller="{{ controller }} as ctrl"' :  '') +
                        '></section>'
                    )(dialog))
                    .addClass(dialogManager.cfg.dialogClass + ' ' + dialog.dialogClass)
                    .css({
                        zIndex: dialogManager.cfg.baseZindex + (dialog.label + 1) * 2,
                        top: this.getTopOffset(dialog.topOffset)
                    });
            },

            updateMask: function (mask, space) { // TODO: mask should be moved to own directive...
                if (dialogManager.hasAny(space)) {
                    mask.css('z-index', dialogManager.cfg.baseZindex + dialogManager.dialogs.length * 2 - 1);
                    $animate.addClass(mask, dialogManager.cfg.showClass);
                } else {
                    $animate.removeClass(mask, dialogManager.cfg.showClass, function () {
                        mask.removeAttr('style');
                    });
                }
            },

            eventLabel: function (typeAttrValue, eventType) {
                return typeAttrValue + '.dialog.' + eventType;
            },

            extendClass: function (namespace, basicClass) {
                return namespace ? namespace + '-' + basicClass : basicClass;
            }
        };

        var compile = function (tElement, tAttrs) {
            var tMask = angular.element('<div />');
            var namespaceForEvents = tAttrs.dialogRoot || dialogManager.cfg.mainNamespace;

            tElement.append(tMask);
            tMask.addClass(
                utils.extendClass(tAttrs.dialogRoot, dialogManager.cfg.maskClass)
            );

            tMask.bind('click', function () {
                var upperDialog = dialogManager.getUpperDialog();
                if (!upperDialog.modal) {
                    $rootScope.$emit(utils.eventLabel(namespaceForEvents, 'close'), upperDialog);
                    $rootScope.$digest();
                }
            });

            return function (scope, element, attrs) {

                var rootClass = utils.extendClass(attrs.dialogRoot, dialogManager.cfg.rootClass);

                var openDialog = function (e, dialog) {
                    element.addClass(rootClass);

                    $animate.enter(
                        $compile(utils.getElem(dialog))(scope),
                        element,
                        tMask
                    );

                    (!$rootScope.$$phase) && $rootScope.$digest(); // because user can trigger dialog inside $apply

                    utils.updateMask(tMask, namespaceForEvents);
                };

                var closeDialog = function (e, dialog) {
                    dialogManager.unregisterDialog(dialog.label);
                    !dialogManager.hasAny(namespaceForEvents) && element.removeClass(rootClass);

                    utils.updateMask(tMask, namespaceForEvents);
                };

                $rootScope.$on(utils.eventLabel(namespaceForEvents, 'open'), openDialog);
                $rootScope.$on(utils.eventLabel(namespaceForEvents, 'close'), closeDialog);
            };
        };

        return {
            restrict: 'A',
            compile: compile
        };
    }
]);

mod.directive('body', [
    '$rootScope',
    '$document',
    'dialogManager',
    function ($root, $document, dialogManager) {
        var link = function postLink() {
            $document.on('keydown keypress', function (event) {
                var upperDialog = dialogManager.getUpperDialog();
                if (event.which === 27 && upperDialog) {
                    $root.$emit(
                        (upperDialog.namespace || dialogManager.cfg.mainNamespace) + '.dialog.close',
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

// Source: src/services/dialogManagerService.js
mod.provider('dialogManager', function () {

    var _config = {
        baseZindex: 3000,
        rootClass: 'dialog-root',
        maskClass: 'dialog-mask',
        dialogClass: 'dialog',
        mainNamespace: 'main',
        showClass: 'show',
        hideClass: 'hide'
    };

    var _getDialogConfigData = function (initialData) {
        return {
            controller: initialData.controller || false,
            dialogClass: initialData.dialogClass || '',
            topOffset: initialData.topOffset,
            modal: initialData.modal || false,
            namespace: initialData.namespace || _config.mainNamespace,
            templateUrl: initialData.templateUrl
        };
    };


    var DialogManagerService = function ($root, $log) {

        var DialogManager = function DialogManager() {
            return angular.extend(this, {
                dialogs: [],
                cfg: _config
            });
        };

        var DialogData = function (initialData) {

            var configData;

            if (!initialData.templateUrl) {
                // TODO: remove and add default template
                $log.error(new Error('triNgDialog.DialogData() - initialData must contain defined "templateUrl"'));
            }

            configData = _getDialogConfigData(initialData); // TODO: when dropping legacy, config and initial data will be one

            if (initialData.scope) {
                configData.scope = initialData.scope;
            }

            /*
             * LEGACY
             */
            if (initialData.dynamicParams) {
                configData.dynamicParams = initialData.dynamicParams;
            }
            Object.keys(configData).forEach(function (prop) {
                delete initialData[prop];
            });
            /*
             * END LEGACY
             */


            return angular.extend(this, configData, {
                data: initialData // for legacy reasons
            });
        };

        angular.extend(DialogManager.prototype, {

            hasAny: function (namespace) {
                return this.dialogs.filter(function (dialog) {
                    return dialog.namespace === namespace;
                }).length > 0;
            },

            getUpperDialog: function () {
                var count = this.dialogs.length;
                return count > 0 && this.dialogs[count - 1];
            },

            registerDialog: function (dialog) {
                dialog.label = this.dialogs.push(dialog) - 1;
                return dialog;
            },

            unregisterDialog: function (label) {
                var dialog = this.dialogs[label];
                if (dialog && dialog.label === label) {
                    this.dialogs.splice(label, 1);
                    return true;
                }
                return false;
            },

            triggerDialog: function (data) {
                data = data || {};
                $root.$emit(
                        (data.namespace || this.cfg.mainNamespace) + '.dialog.open',
                    this.registerDialog(
                        new DialogData(data)
                    )
                );
                return this;
            }
        });

        return new DialogManager();
    };

    return {

        config: function (cfg) {
            angular.extend(_config, cfg);
            return this;
        },

        $get: ['$rootScope', '$log', DialogManagerService]
    };
});

})(angular.module('triNgDialog', ['ng', 'ngAnimate']));
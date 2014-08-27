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
    '$controller',
    '$templateCache',
    'dialogManager',
    function ($root, $http, $animate, $compile, $controller, $templateCache, dialogManager) {

        var link = function (scope, element, attrs) {

            var dialog = dialogManager.dialogs[attrs.dialog];

            var locals = {
                $data: dialog.data,
                $scope: scope
            };

            var init = function (innerLink) {
                var dialogCtrl;
                if (dialog.controller) {
                    dialogCtrl = $controller(dialog.controller, locals);
                    element.data('$ngControllerController', dialogCtrl);
                    element.children().data('$ngControllerController', dialogCtrl);
                    if (dialog.controllerAs) {
                        scope[dialog.controllerAs] = dialogCtrl;
                    }
                }
                innerLink(scope);
            };

            $http
                .get(dialog.templateUrl, {
                    cache: $templateCache
                })
                .success(function (response) {
                    element.html(response);
                    init($compile(element.contents()));
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
    '$rootScope',
    '$document',
    '$animate',
    'dialogConfig',
    'dialogManager',
    'dialogUtilities',
    function ($compile, $rootScope, $document, $animate, dialogConfig, dialogManager, dialogUtilities) {

        var compile = function (tElement, tAttrs) {
            var tMask = angular.element('<div />');
            var namespaceForEvents = tAttrs.dialogRoot || dialogConfig.mainNamespace;

            tElement.append(tMask);

            tMask.addClass(
                dialogUtilities.extendClass(tAttrs.dialogRoot, dialogConfig.maskClass)
            );

            tMask.bind('click', function () {
                var upperDialog = dialogManager.getUpperDialog();
                if (!upperDialog.modal) {
                    $rootScope.$emit(dialogUtilities.eventLabel(namespaceForEvents, 'close'), upperDialog);
                    $rootScope.$digest();
                }
            });

            return function (scope, element, attrs) {

                var rootClass = dialogUtilities.extendClass(attrs.dialogRoot, dialogConfig.rootClass);

                var openDialog = function (e, dialog) {
                    element.addClass(rootClass);

                    $animate.enter(
                        $compile(dialogUtilities.getElem(dialog))(scope),
                        element,
                        tMask
                    );

                    (!$rootScope.$$phase) && $rootScope.$digest(); // because user can trigger dialog inside $apply

                    dialogUtilities.updateMask(tMask, namespaceForEvents);
                };

                var closeDialog = function (e, dialog) {
                    dialogManager.unRegisterDialog(dialog.label);
                    !dialogManager.hasAny(namespaceForEvents) && element.removeClass(rootClass);

                    dialogUtilities.updateMask(tMask, namespaceForEvents);
                };

                $rootScope.$on(dialogUtilities.eventLabel(namespaceForEvents, 'open'), openDialog);
                $rootScope.$on(dialogUtilities.eventLabel(namespaceForEvents, 'close'), closeDialog);
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

// Source: src/services/dialogConfig.js
mod.constant('dialogConfig', {
    baseZindex: 3000,
    rootClass: 'dialog-root',
    maskClass: 'dialog-mask',
    dialogClass: 'dialog',
    mainNamespace: 'main',
    showClass: 'show' // class added to mask with angular $animate
});

// Source: src/services/dialogDataFactory.js
mod.factory('dialogData', [
    '$log',
    'dialogConfig',
    function ($log, dialogConfig) {

        var DialogData = function () {
            return angular.extend(this, {
                controller: null,
                controllerAs: null,
                dialogClass: '',
                topOffset: null,
                modal: false,
                namespace: dialogConfig.mainNamespace,
                templateUrl: null
            });
        };

        angular.extend(DialogData.prototype, {
            _updateDialogConfigData: function (config, data) {
                if (!config.templateUrl) {
                    // TODO: remove and add default template maybe
                    $log.error(new Error('triNgDialog.DialogData() - initialData must contain defined "templateUrl"'));
                }
                return angular.extend(this, config, {data: data});
            }
        });

        return function (config, data) {
            return new DialogData()._updateDialogConfigData(config, data);
        };
    }
]);

// Source: src/services/dialogManagerService.js
mod.provider('dialogManager', [
    'dialogConfig',
    function (dialogConfig) {

        var DialogManagerService = function ($root, dialogConfig, dialogData) {

            var DialogManager = function DialogManager() {
                return angular.extend(this, {
                    dialogs: []
                });
            };

            angular.extend(DialogManager.prototype, {

                hasAny: function (namespace) {
                    return this.dialogs.some(function (dialog) {
                        return dialog.namespace === namespace;
                    });
                },

                getUpperDialog: function () {
                    var count = this.dialogs.length;
                    return count > 0 && this.dialogs[count - 1];
                },

                registerDialog: function (dialog) {
                    dialog.label = this.dialogs.push(dialog) - 1;
                    return dialog;
                },

                unRegisterDialog: function (label) {
                    var dialog = this.dialogs[label];
                    if (dialog && dialog.label === label) {
                        this.dialogs.splice(label, 1);
                        return true;
                    }
                    return false;
                },

                triggerDialog: function (config, data) {
                    config = config || {};
                    $root.$emit(
                        (config.namespace || dialogConfig.mainNamespace) + '.dialog.open',
                        this.registerDialog(dialogData(config, data))
                    );
                    return this;
                }
            });

            return new DialogManager();
        };

        return {

            config: function (cfg) {
                angular.extend(dialogConfig, cfg);
                return this;
            },

            $get: ['$rootScope', 'dialogConfig', 'dialogData', DialogManagerService]
        };
    }
]);

// Source: src/services/dialogUtilitiesService.js
mod.service('dialogUtilities', [
    '$animate',
    'dialogConfig',
    'dialogManager',
    function ($animate, dialogConfig, dialogManager) {

        var docBody = document.body;
        var docElem = document.documentElement;

        var DialogUtilities = function () {};

        angular.extend(DialogUtilities.prototype, {

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

            getTopOffset: function (topOffset) {
                var _vh = this.getViewportSize().height;
                var _ts = this.getTopScroll();
                var _parsed = parseInt(topOffset, 10);

                if (angular.isUndefined(topOffset)) {
                    return _ts + _vh / 5 + 'px';
                } else if (!isNaN(_parsed)) {
                    if (angular.isString(topOffset) && topOffset.charAt(topOffset.length - 1) === '%') {
                        return _ts + _vh * _parsed / 100 + 'px';
                    }
                    return _ts + _parsed + 'px';
                }
                return _ts + 'px';

            },

            getElem: function (dialog) {
                return angular
                    .element('<section dialog="' + dialog.label + '"></section>')
                    .addClass(dialogConfig.dialogClass + ' ' + dialog.dialogClass)
                    .css({
                        zIndex: dialogConfig.baseZindex + (dialog.label + 1) * 2,
                        top: this.getTopOffset(dialog.topOffset)
                    });
            },

            updateMask: function (mask, space) { // TODO: mask should be moved to own directive...
                if (dialogManager.hasAny(space)) {
                    mask.css('z-index', dialogConfig.baseZindex + dialogManager.dialogs.length * 2 - 1);
                    $animate.addClass(mask, dialogConfig.showClass);
                } else {
                    $animate.removeClass(mask, dialogConfig.showClass, function () {
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
        });

        return new DialogUtilities();
    }
]);

})(angular.module('triNgDialog', ['ng', 'ngAnimate']));
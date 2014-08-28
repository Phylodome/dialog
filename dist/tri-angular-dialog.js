/*!
 * triAngular Dialog
 */

(function (mod) {
'use strict';

// Source: src/directives/dialog-mask.js
mod.directive('triDialogMask', [
    '$animate',
    '$rootScope',
    'dialogConfig',
    'dialogManager',
    'dialogUtilities',
    function ($animate, $rootScope, dialogConfig, dialogManager, dialogUtilities) {

        var controller = function ($scope, $element, dialogConfig, dialogManager) {
            return angular.extend(this, {

                visible: false,
                parent: null,

                update: function () {
                    if (dialogManager.hasAny(this.namespace)) {
                        $element.css('z-index', dialogConfig.baseZindex + dialogManager.dialogs.length * 2 - 1);

                        if (!this.visible) {
                            this.visible = true;
                            $animate.enter(
                                $element,
                                this.parent,
                                this.holder
                            );
                        }
                    } else if (this.visible) {
                        this.visible = false;
                        $animate.leave($element);
                    }
                }
            });
        };

        var preLink = function (scope, element, attrs, ctrl) {
            var rootCtrl = ctrl[0];
            var maskCtrl = ctrl[1];
            maskCtrl.holder = rootCtrl.holder;
            maskCtrl.namespace = rootCtrl.namespace;
            maskCtrl.parent = element.parent();
            element.addClass(rootCtrl.maskClass + ' ' + dialogConfig.maskClass);
        };

        var postLink = function (scope, element, attrs, ctrl) {
            var maskCtrl = ctrl[1];

            $rootScope.$on(dialogUtilities.eventLabel(maskCtrl.namespace, 'open'), function () {
                maskCtrl.update();
            });

            $rootScope.$on(dialogUtilities.eventLabel(maskCtrl.namespace, 'closing'), function () {
                maskCtrl.update();
            });

            element.on('click', function () {
                var upperDialog = dialogManager.getUpperDialog();
                if (upperDialog && !upperDialog.modal) {
                    $rootScope.$emit(dialogUtilities.eventLabel(maskCtrl.namespace, 'close'), upperDialog);
                    $rootScope.$digest();
                }
            });

            element.remove();
        };

        return {
            controller: ['$scope', '$element', 'dialogConfig', 'dialogManager', controller],
            link: {
                pre: preLink,
                post: postLink
            },
            require: ['^dialogRoot', 'triDialogMask'],
            restrict: 'A'
        };
    }
]);




// Source: src/directives/dialog-root.js
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

// Source: src/directives/dialog.js
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
                    $animate.leave(element, function () {
                        scope.$destroy();
                    });
                    dialogManager.unRegisterDialog(dialog.label);
                    $root.$emit(dialog.namespace + '.dialog.closing', closedDialog);
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

// Source: src/services/dialog-config.js
mod.constant('dialogConfig', {
    baseZindex: 3000,
    rootClass: 'dialog-root',
    maskClass: 'dialog-mask',
    dialogClass: 'dialog',
    mainNamespace: 'main'
});

// Source: src/services/dialog-data.js
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

// Source: src/services/dialog-manager.js
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

// Source: src/services/dialog-utilities.js
mod.service('dialogUtilities', [
    '$animate',
    'dialogConfig',
    function ($animate, dialogConfig) {

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
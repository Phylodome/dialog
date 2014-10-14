/*!
 * triAngular Dialog
 */

(function (mod) {
'use strict';

// Source: src/directives/dialog-mask.js
mod.directive('triDialogMask', [
    '$animate',
    'triDialogConfig',
    'triDialogManager',
    function ($animate, dialogConfig, dialogManager) {

        var postLink = function (scope, element, attrs, rootCtrl, $transclude) {
            var root = element.parent();
            var previousElement = null;
            var currentElement = null;

            var updateZIndex = function (mask) {
                mask.css('z-index', dialogConfig.baseZindex + dialogManager.dialogs.length * 2 - 1);
            };

            var update = function () {
                if (dialogManager.hasAny(rootCtrl.namespace)) {
                    if (currentElement) {
                        updateZIndex(currentElement);
                    } else {
                        currentElement = $transclude(function (clone) {
                            $animate.enter(clone, root);
                            updateZIndex(clone);
                            if (previousElement) {
                                previousElement.remove();
                                previousElement = null;
                            }
                        });
                    }
                } else if (currentElement) {
                    $animate.leave(currentElement, function () {
                        previousElement = null;
                    });
                    previousElement = currentElement;
                    currentElement = null;
                }
            };

            scope.$on(rootCtrl.namespace + dialogConfig.eventCore + dialogConfig.eventOpen, update);
            scope.$on(rootCtrl.namespace + dialogConfig.eventCore + dialogConfig.eventClosing, update);

            $animate.leave(currentElement);
        };

        return {
            link: postLink,
            priority: 100,
            require: '^triDialogRoot',
            restrict: 'A',
            terminal: true,
            transclude: 'element'
        };
    }
]);

mod.directive('triDialogMask', [
    'triDialogManager',
    'triDialogConfig',
    function (dialogManager, dialogConfig) {
        var preLink = function (scope, element, attrs, rootCtrl) {
            element.addClass(rootCtrl.maskClass + ' ' + dialogConfig.maskClass);
        };

        var postLink = function (scope, element, attrs, rootCtrl) {
            element.on('click', function () {
                var upperDialog = dialogManager.getUpperDialog();
                if (upperDialog && !upperDialog.modal) {
                    rootCtrl.broadcast(dialogConfig.eventClose, upperDialog);
                    scope.$digest();
                }
            });
        };

        return {
            link: {
                pre: preLink,
                post: postLink
            },
            priority: -100,
            require: '^triDialogRoot',
            restrict: 'A'
        };
    }
]);




// Source: src/directives/dialog-root.js
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

        var controller = function ($scope, $attrs, dialogConfig) {
            this.namespace = $attrs.triDialogRoot || dialogConfig.mainNamespace;
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
            controller: ['$scope', '$attrs', 'triDialogConfig', controller],
            link: postLink,
            require: 'triDialogRoot',
            restrict: 'A',
            template: template
        };
    }
]);

// Source: src/directives/dialog.js
mod.directive('triDialog', [
    '$http',
    '$animate',
    '$compile',
    '$controller',
    '$templateCache',
    'triDialogManager',
    'triDialogConfig',
    'triDialogUtilities',
    function ($http, $animate, $compile, $controller, $templateCache, dialogManager, dialogConfig, dialogUtilities) {

        var postLink = function (scope, element, attrs, dialogRootCtrl) {

            var dialog = dialogManager.dialogs[attrs.triDialog];

            var locals = {
                $dialog: dialog,
                $data: dialog.data,
                $scope: scope
            };

            var dialogCtrl;

            var init = function (element) {
                var innerLink = $compile(element.contents());
                if (dialogCtrl) {
                    element.data('$triDialogController', dialogCtrl);
                    element.children().data('$triDialogController', dialogCtrl);
                }
                innerLink(scope);
            };

            if (dialog.controller) { // TODO: instantiate just before transclude inclusion
                dialogCtrl = $controller(dialog.controller, locals);
                if (dialog.controllerAs) {
                    scope[dialog.controllerAs] = dialogCtrl;
                }
            }

            $http
                .get(dialog.templateUrl, {
                    cache: $templateCache
                })
                .success(function (response) {
                    element.html(response);
                    init(element);
                    scope.$emit(dialogConfig.eventPrefix + dialogConfig.eventTemplate + dialogConfig.eventLoaded);
                })
                .error(function () {
                    // TODO... Finking what to do here :/
                    scope.$emit(dialogConfig.eventPrefix + dialogConfig.eventTemplate + dialogConfig.eventError);
                });

            scope.$emit(dialogConfig.eventPrefix + dialogConfig.eventTemplate + dialogConfig.eventRequested);

            // TODO: move to dialog entity
            //
            scope.closeClick = function () {
                dialogRootCtrl.broadcast(dialogConfig.eventClose, dialog);
            };
            //
            // end TODO


            scope.$on(dialog.namespace + dialogConfig.eventCore + dialogConfig.eventClose, function (e, closedDialog) {
                if (closedDialog.label == dialog.label) {
                    $animate.leave(element, function () {
                        scope.$destroy();
                        dialog.destroy();
                        element = dialog = null;
                    });
                    dialogManager.unRegisterDialog(dialog.label);
                    dialogRootCtrl.broadcast(dialogConfig.eventClosing, closedDialog);
                }
            });
        };

        var compile = function (tElement, tAttrs) {
            var dialog = dialogManager.dialogs[tAttrs.triDialog];
            tElement
                .addClass(dialogConfig.dialogClass + ' ' + dialog.dialogClass)
                .css({ // TODO do that during transclude inclusion
                    zIndex: dialogConfig.baseZindex + (dialog.label + 1) * 2,
                    top: dialogUtilities.getTopOffset(dialog.topOffset)
                });
            return postLink;
        };

        return {
            compile: compile,
            require: '^triDialogRoot',
            restrict: 'A',
            scope: true
        };
    }
]);

// Source: src/services/dialog-config.js
mod.constant('triDialogConfig', {
    baseZindex: 3000,
    rootClass: 'dialog-root',
    maskClass: 'dialog-mask',
    dialogClass: 'dialog',
    mainNamespace: 'main',
    eventCore: 'TriDialog',
    eventPrefix: 'triDialog',
    eventOpen: 'Open',
    eventClosing: 'Closing',
    eventClose: 'Close',
    eventLoaded: 'Loaded',
    eventError: 'Error',
    eventRequested: 'Requested',
    eventTemplate: 'Template'
});

// Source: src/services/dialog-data.js
mod.factory('triDialogData', [
    '$log',
    'triDialogConfig',
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
            },

            destroy: function () {
                var key;
                for (key in this) {
                    if (this.hasOwnProperty(key)) {
                        delete this[key];
                    }
                }
            }
        });

        return function (config, data) {
            return new DialogData()._updateDialogConfigData(config, data);
        };
    }
]);

// Source: src/services/dialog-manager.js
mod.provider('triDialogManager', [
    'triDialogConfig',
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
                        (config.namespace || dialogConfig.mainNamespace) + dialogConfig.eventCore + dialogConfig.eventOpen,
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

            $get: ['$rootScope', 'triDialogConfig', 'triDialogData', DialogManagerService]
        };
    }
]);

// Source: src/services/dialog-utilities.js
mod.service('triDialogUtilities', [
    function () {
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

            }
        });

        return new DialogUtilities();
    }
]);

})(angular.module('triNgDialog', ['ng', 'ngAnimate']));
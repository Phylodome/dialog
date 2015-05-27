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
    '$rootScope',
    '$document',
    'triDialogConfig',
    'triDialogManager',
    function ($rootScope, $document, dialogConfig, dialogManager) {


        // TODO: add some namespaces here and move it somewhere
        //
        $document.on('keydown keypress', function (event) {
            // kind'a imperative, but we do not know if ng-app/$rootElement is on body/html or not
            var upperDialog;
            if (event.which === 27 && dialogManager.dialogs.length) {
                upperDialog = dialogManager.getUpperDialog();
                if (!upperDialog.blockedDialog) {
                    $rootScope.$broadcast(
                        upperDialog.namespace + dialogConfig.eventCore + dialogConfig.eventClose,
                        upperDialog
                    );
                    $rootScope.$digest();
                }
            }
        });
        //
        //

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
                dialogs: {},

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
            dialogRootCtrl.listen(dialogConfig.eventOpen, function () {
                element.addClass(dialogRootCtrl.rootClass + ' ' + dialogConfig.rootClass);
            });

            dialogRootCtrl.listen(dialogConfig.eventClosing, function () {
                if (!dialogManager.hasAny(dialogRootCtrl.namespace)) {
                    element.removeClass(dialogRootCtrl.rootClass + ' ' + dialogConfig.rootClass);
                }
            });
        };

        var template = function (tElement) {
            tElement.append('<div tri:dialog-mask/><div tri:dialog/>');
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

// Source: src/directives/dialog.js
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

// Source: src/services/dialog-config.js
mod.constant('triDialogConfig', {
    baseZindex: 3000,
    rootClass: 'dialog-root',
    maskClass: 'dialog-mask',
    dialogClass: 'dialog',
    mainNamespace: 'main',
    processTopOffset: false,
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

// Source: src/services/dialog-manager.js
mod.provider('triDialogManager', [
    'triDialogConfig',
    function (dialogConfig) {

        var DialogManagerService = function ($log, dialogConfig) {

            var DialogManager = function DialogManager() {
                return angular.extend(this, {
                    dialogs: [],
                    roots: {}
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

                triggerDialog: function (dialog) {
                    if (!this.roots.hasOwnProperty(dialog.namespace)) {
                        $log.error(new Error('TriDialog: rootCtrl ' + dialog.namespace + ' is not registered!'));
                        return this;
                    }
                    this.roots[dialog.namespace].broadcast(dialogConfig.eventOpen, this.registerDialog(dialog));
                    return this;
                },

                closeDialog: function (dialog) {
                    if (!this.roots.hasOwnProperty(dialog.namespace)) {
                        $log.error(new Error('TriDialog: rootCtrl ' + dialog.namespace + ' is not registered!'));
                        return this;
                    }
                    this.roots[dialog.namespace].broadcast(dialogConfig.eventClose, dialog);
                    return this;
                },

                registerRoot: function (ctrl) {
                    if (!ctrl.namespace) {
                        $log.error(new Error('TriDialog: rootCtrl has no namespace assigned!'));
                        return this;
                    }
                    if (this.roots.hasOwnProperty(ctrl.namespace)) {
                        $log.error(new Error('TriDialog: rootCtrl ' + ctrl.namespace + ' already registered!'));
                        return this;
                    }
                    this.roots[ctrl.namespace] = ctrl;
                    return this;
                },

                unRegisterRoot: function (ctrl) {
                    if (!this.roots.hasOwnProperty(ctrl.namespace)) {
                        $log.error(new Error('TriDialog: rootCtrl ' + ctrl.namespace + ' is not registered!'));
                        return this;
                    }
                    delete this.roots[ctrl.namespace];
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

            $get: ['$log', 'triDialogConfig', DialogManagerService]
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

                /* jshint -W041 */
                if (topOffset == null) {
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

// Source: src/services/dialog.js
mod.factory('triDialog', [
    '$log',
    'triDialogConfig',
    'triDialogManager',
    function ($log, dialogConfig, dialogManager) {

        var DialogData = function (config, data) {
            angular.extend(this, {
                blockedDialog: false,
                controller: null,
                controllerAs: null,
                dialogClass: '',
                topOffset: null,
                modal: false,
                namespace: dialogConfig.mainNamespace,
                templateUrl: null
            });
            if (!config.templateUrl) {
                $log.error(new Error('triNgDialog.DialogData() - initialData must contain defined "templateUrl"'));
            }
            if (config.blockedDialog) {
                this.modal = true;
            }
            return angular.extend(this, config, {data: data});
        };

        angular.extend(DialogData.prototype, {

            trigger: function () {
                dialogManager.triggerDialog(this);
                return this;
            },

            close: function () {
                dialogManager.closeDialog(this);
                return this;
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
            return new DialogData(config, data).trigger();
        };
    }
]);

})(angular.module('triNgDialog', ['ng', 'ngAnimate']));
var tri;
(function (tri) {
    var dialog;
    (function (dialog) {
        'use strict';
        (function (noty) {
            noty[noty["Accepted"] = 0] = "Accepted";
            noty[noty["Cancelled"] = 1] = "Cancelled";
            noty[noty["Closed"] = 2] = "Closed";
            noty[noty["Closing"] = 3] = "Closing";
            noty[noty["ClosingEsc"] = 4] = "ClosingEsc";
            noty[noty["ClosingMask"] = 5] = "ClosingMask";
            noty[noty["Open"] = 6] = "Open";
            noty[noty["Opening"] = 7] = "Opening";
            noty[noty["TemplateError"] = 8] = "TemplateError";
            noty[noty["TemplateLoaded"] = 9] = "TemplateLoaded";
        })(dialog.noty || (dialog.noty = {}));
        var noty = dialog.noty;
        dialog.conf = {
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
        };
        dialog.mod = angular
            .module('triNgDialog', ['ngAnimate'])
            .constant('triDialogNoty', noty)
            .constant('triDialogConfig', dialog.conf);
    })(dialog = tri.dialog || (tri.dialog = {}));
})(tri || (tri = {}));

var tri;
(function (tri) {
    var dialog;
    (function (dialog) {
        'use strict';
        dialog.mod.directive('triDialogMask', [
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
                            }
                            else {
                                currentElement = $transclude(function (clone) {
                                    $animate.enter(clone, root, element);
                                    updateZIndex(clone);
                                    if (previousElement) {
                                        previousElement.remove();
                                        previousElement = null;
                                    }
                                });
                            }
                        }
                        else if (currentElement) {
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
        dialog.mod.directive('triDialogMask', [
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
                            rootCtrl.broadcast(dialogConfig.eventClose, {
                                accepted: false,
                                dialog: upperDialog.notify(dialog.noty.ClosingMask),
                                reason: 'maskClick'
                            });
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
    })(dialog = tri.dialog || (tri.dialog = {}));
})(tri || (tri = {}));

var tri;
(function (tri) {
    var dialog;
    (function (dialog) {
        'use strict';
        dialog.mod.run([
            '$rootScope',
            '$document',
            'triDialogManager',
            function ($rootScope, $document, dialogManager) {
                // TODO: add some namespaces
                $document.on('keydown keypress', function (event) {
                    // kind'a imperative, but we do not know if ng-app/$rootElement is on body/html or not
                    var upperDialog;
                    if (event.which === 27 && dialogManager.dialogs.length) {
                        upperDialog = dialogManager.getUpperDialog();
                        if (!upperDialog.blockedDialog && dialogManager.hasRoot(upperDialog.namespace)) {
                            dialogManager.getRoot(upperDialog.namespace).broadcast(dialog.conf.eventClose, {
                                accepted: false,
                                dialog: upperDialog.notify(dialog.noty.ClosingEsc),
                                reason: 'esc'
                            });
                            $rootScope.$digest();
                        }
                    }
                });
            }
        ]);
        dialog.mod.directive('triDialogRoot', ['triDialogManager', function (dialogManager) {
                var controller = function ($scope, $attrs, dialogManager) {
                    var _this = this;
                    this.namespace = $attrs.triDialogRoot || dialog.conf.mainNamespace;
                    dialogManager.registerRoot(this);
                    $scope.$on('$destroy', function () {
                        dialogManager.unRegisterRoot(_this);
                    });
                    angular.extend(this, {
                        maskClass: this.namespace + '-' + dialog.conf.maskClass,
                        rootClass: this.namespace + '-' + dialog.conf.rootClass,
                        dialogs: {},
                        broadcast: function (eType, eData) {
                            $scope.$broadcast(this.namespace + dialog.conf.eventCore + eType, eData);
                        },
                        listen: function (eType, eFn) {
                            $scope.$on(this.namespace + dialog.conf.eventCore + eType, eFn);
                        }
                    });
                };
                var postLink = function (scope, element, attrs, dialogRootCtrl) {
                    dialogRootCtrl.listen(dialog.conf.eventOpen, function () {
                        element.addClass(dialog.conf.rootClass + ' ' + dialog.conf.rootClass);
                    });
                    dialogRootCtrl.listen(dialog.conf.eventClosing, function () {
                        if (!dialogManager.hasAny(dialogRootCtrl.namespace)) {
                            element.removeClass(dialogRootCtrl.rootClass + ' ' + dialog.conf.rootClass);
                        }
                    });
                };
                var template = function (tElement) {
                    tElement.append('<div tri:dialog-mask/><div tri:dialog/>');
                };
                return {
                    controller: ['$scope', '$attrs', 'triDialogManager', controller],
                    link: postLink,
                    require: 'triDialogRoot',
                    restrict: 'A',
                    template: template
                };
            }]);
    })(dialog = tri.dialog || (tri.dialog = {}));
})(tri || (tri = {}));

var tri;
(function (tri) {
    var dialog;
    (function (dialog_1) {
        'use strict';
        triDialogManipulator.$inject = [
            '$animate', '$rootScope', '$controller', '$timeout',
            'triDialogManager', 'triDialogConfig', 'triDialogUtilities'
        ];
        function triDialogManipulator($animate, $rootScope, $controller, $timeout, dialogManager, dialogConfig, dialogUtilities) {
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
                        /* tslint:disable:triple-equals */
                        if (dialogConfig.processTopOffset || dialog.topOffset != null) {
                            /* tslint:enable:triple-equals */
                            css.top = dialogUtilities.getTopOffset(dialog.topOffset);
                        }
                        return css;
                    };
                    $transcludeFn($rootScope.$new(), function (clone, dialogScope) {
                        if (dialog.controller) {
                            setController(clone, dialogScope);
                        }
                        else {
                            dialogScope.$dialog = dialog;
                        }
                        clone
                            .data('$triDialog', dialog)
                            .css(getCss())
                            .addClass(dialogConfig.dialogClass + ' ' + dialog.dialogClass);
                        dialogRootCtrl.dialogs[dialog.label] = clone;
                        $timeout(function () {
                            dialog.notify(dialog_1.noty.Opening);
                        }, 1);
                        $animate.enter(clone, element.parent(), element, function () {
                            dialog.notify(dialog_1.noty.Open);
                        });
                    });
                });
                dialogRootCtrl.listen(dialogConfig.eventClose, function (e, notification) {
                    var closedDialog = notification.dialog;
                    var dialogElement = dialogRootCtrl.dialogs[closedDialog.label];
                    var dialogElementScope;
                    if (dialogElement && dialogElement.data('$triDialog') === closedDialog) {
                        dialogElementScope = dialogElement.scope();
                        $animate.leave(dialogElement, function () {
                            closedDialog.notify(dialog_1.noty.Closed);
                            dialogElementScope.$destroy();
                            dialogElement.removeData().children().removeData();
                            closedDialog.destroy(notification);
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
        triDialog.$inject = ['$log', '$http', '$compile', '$templateCache', 'triDialogConfig'];
        function triDialog($log, $http, $compile, $templateCache, dialogConfig) {
            var postLink = function (scope, element) {
                var dialog = element.data('$triDialog');
                var dialogCtrl = element.data('$triDialogController');
                $http.get(dialog.templateUrl, {
                    cache: $templateCache
                }).success(function (response) {
                    var innerLink;
                    element.html(response);
                    innerLink = $compile(element.contents());
                    if (dialogCtrl) {
                        element.children().data('$triDialogController', dialogCtrl);
                    }
                    innerLink(scope);
                    dialog.notify(dialog_1.noty.TemplateLoaded);
                    scope.$broadcast(dialogConfig.eventPrefix + dialogConfig.eventTemplate + dialogConfig.eventLoaded);
                }).error(function () {
                    scope.$broadcast(dialogConfig.eventPrefix + dialogConfig.eventTemplate + dialogConfig.eventError);
                    dialog.notify(dialog_1.noty.TemplateError);
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
        dialog_1.mod.directive('triDialog', triDialog);
        dialog_1.mod.directive('triDialog', triDialogManipulator);
    })(dialog = tri.dialog || (tri.dialog = {}));
})(tri || (tri = {}));

var tri;
(function (tri) {
    var dialog;
    (function (dialog_1) {
        'use strict';
        var DialogManagerService = (function () {
            function DialogManagerService() {
                this.dialogs = [];
                this.roots = {};
            }
            DialogManagerService.prototype.hasAny = function (namespace) {
                return this.dialogs.some(function (dialog) { return dialog.namespace === namespace; });
            };
            DialogManagerService.prototype.hasRoot = function (namespace) {
                return this.roots.hasOwnProperty(namespace);
            };
            DialogManagerService.prototype.getRoot = function (namespace) {
                return this.roots[namespace];
            };
            DialogManagerService.prototype.getUpperDialog = function () {
                var count = this.dialogs.length;
                return count > 0 && this.dialogs[count - 1];
            };
            DialogManagerService.prototype.registerDialog = function (dialog) {
                dialog.label = this.dialogs.push(dialog) - 1;
                return dialog;
            };
            DialogManagerService.prototype.unRegisterDialog = function (label) {
                var dialog = this.dialogs[label];
                if (dialog && dialog.label === label) {
                    this.dialogs.splice(label, 1);
                    return true;
                }
                return false;
            };
            DialogManagerService.prototype.triggerDialog = function (dialog) {
                if (!this.roots.hasOwnProperty(dialog.namespace)) {
                    this.$_$log.error(new Error('TriDialog: rootCtrl ' + dialog.namespace + ' is not registered!'));
                    return this;
                }
                this.roots[dialog.namespace].broadcast(this.$_dialogConfig.eventOpen, this.registerDialog(dialog));
                return this;
            };
            DialogManagerService.prototype.closeDialog = function (notification) {
                if (!this.roots.hasOwnProperty(notification.dialog.namespace)) {
                    this.$_$log.error(new Error('TriDialog: rootCtrl ' + notification.dialog.namespace + ' is not registered!'));
                    return this;
                }
                this.roots[notification.dialog.namespace].broadcast(this.$_dialogConfig.eventClose, notification);
                return this;
            };
            DialogManagerService.prototype.registerRoot = function (ctrl) {
                if (!ctrl.namespace) {
                    this.$_$log.error(new Error('TriDialog: rootCtrl has no namespace assigned!'));
                    return this;
                }
                if (this.roots.hasOwnProperty(ctrl.namespace)) {
                    this.$_$log.error(new Error('TriDialog: rootCtrl ' + ctrl.namespace + ' already registered!'));
                    return this;
                }
                this.roots[ctrl.namespace] = ctrl;
                return this;
            };
            DialogManagerService.prototype.unRegisterRoot = function (ctrl) {
                if (!this.roots.hasOwnProperty(ctrl.namespace)) {
                    this.$_$log.error(new Error('TriDialog: rootCtrl ' + ctrl.namespace + ' is not registered!'));
                    return this;
                }
                delete this.roots[ctrl.namespace];
                return this;
            };
            return DialogManagerService;
        })();
        dialog_1.mod.provider('triDialogManager', [
            'triDialogConfig',
            function (triDialogConfig) { return ({
                config: function (cfg) {
                    angular.extend(triDialogConfig, cfg);
                    return this;
                },
                $get: ['$log', 'triDialogConfig', function ($log, triDialogConfig) {
                        angular.extend(DialogManagerService.prototype, {
                            $_$log: $log,
                            $_dialogConfig: triDialogConfig
                        });
                        return new DialogManagerService();
                    }]
            }); }
        ]);
    })(dialog = tri.dialog || (tri.dialog = {}));
})(tri || (tri = {}));

var tri;
(function (tri) {
    var dialog;
    (function (dialog) {
        'use strict';
        var docBody = document.body;
        var docElem = document.documentElement;
        /* tslint:disable:triple-equals */
        var viewportStyle = {
            isW3C: (typeof window.innerWidth != 'undefined'),
            isIE: (typeof docElem != 'undefined' && typeof docElem.clientWidth != 'undefined' && docElem.clientWidth != 0)
        };
        /* tslint:enable:triple-equals */
        var DialogUtilities = (function () {
            function DialogUtilities() {
            }
            DialogUtilities.prototype.getViewportSize = function () {
                if (viewportStyle.isW3C) {
                    return {
                        width: window.innerWidth,
                        height: window.innerHeight
                    };
                }
                if (viewportStyle.isIE) {
                    return {
                        width: docElem.clientWidth,
                        height: docElem.clientHeight
                    };
                }
                return {
                    width: docBody.clientWidth,
                    height: docBody.clientHeight
                };
            };
            DialogUtilities.prototype.getTopScroll = function () {
                return docBody.scrollTop || docElem.scrollTop;
            };
            DialogUtilities.prototype.getTopOffset = function (topOffset) {
                var _vh = this.getViewportSize().height;
                var _ts = this.getTopScroll();
                var _parsed = parseInt(topOffset, 10);
                /* tslint:disable:triple-equals */
                if (topOffset == null) {
                    /* tslint:enable:triple-equals */
                    return _ts + _vh / 5 + 'px';
                }
                else if (!isNaN(_parsed)) {
                    if (angular.isString(topOffset) && topOffset.charAt(topOffset.length - 1) === '%') {
                        return _ts + _vh * _parsed / 100 + 'px';
                    }
                    return _ts + _parsed + 'px';
                }
                return _ts + 'px';
            };
            return DialogUtilities;
        })();
        dialog.mod.service('triDialogUtilities', DialogUtilities);
    })(dialog = tri.dialog || (tri.dialog = {}));
})(tri || (tri = {}));

var tri;
(function (tri) {
    var dialog;
    (function (dialog) {
        'use strict';
        var DialogData = (function () {
            function DialogData(config, data) {
                angular.extend(this, {
                    blockedDialog: false,
                    controller: null,
                    controllerAs: null,
                    dialogClass: '',
                    topOffset: null,
                    modal: false,
                    namespace: this.$_dialogConfig.mainNamespace,
                    templateUrl: null,
                    $_deferred: this.$_$q.defer()
                });
                if (!config.templateUrl) {
                    this.$_$log.error(new Error('triNgDialog.DialogData() - initialData must contain defined "templateUrl"'));
                }
                angular.extend(this, config, {
                    data: data,
                    modal: config.blockedDialog || config.modal || this.modal,
                    promise: this.$_deferred.promise
                });
            }
            DialogData.prototype.accept = function (reason) {
                return this.close(reason, false);
            };
            DialogData.prototype.cancel = function (reason) {
                return this.close(reason, true);
            };
            DialogData.prototype.close = function (reason, reject) {
                this.$_dialogManager.closeDialog({
                    accepted: !reject,
                    dialog: this,
                    reason: reason
                });
                /* tslint:disable:triple-equals */
                if (reject != null) {
                    /* tslint:enable:triple-equals */
                    this.notify(reject === true ? dialog.noty.Cancelled : dialog.noty.Accepted);
                }
                return this.notify(dialog.noty.Closing);
            };
            DialogData.prototype.destroy = function (notification) {
                var key;
                if (notification.accepted) {
                    this.$_deferred.resolve(notification.reason);
                }
                else {
                    this.$_deferred.reject(notification.reason);
                }
                for (key in this) {
                    if (this.hasOwnProperty(key)) {
                        delete this[key];
                    }
                }
            };
            DialogData.prototype.notify = function (status) {
                this.$_deferred.notify({ dialog: this, status: dialog.noty[status] });
                return this;
            };
            DialogData.prototype.trigger = function () {
                this.$_dialogManager.triggerDialog(this);
                return this;
            };
            return DialogData;
        })();
        dialog.mod.factory('triDialog', [
            '$log',
            '$q',
            'triDialogConfig',
            'triDialogManager',
            function ($log, $q, dialogConfig, dialogManager) {
                angular.extend(DialogData.prototype, {
                    $_$log: $log,
                    $_$q: $q,
                    $_dialogConfig: dialogConfig,
                    $_dialogManager: dialogManager
                });
                return function (config, data) { return new DialogData(config, data).trigger(); };
            }
        ]);
    })(dialog = tri.dialog || (tri.dialog = {}));
})(tri || (tri = {}));

//# sourceMappingURL=../dist/tri-angular-dialog.js.map
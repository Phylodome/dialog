/*!
 * triAngular Dialog
 */

(function (mod) {
'use strict';

// Source: src/directives/dialogDirective.js
var docBody = document.body;
var docElem = document.documentElement;

var getTopScroll = function () {
    return docBody.scrollTop || docElem.scrollTop;
};

var getViewportSize = (function (viewportStyle) {
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
}));

var getTopOffset = function (cfgTopOffset) {
    /* jshint -W041 */
    var parsed = cfgTopOffset != null ? parseInt(cfgTopOffset, 10) : 20;
    if (isNaN(parsed)) {
        return getTopScroll() + 'px';
    }
    return (getTopScroll() + getViewportSize().height * (parsed / 100)) + 'px';
};

mod.directive('dialog', [
    '$rootScope',
    '$timeout',
    'dialogManager',
    function ($rootScope, $timeout, dialogManager) {

        var link = function (scope, element, attrs) {

            var dialog = dialogManager.dialogs[attrs.dialog];

            scope.data = scope.data || {};
            angular.extend(scope.data, dialog.data);

            dialog.hasOwnProperty('dynamicParams') && angular.extend(scope, {
                params: dialog.dynamicParams
            });

            var dynamicCSS = {
                zIndex: dialogManager.cfg.baseZindex + (dialog.label + 1) * 2,
                top: getTopOffset(dialog.topOffset)
            };

            element
                .css(dynamicCSS)
                .addClass(dialogManager.cfg.dialogClass)
                .addClass(dialogManager.cfg.hideClass)
                .addClass(dialog.dialogClass);

            $timeout(function () {
                element
                    .removeClass(dialogManager.cfg.hideClass)
                    .addClass(dialogManager.cfg.showClass);
            }, 100);

            scope.closeClick = function () {
                $rootScope.$emit(dialog.namespace + '.dialog.close', dialog);
            };

            $rootScope.$on(dialog.namespace + '.dialog.close', function (e, closedDialog) {
                if (closedDialog.label == dialog.label) {
                    $timeout(function () {
                        element
                            .removeClass(dialogManager.cfg.showClass)
                            .addClass(dialogManager.cfg.hideClass)
                            .css({zIndex: -1});
                        $timeout(function () {
                            element.remove();
                        }, 600);
                    }, 0);
                }
            });

        };

        return {
            restrict: 'A',
            require: '?ngController',
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
    'dialogManager',
    function ($compile, $location, $rootScope, $interpolate, $document, dialogManager) {

        var utils = {
            getElem: function (dialog) {
                return angular.element(
                    $interpolate(
                        '<section dialog="{{ label }}"' +
                            (dialog.controller ? ' ng-controller="{{ controller }} as ctrl"' :  '') +
                        '>' +
                            '<div ng-include="\'{{ templateUrl  }}\'" />' +
                         '</section>'
                    )(dialog)
                );
            },

            updateMask: function (mask, space) { // TODO: mask should be moved to own directive...
                var updates = {
                    css: {
                        'true': dialogManager.cfg.baseZindex + dialogManager.dialogs.length * 2 - 1,
                        'false': -1
                    },
                    cls: {
                        'true': dialogManager.cfg.showClass,
                        'false': dialogManager.cfg.hideClass
                    }
                };
                var update = function (cond) {
                    mask.css('z-index', updates.css[cond]);
                    mask.removeClass(updates.cls[!cond]).addClass(updates.cls[cond]);
                };
                update(dialogManager.hasAny(space));
            },

            eventLabel: function (typeAttrValue, eventType) {
                return typeAttrValue + '.dialog.' + eventType;
            },

            emit: function (type, fn) {
                var self = this;
                return {
                    'forThe': function (dialog, label, checkModal) {
                        var conds = {
                            'true': !dialog.modal,
                            'false': true,
                            'close': !!dialogManager.dialogs.length,
                            'open': true
                        };
                        if (!!dialog && conds[type] && conds[!!checkModal]) {
                            angular.isFunction(fn) && fn();
                            $rootScope.$emit(self.eventLabel(label, type), dialog);
                        }
                    }
                };
            },

            maskBasicClass: function (rootLabel, basicClass) {
                return rootLabel ? rootLabel + '-' + basicClass : basicClass;
            }
        };

        var compile = function (tElement, tAttrs) {
            var tMask = angular.element('<div />');
            var namespaceForEvents = tAttrs.dialogRoot || 'main';

            tElement.append(tMask);

            tMask.addClass(
                utils.maskBasicClass(
                    tAttrs.dialogRoot,
                    dialogManager.cfg.maskClass
                )
            );

            tMask.bind('click', function () {
                utils.emit('close').forThe(dialogManager.getUpperDialog(), namespaceForEvents, true);
            });

            return function (scope, element, attrs) {

                var rootClass = attrs.dialogRoot ?
                    attrs.dialogRoot + '-' + dialogManager.cfg.rootClass :
                    dialogManager.cfg.rootClass;

                var openDialog = function (e, dialog) {
                    element
                        .addClass(rootClass)
                        .append($compile(utils.getElem(dialog))(scope));
                    (!$rootScope.$$phase) && $rootScope.$digest();
                    utils.updateMask(tMask, namespaceForEvents);
                };


                var closeDialog = function (e, dialog) {
                    dialogManager.unregisterDialog(dialog.label);
                    !dialogManager.hasAny(namespaceForEvents) && element.removeClass(rootClass);
                    utils.updateMask(tMask, namespaceForEvents);
                };

                $rootScope.$on(utils.eventLabel(namespaceForEvents, 'open'), openDialog);
                $rootScope.$on(utils.eventLabel(namespaceForEvents, 'close'), closeDialog);


                $rootScope.$on('historyBack', function (e, oldLocation) {
                    utils.emit('close', function () {
                        $location.path(oldLocation);
                    }).forThe(dialogManager.getUpperDialog(), namespaceForEvents);
                });

                $document.bind('keydown keypress', function (event) {
                    var upperDialog = dialogManager.getUpperDialog();
                    if (event.which === 27 && upperDialog && upperDialog.namespace === namespaceForEvents) {
                        utils.emit('close').forThe(upperDialog, namespaceForEvents);
                    }
                });

            };
        };

        return {
            restrict: 'A',
            compile: compile
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
        showClass: 'show',
        hideClass: 'hide'
    };

    var _getConfigData = function (initialData) {
        return {
            controller: initialData.controller || false,
            dialogClass: initialData.dialogClass || '',
            topOffset: initialData.topOffset,
            modal: initialData.modal || false,
            namespace: initialData.namespace || 'main',
            templateUrl: initialData.templateUrl
        };
    };

    var DialogData = function (initialData) {

        if (!initialData.templateUrl) {
            // TODO: remove and add default template
            throw new Error('dialog.DialogData() - initialData must contain defined "templateUrl"');
        }

        var configData = _getConfigData(initialData);

        if (initialData.dynamicParams) {
            configData.dynamicParams = initialData.dynamicParams;
        }

        Object.keys(configData).forEach(function (prop) {
            delete initialData[prop];
        });

        angular.extend(this, configData);
        this.data = initialData;
    };

    return {

        DialogData: DialogData,

        config: function (cfg) {
            angular.extend(_config, cfg);
            return this;
        },

        $get: [
            '$rootScope',
            function ($rootScope) {
                return {
                    dialogs: [],

                    cfg: _config,

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
                            delete dialog.label;
                            this.dialogs.splice(label, 1);
                            return true;
                        }
                        return false;
                    },

                    triggerDialog: function (data) {
                        data = data || {};
                        $rootScope.$emit(
                            (data.namespace ? data.namespace + '.' : 'main.') + 'dialog.open',
                            this.registerDialog(
                                new DialogData(data)
                            )
                        );
                    }
                };
            }
        ]
    };
});

})(angular.module('triNgDialog', []));
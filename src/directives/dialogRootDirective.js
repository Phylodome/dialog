'use strict';

angular
    .module('ngDialog')
    .directive('dialogRoot', [
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

                    $document.bind('keydown keypress', function(event) {
                        var upperDialog = dialogManager.getUpperDialog();
                        if (event.which === 27 && upperDialog && upperDialog.namespace === namespaceForEvents) {
                            utils.emit('close').forThe(upperDialog, namespaceForEvents)
                        }
                    });

                };;
            };

            return {
                restrict: 'A',
                compile: compile
            };
        }]
    );
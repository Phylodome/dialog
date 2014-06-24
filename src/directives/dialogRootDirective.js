'use strict';

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
                        '>' +
                            '<div ng-include="\'{{ templateUrl  }}\'" />' +
                         '</section>'
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
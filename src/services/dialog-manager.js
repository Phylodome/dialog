'use strict';
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
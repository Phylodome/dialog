'use strict';
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

            $get: ['$rootScope', 'triDialogConfig', 'triDialogData', DialogManagerService]
        };
    }
]);
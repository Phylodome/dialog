'use strict';
mod.provider('dialogManager', function () {

    var _config = {
        baseZindex: 3000,
        rootClass: 'dialog-root',
        maskClass: 'dialog-mask',
        dialogClass: 'dialog',
        mainNamespace: 'main',
        showClass: 'show',
        hideClass: 'hide'
    };

    var DialogManagerService = function ($root, $log) {

        var DialogManager = function DialogManager() {
            return angular.extend(this, {
                dialogs: [],
                cfg: _config
            });
        };

        var DialogData = function (config, data) {
            if (!config.templateUrl) {
                // TODO: remove and add default template
                $log.error(new Error('triNgDialog.DialogData() - initialData must contain defined "templateUrl"'));
            }
            return this._updateDialogConfigData(config, data);
        };

        angular.extend(DialogData.prototype, {
            _updateDialogConfigData: function (config, data) {
                return angular.extend(this, {
                    controller: config.controller,
                    controllerAs: config.controllerAs,
                    dialogClass: config.dialogClass || '',
                    topOffset: config.topOffset,
                    modal: config.modal || false,
                    namespace: config.namespace || _config.mainNamespace,
                    templateUrl: config.templateUrl,
                    data: data
                });
            }
        });

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
                    (config.namespace || this.cfg.mainNamespace) + '.dialog.open',
                    this.registerDialog(new DialogData(config, data))
                );
                return this;
            }
        });

        return new DialogManager();
    };

    return {

        config: function (cfg) {
            angular.extend(_config, cfg);
            return this;
        },

        $get: ['$rootScope', '$log', DialogManagerService]
    };
});
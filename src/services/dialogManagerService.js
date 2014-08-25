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

    var _getDialogConfigData = function (initialData) {
        return {
            controller: initialData.controller || false,
            dialogClass: initialData.dialogClass || '',
            topOffset: initialData.topOffset,
            modal: initialData.modal || false,
            namespace: initialData.namespace || _config.mainNamespace,
            templateUrl: initialData.templateUrl
        };
    };

    var DialogManagerService = function ($root, $log) {

        var DialogManager = function DialogManager() {
            return angular.extend(this, {
                dialogs: [],
                cfg: _config
            });
        };

        var DialogData = function (initialData) {

            var configData;

            if (!initialData.templateUrl) {
                // TODO: remove and add default template
                $log.error(new Error('triNgDialog.DialogData() - initialData must contain defined "templateUrl"'));
            }

            configData = _getDialogConfigData(initialData); // TODO: when dropping legacy, config and initial data will be one

            if (initialData.scope) {
                configData.scope = initialData.scope;
            }

            /*
             * LEGACY
             */
            if (initialData.dynamicParams) {
                configData.dynamicParams = initialData.dynamicParams;
            }
            Object.keys(configData).forEach(function (prop) {
                delete initialData[prop];
            });
            /*
             * END LEGACY
             */

            return angular.extend(this, configData, {
                data: initialData // for legacy reasons
            });
        };

        angular.extend(DialogManager.prototype, {

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

            unRegisterDialog: function (label) {
                var dialog = this.dialogs[label];
                if (dialog && dialog.label === label) {
                    this.dialogs.splice(label, 1);
                    return true;
                }
                return false;
            },

            triggerDialog: function (data) {
                data = data || {};
                $root.$emit(
                        (data.namespace || this.cfg.mainNamespace) + '.dialog.open',
                    this.registerDialog(
                        new DialogData(data)
                    )
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
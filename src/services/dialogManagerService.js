'use strict';
mod.provider('dialogManager', function () {

    var _config = {
        baseZindex: 3000,
        rootClass: 'dialog-root',
        maskClass: 'dialog-mask',
        dialogClass: 'dialog',
        showClass: 'show',
        hideClass: 'hide'
    };

    var _getDialogConfigData = function (initialData) {
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

        var configData = _getDialogConfigData(initialData);

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

        $get: ['$rootScope', function ($rootScope) {

            var DialogManager = function DialogManager() {
                return angular.extend(this, {
                    dialogs: [],
                    cfg: _config
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
                    return this;
                }
            });

            return new DialogManager();
        }]
    };
});
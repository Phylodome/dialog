'use strict';
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
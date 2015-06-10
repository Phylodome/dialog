
module tri.dialog {

    'use strict';

    class DialogData implements ITriDialog {

        public blockedDialog: boolean;
        public controller: string;
        public controllerAs: string;
        public dialogClass: string;
        public topOffset: any;
        public label: number;
        public modal: boolean;
        public namespace: string;
        public templateUrl: string;
        public data: any;
        public promise: ng.IPromise<any>;

        private $_deferred: ng.IDeferred<any>;

        private $_$log: ng.ILogService;
        private $_$q: ng.IQService;
        private $_dialogConfig: ITriDialogBaseConfig;
        private $_dialogManager: ITriDialogManagerService;

        constructor(config: ITriDialogConfig, data?: any) {

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
                this.$_$log.error(
                    new Error('triNgDialog.DialogData() - initialData must contain defined "templateUrl"')
                );
            }
            angular.extend(this, config, {
                data: data,
                modal: config.blockedDialog || config.modal || this.modal,
                promise: this.$_deferred.promise
            });
        }


        public accept(reason?: any): ITriDialog {
            return this.close(reason, false);
        }

        public cancel(reason?: any): ITriDialog {
            return this.close(reason, true);
        }

        public close(reason?: any, reject = false): ITriDialog {
            this.$_dialogManager.closeDialog({
                accepted: !reject,
                dialog: this,
                reason: reason,
                status: 'closing'
            });
            return this.notify('closing');
        }

        public destroy(notification: ITriDialogPromiseFinalisation): void {
            var key;
            if (notification.accepted) {
                this.$_deferred.resolve(notification.reason);
            } else {
                this.$_deferred.reject(notification.reason);
            }
            for (key in this) {
                if (this.hasOwnProperty(key)) {
                    delete this[key];
                }
            }
        }

        public notify(status: string): ITriDialog {
            this.$_deferred.notify({dialog: this, status: status});
            return this;
        }

        public trigger(): ITriDialog {
            this.$_dialogManager.triggerDialog(this);
            return this;
        }

    }

    mod.factory('triDialog', [
        '$log',
        '$q',
        'triDialogConfig',
        'triDialogManager',
        function (
            $log: ng.ILogService,
            $q: ng.IQService,
            dialogConfig: ITriDialogBaseConfig,
            dialogManager: ITriDialogManagerService
        ): ITriDialogService {
            angular.extend(DialogData.prototype, {
                $_$log: $log,
                $_$q: $q,
                $_dialogConfig: dialogConfig,
                $_dialogManager: dialogManager
            });
            return (config: ITriDialogConfig, data?: any) => new DialogData(config, data).trigger();
        }
    ]);

}

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

        private $_$log: ng.ILogService;
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
                templateUrl: null
            });
            if (!config.templateUrl) {
                this.$_$log.error(
                    new Error('triNgDialog.DialogData() - initialData must contain defined "templateUrl"')
                );
            }
            if (config.blockedDialog) {
                this.modal = true;
            }
            angular.extend(this, config, {data: data});
        }

        public close(): ITriDialog {
            this.$_dialogManager.closeDialog(this);
            return this;
        }

        public destroy(): void {
            var key;
            for (key in this) {
                if (this.hasOwnProperty(key)) {
                    delete this[key];
                }
            }
        }

        public trigger(): ITriDialog {
            this.$_dialogManager.triggerDialog(this);
            return this;
        }

    }

    mod.factory('triDialog', [
        '$log',
        'triDialogConfig',
        'triDialogManager',
        function (
            $log: ng.ILogService,
            dialogConfig: ITriDialogBaseConfig,
            dialogManager: ITriDialogManagerService
        ): ITriDialogService {
            angular.extend(DialogData.prototype, {
                $_$log: $log,
                $_dialogConfig: dialogConfig,
                $_dialogManager: dialogManager
            });
            return (config: ITriDialogConfig, data?: any) => new DialogData(config, data).trigger();
        }
    ]);

}
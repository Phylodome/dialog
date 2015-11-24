
module tri.dialog {

    'use strict';

    export class DialogData implements ITriDialog {

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
        public promise: angular.IPromise<any>;

        private $_deferred: angular.IDeferred<any>;
        private $_contentElement: angular.IAugmentedJQuery;

        private $_$q: angular.IQService;
        private $_dialogManager: ITriDialogManagerService;

        constructor(config: ITriDialogConfig, data?: any) {

            angular.extend(this, {
                blockedDialog: false,
                controller: null,
                controllerAs: null,
                dialogClass: '',
                topOffset: null,
                modal: false,
                namespace: conf.mainNamespace,
                templateUrl: null,
                $_deferred: this.$_$q.defer()
            });

            if (!config.templateUrl) {
                throw new Error('triNgDialog.DialogData() - initialData must contain defined "templateUrl"');
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

        public close(reason?: any, reject?: boolean): ITriDialog {
            this.$_dialogManager.closeDialog({
                accepted: !reject,
                dialog: this,
                reason: reason
            });
            /* tslint:disable:triple-equals */
            if (reject != null) {
                /* tslint:enable:triple-equals */
                this.notify(reject === true ? noty.Cancelled : noty.Accepted);
            }
            return this.notify(noty.Closing);
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

        public notify(status: number): ITriDialog {
            this.$_deferred.notify({dialog: this, status: noty[status]});
            return this;
        }

        public trigger(): ITriDialog {
            this.$_dialogManager.triggerDialog(this);
            return this;
        }

        public setContentElement(element: angular.IAugmentedJQuery): void {
            this.$_contentElement = element;
        }

        addClass(cssClass: string): void {
            this.$_contentElement.addClass(cssClass);
        }

        removeClass(cssClass: string): void {
            this.$_contentElement.removeClass(cssClass);
        }

        toggleClass(cssClass: string, condition?: boolean): void {
            this.$_contentElement.toggleClass(cssClass, condition);
        }

    }

    mod.factory('triDialog', ['$q', 'triDialogManager', (
        $q: angular.IQService,
        dialogManager: ITriDialogManagerService
    ): ITriDialogService => {
        angular.extend(DialogData.prototype, {
            $_$q: $q,
            $_dialogManager: dialogManager
        });
        return (config: any, data?: any) => {
            if (angular.isString(config)) {
                config = definitions[config];
            }
            if (!config || !angular.isObject(config)) {
                throw new TypeError('First argument passed to triDialog service should be valid string or object');
            }
            return new DialogData(config, data).trigger();
        };
    }]);

}

module tri.dialog {

    'use strict';

    class DialogManagerService implements ITriDialogManagerService {

        public dialogs: Array<ITriDialog> = [];
        public roots: {[namespace: string]: ITriDialogRootCtrl} = {};

        private $_$log: ng.ILogService;
        private $_dialogConfig: ITriDialogBaseConfig;

        hasAny(namespace: string): boolean {
            return this.dialogs.some((dialog) => dialog.namespace === namespace);
        }

        getUpperDialog(): ITriDialog {
            var count = this.dialogs.length;
            return count > 0 && this.dialogs[count - 1];
        }

        registerDialog(dialog: ITriDialog): ITriDialog {
            dialog.label = this.dialogs.push(dialog) - 1;
            return dialog;
        }

        unRegisterDialog(label: number): boolean {
            var dialog = this.dialogs[label];
            if (dialog && dialog.label === label) {
                this.dialogs.splice(label, 1);
                return true;
            }
            return false;
        }

        triggerDialog(dialog: ITriDialog): ITriDialogManagerService {
            if (!this.roots.hasOwnProperty(dialog.namespace)) {
                this.$_$log.error(new Error('TriDialog: rootCtrl ' + dialog.namespace + ' is not registered!'));
                return this;
            }
            this.roots[dialog.namespace].broadcast(this.$_dialogConfig.eventOpen, this.registerDialog(dialog));
            return this;
        }

        closeDialog(dialog: ITriDialog): ITriDialogManagerService {
            if (!this.roots.hasOwnProperty(dialog.namespace)) {
                this.$_$log.error(new Error('TriDialog: rootCtrl ' + dialog.namespace + ' is not registered!'));
                return this;
            }
            this.roots[dialog.namespace].broadcast(this.$_dialogConfig.eventClose, dialog);
            return this;
        }

        registerRoot(ctrl: ITriDialogRootCtrl): ITriDialogManagerService {
            if (!ctrl.namespace) {
                this.$_$log.error(new Error('TriDialog: rootCtrl has no namespace assigned!'));
                return this;
            }
            if (this.roots.hasOwnProperty(ctrl.namespace)) {
                this.$_$log.error(new Error('TriDialog: rootCtrl ' + ctrl.namespace + ' already registered!'));
                return this;
            }
            this.roots[ctrl.namespace] = ctrl;
            return this;
        }

        unRegisterRoot(ctrl: ITriDialogRootCtrl): ITriDialogManagerService {
            if (!this.roots.hasOwnProperty(ctrl.namespace)) {
                this.$_$log.error(new Error('TriDialog: rootCtrl ' + ctrl.namespace + ' is not registered!'));
                return this;
            }
            delete this.roots[ctrl.namespace];
            return this;
        }
    }

    mod.provider('triDialogManager', ['triDialogConfig', (triDialogConfig: ITriDialogBaseConfig) => ({
        config(cfg) {
            angular.extend(triDialogConfig, cfg);
            return this;
        },
        $get: ['$log', 'triDialogConfig', ($log: ng.ILogService, triDialogConfig: ITriDialogBaseConfig) => {
            angular.extend(DialogManagerService.prototype, {
                $_$log: $log,
                $_dialogConfig: triDialogConfig
            });
            return new DialogManagerService();
        }]
    })]);

}
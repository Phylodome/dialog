
module tri.dialog {

    'use strict';

    class DialogManagerService implements ITriDialogManagerService {

        public dialogs: Array<ITriDialog> = [];
        public roots: {[namespace: string]: ITriDialogRootCtrl} = {};

        hasAny(namespace: string): boolean {
            return this.dialogs.some((dialog) => dialog.namespace === namespace);
        }

        hasRoot(namespace: string): boolean {
            return this.roots.hasOwnProperty(namespace);
        }

        getRoot(namespace: string): ITriDialogRootCtrl {
            return this.roots[namespace];
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
                throw new Error('TriDialog: rootCtrl ' + dialog.namespace + ' is not registered!');
            }
            this.roots[dialog.namespace].broadcast(conf.eventOpen, this.registerDialog(dialog));
            return this;
        }

        closeDialog(notification: ITriDialogPromiseFinalisation): ITriDialogManagerService {
            if (!this.roots.hasOwnProperty(notification.dialog.namespace)) {
                throw new Error('TriDialog: rootCtrl ' + notification.dialog.namespace + ' is not registered!');
            }
            this.roots[notification.dialog.namespace].broadcast(conf.eventClose, notification);
            return this;
        }

        registerRoot(ctrl: ITriDialogRootCtrl): ITriDialogManagerService {
            if (!ctrl.namespace) {
                throw new Error('TriDialog: rootCtrl has no namespace assigned!');
            }
            if (this.roots.hasOwnProperty(ctrl.namespace)) {
                throw new Error('TriDialog: rootCtrl ' + ctrl.namespace + ' already registered!');
            }
            this.roots[ctrl.namespace] = ctrl;
            return this;
        }

        unRegisterRoot(ctrl: ITriDialogRootCtrl): ITriDialogManagerService {
            if (!this.roots.hasOwnProperty(ctrl.namespace)) {
                throw new Error('TriDialog: rootCtrl ' + ctrl.namespace + ' is not registered!');
            }
            delete this.roots[ctrl.namespace];
            return this;
        }
    }

    mod.provider('triDialogManager', [
        'triDialogConfig',
        (triDialogConfig: ITriDialogBaseConfig): ITriDialogManagerProvider => ({
            config(cfg: ITriDialogProviderConfig): ITriDialogManagerProvider {
                angular.extend(triDialogConfig, cfg);
                return this;
            },
            when(label: string, config: ITriDialogConfig): ITriDialogManagerProvider {
                definitions[label] = config;
                return this;
            },
            $get: (): DialogManagerService => new DialogManagerService()
        })
    ]);

}
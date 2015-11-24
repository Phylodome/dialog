// Type definitions for triangular dialog
declare module tri.dialog {

    interface ITriDialogProviderConfig {
        baseZindex?: number;
        rootClass?:  string;
        maskClass?: string;
        dialogClass?: string;
        mainNamespace?: string;
        processTopOffset?: boolean;
    }

    interface ITriDialogBaseConfig {
        baseZindex: number;         // 3000
        rootClass:  string;         // 'dialog-root'
        maskClass: string;          // 'dialog-mask'
        dialogClass: string;        // 'dialog'
        mainNamespace: string;      // 'main'
        processTopOffset: boolean;  // false
        eventCore: string;          // 'TriDialog'
        eventPrefix: string;        // 'triDialog'
        eventOpen: string;          // 'Open'
        eventClosing: string;       // 'Closing'
        eventClose: string;         // 'Close'
        eventLoaded: string;        // 'Loaded'
        eventError: string;         // 'Error'
        eventRequested: string;     // 'Requested'
        eventTemplate: string;      // 'Template'
    }

    interface ITriDialogConfig {
        blockedDialog?: boolean;
        controller?: string;
        controllerAs?: string;
        dialogClass?: string;
        topOffset?: any;
        modal?: boolean;
        namespace?: string;
        templateUrl: string;
    }

    interface ITriDialog {
        blockedDialog: boolean;
        controller: string;
        controllerAs: string;
        dialogClass: string;
        topOffset: any;
        label: number;
        modal: boolean;
        namespace: string;
        templateUrl: string;
        data: any;
        promise: ng.IPromise<any>;
        close(reason?: any, reject?: boolean): ITriDialog;
        accept(reason?: any): ITriDialog;
        cancel(reason?: any): ITriDialog;
        destroy(notification: ITriDialogPromiseFinalisation): void;
        notify(status: number): ITriDialog;
        trigger(): ITriDialog;
        addClass(cssClass: string): void;
        removeClass(cssClass: string): void;
        toggleClass(cssClass: string, condition?: boolean): void;
    }

    interface ITriDialogPromiseNotification {
        dialog: ITriDialog;
        status: string;
    }

    interface ITriDialogPromiseFinalisation {
        accepted: boolean;
        dialog: ITriDialog;
        reason: any;
    }

    interface ITriDialogRootCtrl {
        namespace: string;
        maskClass: string;
        rootClass: string;
        dialogs: any;
        broadcast(event: string, data: any): void;
        listen(event: string, callback?: (...args: any[]) => any): void;
    }

    interface ITriDialogService {
        (config: ITriDialogConfig, data?: any): ITriDialog;
        (configKey: string, data?: any): ITriDialog;
    }

    interface ITriElementSize {
        height: number;
        width: number;
    }

    interface ITriDialogStyle {
        zIndex: number;
        top?: string;
    }

    interface ITriDialogUtilitiesService {
        getViewportSize(): ITriElementSize;
        getTopScroll(): number;
        getTopOffset(offset?: any): string;
    }

    interface ITriDialogManagerService {
        dialogs: Array<ITriDialog>;
        roots: {[namespace: string]: ITriDialogRootCtrl};
        hasAny(namespace: string): boolean;
        hasRoot(namespace: string): boolean;
        getRoot(namespace: string): ITriDialogRootCtrl;
        getUpperDialog(): ITriDialog;
        registerDialog(dialog: ITriDialog): ITriDialog;
        unRegisterDialog(label: number): boolean;
        triggerDialog(dialog: ITriDialog): ITriDialogManagerService;
        closeDialog(notification: ITriDialogPromiseFinalisation): ITriDialogManagerService;
        registerRoot(ctrl: ITriDialogRootCtrl): ITriDialogManagerService;
        unRegisterRoot(ctrl: ITriDialogRootCtrl): ITriDialogManagerService;
    }

    interface ITriDialogManagerProvider {
        $get: () => ITriDialogManagerService;
        config(config: ITriDialogProviderConfig): ITriDialogManagerProvider;
        when(label: string, config: ITriDialogConfig): ITriDialogManagerProvider;
    }

}
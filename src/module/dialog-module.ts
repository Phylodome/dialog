
module tri.dialog {

    'use strict';

    export enum noty {
        Accepted,
        Cancelled,
        Closed,
        Closing,
        ClosingEsc,
        ClosingMask,
        Open,
        Opening,
        TemplateError,
        TemplateLoaded
    }

    export var conf: ITriDialogBaseConfig = {
        baseZindex: 3000,
        rootClass: 'dialog-root',
        maskClass: 'dialog-mask',
        dialogClass: 'dialog',
        mainNamespace: 'main',
        processTopOffset: false,
        eventCore: 'TriDialog',
        eventPrefix: 'triDialog',
        eventOpen: 'Open',
        eventClosing: 'Closing',
        eventClose: 'Close',
        eventLoaded: 'Loaded',
        eventError: 'Error',
        eventRequested: 'Requested',
        eventTemplate: 'Template'
    };

    export var definitions: {[label: string]: ITriDialogConfig} = {};

    export var mod = angular
        .module('triNgDialog', ['ngAnimate'])
        .constant('triDialogNoty', noty)
        .constant('triDialogConfig', conf);

}
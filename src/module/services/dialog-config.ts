
module tri.dialog {

    'use strict';

    var triDialogConfig: ITriDialogBaseConfig = {
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

    mod.constant('triDialogConfig', triDialogConfig);

}
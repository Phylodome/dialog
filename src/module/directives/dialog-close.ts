
module tri.dialog {

    'use strict';

    interface ITriDialogCloseAttrs extends angular.IAttributes {
        triDialogClose: string;
    }

    function link(
        scope: angular.IScope,
        element: angular.IAugmentedJQuery,
        attrs: ITriDialogCloseAttrs,
        dialogCtrl: TriDialogController
    ): void {
        element.on('click', () => {
            scope.$apply(() => {
                switch (attrs.triDialogClose) {
                    case 'accept':
                        dialogCtrl.$dialog.accept();
                        break;
                    case 'cancel':
                        dialogCtrl.$dialog.cancel();
                        break;
                    default:
                        dialogCtrl.$dialog.close();
                }
            });
        });
    }

    triDialogClose.$inject = [];
    function triDialogClose(): angular.IDirective {
        return {
            link: link,
            require: '^triDialog',
            restrict: 'A'
        };
    }

    mod.directive('triDialogClose', triDialogClose);

}
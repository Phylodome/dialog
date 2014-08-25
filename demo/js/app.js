(function (app) {
    'use strict';

    app.config([
        'dialogManagerProvider',
        function (dialogManagerProvider) {
            dialogManagerProvider.config({
                rootClass: 'dialog-root',
                maskClass: 'dialog-mask',
                dialogClass: 'dialog-itself'
            });
        }
    ]);

    app.controller('DialogSimpleCtrl', [
        '$scope',
        '$data',
        function ($scope, $data) {
            $scope.$data = $data;
            $scope.$on('$triNgDialogTemplateRequested', console.log.bind(console, '$triNgDialogTemplateRequested'));
            $scope.$on('$triNgDialogTemplateLoaded', console.log.bind(console, '$triNgDialogTemplateLoaded'));
            $scope.$on('$triNgDialogTemplateError', console.log.bind(console, '$triNgDialogTemplateError'));
        }
    ]);

    app.controller('DialogTriggersList', [
        '$scope',
        'dialogManager',
        function ($scope, dialogManager) {

            $scope.dialog440 = function () {
                dialogManager.triggerDialog({
                    controller: 'DialogSimpleCtrl',
                    templateUrl: 'partials/dialog.html',
                    dialogClass: 'dialog-440'
                }, {
                    anotherDialog: function () {
                        $scope.dialog800();
                    }
                });
            };

            $scope.dialog800 = function () {
                dialogManager.triggerDialog({
                    controller: 'DialogSimpleCtrl',
                    templateUrl: 'partials/dialog.html',
                    dialogClass: 'dialog-800',
                    topOffset: 0,
                    modal: true
                }, {
                    anotherDialog: function () {
                        $scope.dialog440();
                    }
                });
            };

            $scope.dialogFail = function () {
                dialogManager.triggerDialog({
                    controller: 'DialogSimpleCtrl',
                    templateUrl: 'partials/dia_XXX_g.html',
                    dialogClass: 'dialog-440'
                });
            };
        }
    ]);

}(angular.module('demoApp', ['triNgDialog'])));
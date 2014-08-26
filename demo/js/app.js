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
        '$log',
        '$data', // from 'locals' passed to $controller
        function ($scope, $log, $data) {
            $scope.$data = $data;
            $scope.$on('$triNgDialogTemplateRequested', $log.log.bind($log));
            $scope.$on('$triNgDialogTemplateLoaded', $log.log.bind($log));
            $scope.$on('$triNgDialogTemplateError', $log.log.bind($log));
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
                    topOffset: '33px',
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
                    dialogClass: 'dialog-440',
                    topOffset: '50%'
                });
            };
        }
    ]);

}(angular.module('demoApp', ['triNgDialog'])));
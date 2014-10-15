(function (app) {
    'use strict';

    app.config([
        'triDialogManagerProvider',
        function (dialogManagerProvider) {
            dialogManagerProvider.config({
                rootClass: 'dialog-root',
                maskClass: 'dialog-mask',
                dialogClass: 'dialog-itself',
                processTopOffset: true
            });
        }
    ]);

    app.controller('DialogSimpleCtrl', [
        '$scope',
        '$log',
        '$data',
        '$dialog', // from 'locals' passed to $controller
        function ($scope, $log, $data, $dialog) {
            $scope.$data = $data;
            $scope.$dialog = $dialog;
            $scope.$on('triDialogTemplateRequested', $log.log);
            $scope.$on('triDialogTemplateLoaded', $log.log);
            $scope.$on('triDialogTemplateError', $log.log);
        }
    ]);

    app.controller('DialogTriggersList', [
        '$scope',
        'triDialog',
        function ($scope, triDialog) {

            $scope.dialog440 = function () {
                triDialog({
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
                triDialog({
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
                triDialog({
                    controller: 'DialogSimpleCtrl',
                    templateUrl: 'partials/dia_XXX_g.html',
                    dialogClass: 'dialog-440',
                    topOffset: '50%'
                });
            };
        }
    ]);

}(angular.module('demoApp', ['triNgDialog'])));
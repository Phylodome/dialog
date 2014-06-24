(function (app, ng) {
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

    app.controller('DialogTriggersList', [
        '$scope',
        'dialogManager',
        function ($scope, dialogManager) {

            $scope.dialog440 = function () {
                dialogManager.triggerDialog({
                    templateUrl: 'partials/dialog.html',
                    dialogClass: 'dialog-440',
                    anotherDialog: function () {
                        $scope.dialog800();
                    }
                });
            };

            $scope.dialog800 = function () {
                dialogManager.triggerDialog({
                    templateUrl: 'partials/dialog.html',
                    dialogClass: 'dialog-800',
                    topOffset: 0,
                    modal: true,
                    anotherDialog: function () {
                        $scope.dialog440();
                    }
                });
            };
        }
    ]);

}(angular.module('demoApp', ['triNgDialog']), angular));
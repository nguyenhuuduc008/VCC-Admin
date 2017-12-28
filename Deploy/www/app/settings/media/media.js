(function () {
    'use strict';

    angular.module('app.settings')
	.controller('MediaCtrl', MediaCtrl);

    /** @ngInject */
    function MediaCtrl($rootScope, $scope, $state, authService, settingsService, toaster) {
        $rootScope.settings.layout.showSmartphone = true;
        $rootScope.settings.layout.showPageHead = true;
        $scope.settings = {

        };

        loadView();

        function loadView() {
            loadAnalyticsSettings();
        }

        function loadAnalyticsSettings() {
            settingsService.get().then(function (result) {
                if (result) {
                    $scope.settings = result;
                }
            });
        }

        //Functions
        $scope.saveEdit = function (form) {
            $scope.showInvalid = true;
            //if (form.$invalid) {
            //    return;
            //}

            //if ($scope.settings.adminEmail ==='') {
            //    $scope.settings.adminEmail = $scope.settings.adminEmail;
            //} else {
            updateMediaSetting();
            //}

        };

        function updateMediaSetting() {
            var req = settingsService.updateMediaSetting($scope.settings);
            req.then(function (res) {
                console.log(res.result);
                if (!res.result) {
                    $ngBootbox.alert(res.errorMsg);
                    return;
                }
                toaster.pop('success', 'Success', "Setting Updated.");
            });
        }

        $scope.cancel = function () {
            $state.go('media');
        };

    }

})();


(function () {
    'use strict';

    angular.module('app.settings')
	.controller('AnalyticsCtrl', AnalyticsCtrl);

    /** @ngInject */
    function AnalyticsCtrl($rootScope, $scope, $state, authService, settingsService, toaster) {
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
            updateAnalyticsSetting();
            //}

        };

        function updateAnalyticsSetting() {
            var req = settingsService.updateAnalyticsSetting($scope.settings);
            req.then(function (res) {
                if (!res.result) {
                    $ngBootbox.alert(res.errorMsg);
                    return;
                }
                toaster.pop('success', 'Success', "Setting Updated.");
            });
        }

        $scope.cancel = function () {
            $state.go('analytics');
        };

    }


})();


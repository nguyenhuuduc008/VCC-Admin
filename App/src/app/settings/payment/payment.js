(function () {
    'use strict';

    angular.module('app.settings')
	.controller('PaymentCtrl', PaymentCtrl);
       
    /** @ngInject */
    function PaymentCtrl($rootScope, $scope, $state, authService, settingsService, toaster) {
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
            updatePaymentSetting();
            //}

        };

        function updatePaymentSetting() {
            var req = settingsService.updatePaymentSetting($scope.settings);
            req.then(function (res) {
                if (!res.result) {
                    $ngBootbox.alert(res.errorMsg);
                    return;
                }
                toaster.pop('success', 'Success', "Setting Updated.");
            });
        }

        $scope.cancel = function () {
            $state.go('payment');
        };

    }

})();


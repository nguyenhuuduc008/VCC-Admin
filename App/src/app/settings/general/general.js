(function () {
    'use strict';

    angular.module('app.settings')
	.controller('GeneralCtrl', GeneralCtrl);

    /** @ngInject */
    function GeneralCtrl($rootScope, $scope, $state, authService, settingsService, toaster) {
        $rootScope.settings.layout.showSmartphone = true;
        $rootScope.settings.layout.showPageHead = true;
        var ecommerce;
        $scope.settings = {
		  
		};

        loadView();

        function loadView(){
        	loadGeneralSettings();
        }

        function loadGeneralSettings() {
        	settingsService.get().then(function(result){
				if(result){
                    $scope.settings = result;
                    ecommerce = result.enableEcommerce;
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
            updateGeneralSetting();
            //}
            
        };

        function updateGeneralSetting() {
            var req = settingsService.updateGeneralSetting($scope.settings);
            req.then(function (res) {
                if (!res.result) {
                    $ngBootbox.alert(res.errorMsg);
                    return;
                }
                
                settingsService.get().then(function(data){
                    toaster.pop('success', 'Success', "Setting Updated.");
                    $rootScope.storage.appSettings = data;
                    if(ecommerce !== data.enableEcommerce){
                        ecommerce = data.enableEcommerce;
                        $rootScope.$emit("reloadSibarMenus");
                    }
                });
            });
        }

        $scope.cancel = function () {
            $state.go('general');
        };
    }

})();


(function(){
	'use strict';

	angular.module("app.transactionHistory")
	.controller("addTransHistoryCtrl" , addTransHistoryCtrl);
	/** @ngInject **/
	function addTransHistoryCtrl($rootScope, $scope, $state,$ngBootbox, transHistoryService, transactionService, authService, currentAuth,appUtils, toaster){
		$rootScope.settings.layout.showSmartphone = false;
		$rootScope.settings.layout.showPageHead = true;
        $rootScope.settings.layout.guestPage = false;
        if($rootScope.reProcessSideBar){
            $rootScope.reProcessSideBar = false;
        }
		var currentUser = $rootScope.storage.currentUser;

		var vm = this; // jshint ignore:line
		vm.showInvalid = false;
        vm.numberRegx = /^\d+$/;
        
        vm.requirementTypes = [{
                value: '0',
                text: 'Bitcoin to VCC',
            }
            // ,{
            //     value: '1',
            //     text: 'VCC to Bitcoin',
            // }
        ];
        vm.model = {
            requirementType: '',
            amount: 0,
            code: '',
            status: 1,
			vccAmount: 0,
			userEmail: '',
			userKey: '',
			transactionKey: ''
        };
        vm.model = {
            requirementType: '',
            amount: 0,
            code: ''
        };

		//Functions
        vm.calVccAmount = function(){
            //Calculate vcc amount
            vm.model.vccAmount = vm.model.amount * (1 / 0.5); // 1 VCC = $0.5
		};
		
		vm.create = function(form){
			appUtils.showLoading();
			// vm.showInvalid = true;
			if(form.$invalid){
				return;
			}
			
			vm.model.createdBy = currentUser.email.trim();
			vm.model.status = 1;
            transHistoryService.create(vm.model.userKey.trim(), vm.model).then(function(res){
                if(!res.result){				
                    $ngBootbox.alert(res.errorMsg);
                    return;
                }
				
				var updatedObj = {
					userKey: vm.model.userKey,
					transactionKey: vm.model.transactionKey,
					status: 1
				};
				transactionService.updateStatus(updatedObj).then(function(){
				});
				
                appUtils.hideLoading();
                toaster.pop('success','Success', "Created success!");
                vm.model = {};
            }, function(res){
                $ngBootbox.alert(res.errorMsg);
                appUtils.hideLoading();
                return;
            });
        };

		vm.cancel = function(form){
			$state.go('transactionHistory.list');
		};
	}
})();

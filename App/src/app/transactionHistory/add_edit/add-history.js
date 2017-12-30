(function(){
	'use strict';

	angular.module("app.transactionHistory")
	.controller("addTransHistoryCtrl" , addTransHistoryCtrl);
	/** @ngInject **/
	function addTransHistoryCtrl($rootScope, $scope, $state,$ngBootbox, transHistoryService, authService, currentAuth,appUtils, toaster){
		$rootScope.settings.layout.showSmartphone = false;
		$rootScope.settings.layout.showPageHead = true;
        $rootScope.settings.layout.guestPage = false;
        if($rootScope.reProcessSideBar){
            $rootScope.reProcessSideBar = false;
        }

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
            status: 0,
            vccAmount: 0
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
			
            transactionService.create(currentUser.$id, vm.model).then(function(res){
                if(!res.result){				
                    $ngBootbox.alert(res.errorMsg);
                    return;
                }
                
                var type = _.find(vm.requirementTypes, function(o) { return o.value.toString() === vm.model.requirementType.toString(); });
                var mail = {
                    to_email: currentUser.email,
                    reply_to: '',
                    // from_name: vm.model.fromName,
                    // to_name: vm.model.toName,
                    subject: 'Your transaction',
                    message_html: 'This is a transaction </br/> type: ' + type.text + ' Amount: ' + vm.model.amount + ' Code: ' + vm.model.code,
                    cc: appSettings.contacts.adminAdMail,
                    bcc: ''
                };
                // vm.sendGmailMessage(mail);
                vm.searchItems('');
                toaster.pop('success','Success', "Created success!");
                appUtils.hideLoading();
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

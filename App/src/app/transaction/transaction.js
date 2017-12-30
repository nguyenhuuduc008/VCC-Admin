(function() {
	'use strict';

	angular.module('app.transaction')
	.controller('TransactionCtrl', TransactionCtrl);

	/** @ngInject */
	function TransactionCtrl($rootScope, $scope, $state, $sce, firebaseDataRef, $firebaseObject, appUtils, transactionService, toaster){
        $rootScope.settings.layout.showSmartphone = false;
        $rootScope.settings.layout.showPageHead = true;
        $rootScope.settings.layout.guestPage = false;
		var currentUser = $rootScope.storage.currentUser;
        if(!currentUser.userRoles || (currentUser.userRoles && currentUser.userRoles.length <= 0)){
            window.location.href = '/#/home';
            return;
        }
        var appSettings = $rootScope.storage.appSettings;
        var homeId = appSettings.pageHomeId || '-Kor_iCNGYs-AZewc_I3';
        var vm = this;
        vm.showInvalid = false;
        vm.numberRegx = /^\d+$/;
        
        vm.requirementTypes = appUtils.transactonRequirements;
        vm.model = {
            requirementType: '',
            amount: 0,
            code: '',
            status: 0,
            vccAmount: 0
        };

        vm.groupedItems = [];
        vm.filteredItems = [];
        vm.pagedItems = [];
        vm.paging = {
            pageSize: 25,
            currentPage: 0,
            totalPage: 0,
            totalRecord: 0
        };

        vm.sendGmailMessage = function(obj) {
            appUtils.showLoading();
            // parameters: service_id, template_id, template_parameters
            emailjs.send("gmail","template_9K5AQ3SZ", obj)
            .then(function(response) {
                console.log("SUCCESS. status=%d, text=%s", response.status, response.text);
                appUtils.hideLoading();
            }, function(err) {
                console.log("FAILED. error=", err);
                appUtils.hideLoading();
            });
        };

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
                
                //Send mail to normal user
                var type = _.find(vm.requirementTypes, function(o) { return o.value.toString() === vm.model.requirementType.toString(); });
                var userMail = {
                    to_email: currentUser.email,
                    reply_to: '',
                    // from_name: vm.model.fromName,
                    // to_name: vm.model.toName,
                    subject: 'Your transaction',
                    message_html: 'This is a transaction </br/> type: ' + type.text + ' Amount: ' + vm.model.amount + ' Code: ' + vm.model.code,
                    cc: appSettings.contacts.adminAdMail,
                    bcc: ''
                };
                vm.sendGmailMessage(userMail);

                //Send mail to admin
                var adminMail = {
                    to_email: appSettings.contacts.adminAdMail,
                    reply_to: '',
                    // from_name: vm.model.fromName,
                    // to_name: vm.model.toName,
                    subject: 'Your transaction',
                    message_html: 'Pleas go to admin to create this history transaction </br/> type: ' + type.text + ' Amount: ' + vm.model.amount + ' Code: ' + vm.model.code + ' user email: ' + currentUser.email + ' user key: ' + currentUser.$id + ' transaction key: ' + res.key,
                    cc: '',
                    bcc: ''
                };
                vm.sendGmailMessage(adminMail);

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
        
        vm.groupToPages = function () {
            vm.pagedItems = [];
            for (var i = 0; i < vm.filteredItems.length; i++) {
                if (i % vm.paging.pageSize === 0) {
                    vm.pagedItems[Math.floor(i / vm.paging.pageSize)] = [vm.filteredItems[i]];
                } else {
                    vm.pagedItems[Math.floor(i / vm.paging.pageSize)].push(vm.filteredItems[i]);
                }
            }
            vm.paging.totalPage = Math.ceil(vm.filteredItems.length / vm.paging.pageSize);
        };

        vm.changePage = function () {
            vm.groupToPages();
        };
        
        vm.searchItems = function (keyword) {
            appUtils.showLoading();
            transactionService.search(currentUser.$id, keyword).then(function (result) {
                appUtils.hideLoading();
                vm.filteredItems = appUtils.sortArray(result,'timestampCreated');
                vm.paging.totalRecord = result.length; 
                vm.paging.currentPage = 0;
                //group by pages
                vm.groupToPages();
            });
        };

        vm.displayType = function(value){
            var type = _.find(vm.requirementTypes, function(o) { return o.value.toString() === value.toString(); });
            if(!type) return '';
            return type.text;
        };

        initPage();

        // //==========================
        function initPage(){
            vm.searchItems('');
        }

	}

})();
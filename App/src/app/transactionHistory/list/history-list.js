  (function () {
    'use strict';

    angular.module('app.transactionHistory')
	.controller('historyListCtrl', historyListCtrl);

    /** @ngInject */
    function historyListCtrl($rootScope,$q, $scope, $state,$timeout,$ngBootbox,appUtils,toaster, currentAuth, userService, authService, transHistoryService, $http) {
        $rootScope.settings.layout.showSmartphone = false;
        $rootScope.settings.layout.showPageHead = true;
        $rootScope.settings.layout.guestPage = false;
        var currentUser = $rootScope.storage.currentUser;
        if(!currentUser.userRoles || (currentUser.userRoles && currentUser.userRoles.length <= 0)){
            window.location.href = '/#/home';
            return;
        }
        var userKey = '';
        var vm = this; // jshint ignore:line
        vm.keyword = '';
        vm.groupedItems = [];
        vm.filteredItems = [];
        vm.pagedItems = [];
        vm.paging = {
            pageSize: 25,
            currentPage: 0,
            totalPage: 0,
            totalRecord: 0
        };
        
        vm.requirementTypes = appUtils.transactonRequirements;
        
        /*=============================================================*/
        
        //Functions
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
              $('#select-all-item').attr('checked', false);
              vm.groupToPages();
        };
        
        vm.displayType = function(value){
            var type = _.find(vm.requirementTypes, function(o) { return o.value.toString() === value.toString(); });
            if(!type) return '';
            return type.text;
        };
        
        vm.executeSearchItems = function (keyword) {
            if(vm.keyword !== ''){
                userService.getUserByEmail(vm.keyword).then(function(rs){
                    if(rs){
                        userKey = rs.$id;
                        vm.searchItems(rs.$id);
                    }
                });
            }
        };

        vm.searchItems = function (keyword) {
            appUtils.showLoading();
            transHistoryService.search(keyword).then(function (result) {
                appUtils.hideLoading();
                vm.filteredItems = appUtils.sortArray(result,'timestampCreated');
                vm.paging.totalRecord = result.length; 
                vm.paging.currentPage = 0;
                //group by pages
                vm.groupToPages();
            });
        };

        vm.selectAllItem = function(controlId, name){
            appUtils.checkAllCheckBox(controlId,name);
        };

        vm.applyAction = function(chkName,actionControl){
            var lstItemIds = [];
             $('input[name=' + chkName + ']').each(function () {
                if (this.checked === true) {
                    lstItemIds.push($(this).val() + '');
                }
            });

            var action = $('#' + actionControl).val();
            var actionTxt = $('#' + actionControl +' option:selected').text();

            if(action === 0 || parseInt(action) === 0){
                toaster.warning("Please choose action to execute!");
                return;
            }

            if(lstItemIds.length === 0){
                toaster.warning("Please choose some items to execute action!");
                return;
            }
            
            $ngBootbox.confirm('Are you sure want to apply ' + actionTxt + ' action as selected?').then(function(){
                appUtils.showLoading();
                var reqs = [];
                if(action === 'delete'){
                    _.forEach(lstItemIds, function(obj, key) {
                         reqs.push(transHistoryService.deleteItem(userKey, obj));   
                    });
                    $q.all(reqs).then(function(res){
                        appUtils.hideLoading();
                        var err = _.find(res, function(item){
                             return item.result === false;
                        });
                        if(err === undefined){
                            // delete $rootScope.storage.usersList;
                             toaster.pop('success','Success', "Delete Successful!");    
                        }else{
                             toaster.pop('error','Error', "Delete Error!"); 
                        }
                        vm.executeSearchItems();
                    });  
                }else{
                    appUtils.hideLoading();
                }
            });
        };

        vm.addNew = function(){
            $rootScope.reProcessSideBar = true;
            $state.go('transactionHistory.add');
        };

    }
})();

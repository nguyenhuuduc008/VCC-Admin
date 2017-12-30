  (function () {
    'use strict';

    angular.module('app.transactionHistory')
	.controller('historyListCtrl', historyListCtrl);

    /** @ngInject */
    function historyListCtrl($rootScope,$q, $scope, $state,$timeout,$ngBootbox,appUtils,toaster, currentAuth, authService, transHistoryService, $http) {
        $rootScope.settings.layout.showSmartphone = false;
        $rootScope.settings.layout.showPageHead = true;
        $rootScope.settings.layout.guestPage = false;
        var currentUser = $rootScope.storage.currentUser;
        if(!currentUser.userRoles || (currentUser.userRoles && currentUser.userRoles.length <= 0)){
            window.location.href = '/#/home';
            return;
        }
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
        
        /*=============================================================*/
        function initPage(){
            vm.searchItems(vm.keyword);
        }
        
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

        vm.selectAllUser = function(controlId, name){
            appUtils.checkAllCheckBox(controlId,name);
        };

        vm.applyAction = function(chkName,actionControl){
            var lstUserIds = [];
             $('input[name=' + chkName + ']').each(function () {
                if (this.checked === true) {
                    lstUserIds.push($(this).val() + '');
                }
            });

            var action = $('#' + actionControl).val();
            var actionTxt = $('#' + actionControl +' option:selected').text();

            if(action === 0 || parseInt(action) === 0){
                toaster.warning("Please choose action to execute!");
                return;
            }

            if(lstUserIds.length === 0){
                toaster.warning("Please choose some users to execute action!");
                return;
            }
            
            $ngBootbox.confirm('Are you sure want to apply ' + actionTxt + ' action as selected?').then(function(){
                appUtils.showLoading();
                var reqs = [];
                if(action === 'delete'){
                    _.forEach(lstUserIds, function(obj, key) {
                         reqs.push(transHistoryService.deleteItem(obj));   
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
                        initPage();     
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

        initPage();
    }
})();

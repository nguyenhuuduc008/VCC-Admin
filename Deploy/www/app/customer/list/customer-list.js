(function() {
	'use strict';

    angular.module('app.customer')
	.controller('customerListCtrl', customerListCtrl);

	/** @ngInject */
    function customerListCtrl($rootScope, $scope, $state,$timeout,$ngBootbox,toaster, appUtils,authService,appSettingService,customerService) {
        $rootScope.settings.layout.showSmartphone = false;
        $rootScope.settings.layout.pageSidebarClosed = true;

        var customerVm = this;// jshint ignore:line

		//Default Start Date & End Date
        var startDate = moment().subtract('days', 29).startOf('day');
        var endDate = moment().endOf('day');
		//
        var timestampStart = Date.parse(new Date(startDate));
        var timestampEnd = Date.parse(new Date(endDate));

		customerVm.cri = {
			keyword: '',
            timestampStart: timestampStart,
            timestampEnd: timestampEnd
		};

		customerVm.customers = [];
        customerVm.filteredItems = [];
		customerVm.pagedItems = [];
		customerVm.paging = {
			pageSize: 25,
			currentPage: 0,
			totalPage: 0,
			totalRecord: 0
		};
  
		customerVm.changePage = changePage;
		customerVm.search = search;
		customerVm.filterItems = filterItems;
		customerVm.resetFilter = resetFilter;
		customerVm.goEdit = goEdit;
        customerVm.changeStatus = changeStatus;
        customerVm.removeOrRestore = removeOrRestore;

		 $('#CustomerRangeDateTime').on('apply.daterangepicker', function(ev, picker) {
            timestampStart = Date.parse(new Date(picker.startDate._d));
            timestampEnd = Date.parse(new Date(picker.endDate._d));
			customerVm.cri.keyword = '';
			customerVm.cri.timestampStart = timestampStart;
			customerVm.cri.timestampEnd = timestampEnd;
            search(customerVm.cri);
        });

		initPage();
		//===============================================================
        //Functions
		function initPage(){
			// appSettingService.checkNewSettings().then(function(res){
			// 	if(res && res === true && $rootScope.storage.states && $rootScope.storage.contries){
			// 		$scope.employees = $rootScope.storage.employeesList;
			// 	}else{
			// 		employeeService.users.$loaded().then(function(rs){
			// 			var employees = _.filter(rs, function(user) {
			// 				return user.isDeleted === false || user.isDeleted ==='' || user.isDeleted === undefined ;
			// 			});

			// 			$scope.employees = employees;
			// 			$rootScope.storage.employeesList = employees;
			// 		});
			// 	}
			// });
           
                search(customerVm.cri);
          
		}

		function groupToPages() {
             $scope.$apply(function () {
                customerVm.pagedItems = [];
                for (var i = 0; i < customerVm.filteredItems.length; i++) {
                    if (i % customerVm.paging.pageSize === 0) {
                        customerVm.pagedItems[Math.floor(i / customerVm.paging.pageSize)] = [customerVm.filteredItems[i]];
                    } else {
                        customerVm.pagedItems[Math.floor(i / customerVm.paging.pageSize)].push(customerVm.filteredItems[i]);
                    }
                }
                customerVm.paging.totalPage = Math.ceil(customerVm.filteredItems.length / customerVm.paging.pageSize);
            });
        }


        function changePage() {
            groupToPages();
        }

		function search(keyword) {
			appUtils.showLoading();
            customerService.search2(customerVm.cri).then(function (result) {
                appUtils.hideLoading();
                customerVm.filteredItems = result.items;
                customerVm.paging.totalRecord = result.totalRecords; 
                customerVm.paging.currentPage = 0;
                //group by pages
                groupToPages();
            });
        }
       
        function filterItems(){
            search(customerVm.cri);
        }

        function resetFilter(){
           customerVm.cri.keyword = '';
          search(customerVm.cri);
        }

        function goEdit(id){
            $state.go('customer.details', {id: id});
        }

        function changeStatus(item){
            var action = item.isActive ? 'unactive' : 'active';
             $ngBootbox.confirm('Are you sure want to ' + action + ' this customer?').then(function(){
                appUtils.showLoading();
                item.isActive = !item.isActive;
                var req = item.isActive ? customerService.active(item.$id) :  customerService.unActive(item.$id);
                req.then(function (result) {
                    appUtils.hideLoading();
                    initPage();
                });
            });
        }

        function removeOrRestore(item){
            var action = item.isDeleted ? 'restore' : 'delete';
            $ngBootbox.confirm('Are you sure want to ' + action + ' this customer?').then(function(){
                appUtils.showLoading();
                item.isDeleted = !item.isDeleted;
                var req = item.isDeleted ? customerService.remove(item.$id) :  customerService.restore(item.$id);
                req.then(function (result) {
                    appUtils.hideLoading();
                    initPage();
                });
            });
        }
	}

})();


(function() {
	'use strict';

	angular.module('app.permission')
	.controller('PermissionListCtrl', PermissionListCtrl);

	/** @ngInject */
	function PermissionListCtrl($rootScope, $scope, $state,$q, $timeout, authService, permissionService,roleService, $ngBootbox, toaster, appUtils){
    $rootScope.settings.layout.showSmartphone = false;
    $rootScope.settings.layout.showBreadcrumb = false;
    var permissionVm = this;
        permissionVm.selectAction = 'Bulk Actions';

		permissionVm.items = [];
		permissionVm.roles = [];

        //Load Data
		function loadDataRoles(){
			return roleService.items().$loaded().then(function(data){
		        return data;
		    });
		}

		function loadDataPermission(){
			return permissionService.items().$loaded().then(function(data){
		        return data;
		    });
		}

		function loadData(){
            appUtils.showLoading();
			var reqs;
			var roles =  loadDataRoles();
			var permissions = loadDataPermission();
			reqs = [roles,permissions];
			return $q.all(reqs).then(function(res_array){
                appUtils.hideLoading();
                $timeout(function(){
                    $scope.$apply(function(){
                        permissionVm.roles = appUtils.sortArray(res_array[0],'name');
                        permissionVm.items = appUtils.sortArray(res_array[1],'timestampCreated');
                        console.log(permissionVm.items);
                        permissionVm.sortByIndex();
                    });
                },100);
			});
		}

        loadData();
        
        //Functions
		permissionVm.checkRoleOfPermission = function(role, permissionRole){
            var isExisted = $.inArray(role.$id,permissionRole); 
            if(isExisted === -1){
               return false;
            }else{
               return true;
            }
		};

        permissionVm.selectAll = function(controlId, name){
            appUtils.checkAllCheckBox(controlId,name);
        };

        permissionVm.apply = function(chkName){
            appUtils.showLoading();
            var self = this;
            var lstIds = [];
            $('input[name=' + chkName + ']').each(function () {
                if (this.checked === true) {
                    lstIds.push($(this).val() + '');
                }
            });
            var removeIndex = permissionVm.selectAction.indexOf('Delete');
            if(removeIndex === -1){
                appUtils.hideLoading();
                toaster.warning("Please choose action to execute!");
                return;
            } 
            if(lstIds.length <= 0){
                appUtils.hideLoading();
                toaster.warning("Please choose some items to execute action!");
                return;
            }
            $ngBootbox.confirm('Are you sure want to apply ' + permissionVm.selectAction + ' action as selected?')
            .then(function() {
                var removeRs = [];
                if(removeIndex > -1){
                    _.forEach(lstIds, function(id){
                        removeRs.push(permissionService.remove(id));
                    });
                    $q.all(removeRs).then(function(rs){
                        appUtils.hideLoading();
                        toaster.success("Delete success!");
                        loadData();
                    });
                }

            }, function() {
                appUtils.hideLoading();
            });

        };

        permissionVm.sortByIndex = function(){
            permissionVm.items = _.sortBy(permissionVm.items, [function(o) { return o.index; }]);
        };
	}

})();

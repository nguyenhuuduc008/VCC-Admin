(function() {
	'use strict';

    angular.module('app.role')
	.controller('RoleListCtrl', RoleListCtrl);

	/** @ngInject */
    function RoleListCtrl($rootScope, $scope, $state, $q, authService, roleService, toaster, $ngBootbox, appUtils, $stateParams) {
        $rootScope.settings.layout.showSmartphone = false;
        $rootScope.settings.layout.showBreadcrumb = false;
        $rootScope.settings.layout.guestPage = false;
		// var currentUser = authService.getCurrentUser();
        var currentUser = $rootScope.storage.currentUser;
        if(!currentUser.userRoles || (currentUser.userRoles && currentUser.userRoles.length <= 0)){
            window.location.href = '/#/home';
            return;
        }
        
        var roleVm = this;
        roleVm.nameRegx = /^(a-z|A-Z|0-9)*[^!#$%^&*()'"\/\\;:@=+,?\[\]\/]*$/;
        roleVm.showInvalid = false;
        roleVm.formTitle = 'Add New Role';
        roleVm.showAddNew = true;
        roleVm.selectAction = 'Bulk Actions';
        roleVm.model = {};
        if($stateParams.id){
            roleVm.model.$id = $stateParams.id;
        }
        roleVm.model.name = '';
        roleVm.model.description = '';
        roleVm.model.number = 1;
	  	roleVm.model.uid = currentUser.$id;
	    roleVm.model.timestampCreated = appUtils.getTimestamp();

        roleVm.items = {};
        roleService.items().$loaded().then(function(data){
            roleVm.items = data;
            if(roleVm.model.$id){
             roleService.get(roleVm.model.$id).$loaded().then(function(item){
                if(item){
                    roleVm.edit(item);
                }
             });
            }
        });

	    roleVm.groupedItems = [];
        roleVm.filteredItems = [];
        roleVm.pagedItems = [];
        roleVm.paging = {
            pageSize: 25,
            currentPage: 0,
            totalPage: 0,
            totalRecord: 0
        };

        roleVm.keyword = '';

        roleVm.groupToPages = function () {
            roleVm.pagedItems = [];
            for (var i = 0; i < roleVm.filteredItems.length; i++) {
                if (i % roleVm.paging.pageSize === 0) {
                    roleVm.pagedItems[Math.floor(i / roleVm.paging.pageSize)] = [roleVm.filteredItems[i]];
                } else {
                    roleVm.pagedItems[Math.floor(i / roleVm.paging.pageSize)].push(roleVm.filteredItems[i]);
                }
            }
            if(roleVm.filteredItems.length % roleVm.paging.pageSize === 0){
                roleVm.paging.totalPage = roleVm.filteredItems.length / roleVm.paging.pageSize;
            }else{
                roleVm.paging.totalPage = Math.floor(roleVm.filteredItems.length / roleVm.paging.pageSize) + 1;
            }
            
        };

        // roleVm.changePage = function () {
        //     roleVm.groupToPages();
        // }

        $scope.changePage = function () {
            roleVm.groupToPages();
        };

        roleVm.search = function (keyword) {
            appUtils.showLoading();
            roleService.search(keyword).then(function (result) {
                appUtils.hideLoading();
                roleVm.filteredItems = appUtils.sortArray(result,'timestampCreated');
                roleVm.paging.totalRecord = result.length; 
                roleVm.paging.currentPage = 0;
                //group by pages
                roleVm.groupToPages();
            });
        };

        roleVm.search('');

        roleVm.delete = function(){
          $ngBootbox.confirm('Are you sure want to delete ' + roleVm.model.name + '?')
          .then(function() {
            roleService.remove(roleVm.model.$id).then(function(rs){
                    if(rs.result){
                        toaster.success("Delete success!");
                    }else{
                        toaster.error(rs.errorMsg);
                    }
            });
          }, function() {
          });

        };

        roleVm.selectAll = function(controlId, name){
            appUtils.checkAllCheckBox(controlId,name);
        };

        roleVm.apply = function(chkName){
            appUtils.showLoading();
            var self = this;
            var lstIds = [];
            $('input[name=' + chkName + ']').each(function () {
                if (this.checked === true) {
                    lstIds.push($(this).val() + '');
                }
            });
            var removeIndex = roleVm.selectAction.indexOf('Delete');
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
            $ngBootbox.confirm('Are you sure want to apply ' + roleVm.selectAction + ' action as selected?')
            .then(function() {
                var removeRs = [];
                if(removeIndex > -1){
                    _.forEach(lstIds, function(id){
                        removeRs.push(roleService.remove(id));
                    });
                    
                    $q.all(removeRs).then(function(rs){
                        appUtils.hideLoading();
                        toaster.success("Delete success!");
                        self.search('');
                    });
                }

            }, function() {
                appUtils.hideLoading();
            });
        };

        roleVm.edit = function(item){
            roleVm.showInvalid = true;
        	roleVm.formTitle = 'Edit Role';
        	roleVm.showAddNew = false;
	        roleVm.model.$id = item.$id;
	        roleVm.model.name = item.name;
	        roleVm.model.description = item.description;
	        roleVm.model.number = item.number;
        };

        roleVm.cancel = function(){
            $state.go('roles');
        };

	    roleVm.save = function(){
            appUtils.showLoading();
    		var self = this;
    		var update = null;
            var existedName;
            var existedNumber;
            if(roleVm.model.$id){
                roleService.get(roleVm.model.$id).$loaded().then(function(data){
                    update = data;
                    existedName = _.filter(roleVm.items, function(t) { 
                        if(t.name){
                            if(t.name.toLowerCase() === roleVm.model.name.toLowerCase())
                            {
                                return update.name.toLowerCase() !== roleVm.model.name.toLowerCase();
                            }
                        }
                    });
                    if(existedName.length > 0){
                        appUtils.hideLoading();
                        toaster.warning('The name is ' + roleVm.model.name + " has existed, please try another!");
                        return;
                    }
                    existedNumber = _.filter(roleVm.items, function(t) { 
                            if(t.number){
                                if(t.number === roleVm.model.number)
                                {
                                    return update.number !== roleVm.model.number;
                                }
                            }
                        });
                    if(existedNumber.length > 0){
                        appUtils.hideLoading();
                        toaster.warning('The number is ' + roleVm.model.number + " has existed, please try another!");
                        return;
                    }

                    update.name = roleVm.model.name;
                    update.number = roleVm.model.number;
                    update.description = roleVm.model.description;
                    update.uid = currentUser.$id;
                    update.timestampModified = appUtils.getTimestamp();
                    roleService.update(update).then(function(rs){
                        appUtils.hideLoading();
                        if(rs.result){
                            toaster.success("Save success!");
                            self.search('');
                        }else{
                            toaster.error(rs.errorMsg);
                        }
                    });
                });
            }else{
                existedName = _.filter(roleVm.items, function(t) { 
                    if(t.name){
                        return t.name.toLowerCase() == roleVm.model.name.toLowerCase();
                    }
                });
                if(existedName.length > 0){
                    appUtils.hideLoading();
                    toaster.warning('The name is ' + roleVm.model.name + " has existed, please try another!");
                    return;
                }
                existedNumber = _.filter(roleVm.items, function(t) { 
                        if(t.number){
                            return t.number == roleVm.model.number;
                        }
                    });
                if(existedNumber.length > 0){
                    appUtils.hideLoading();
                    toaster.warning('The number is ' + roleVm.model.number + " has existed, please try another!");
                    return;
                }

                roleService.create(roleVm.model).then(function(rs){
                    appUtils.hideLoading();
                    if(rs.result){
                        self.search('');
                        toaster.success("Save success!");
                        roleVm.model = {};
                    }else{
                        toaster.error(rs.errorMsg);
                    }
                });
            }
	    };
	}
})();

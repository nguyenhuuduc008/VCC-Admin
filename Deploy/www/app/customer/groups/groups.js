(function () {
    'use strict';

    angular.module('app.customer')
	.controller('GroupsCtrl', GroupsCtrl);

    /** @ngInject */
    function GroupsCtrl($rootScope, $scope, $state,$q, authService, customerGroupsService, toaster, $ngBootbox, appUtils, $stateParams) {
        $rootScope.settings.layout.showSmartphone = false;
        $rootScope.settings.layout.showPageHead = true;
        var currentUser = $rootScope.storage.currentUser;
        
        var groupsVm = this;
        groupsVm.nameRegx = /^(a-z|A-Z|0-9)*[^!#$%^&*()'"\/\\;:@=+,?\[\]\/]*$/;
        groupsVm.showInvalid = false;
        groupsVm.formTitle = 'Add Group';
        groupsVm.showAddNew = true;
        groupsVm.selectAction = 'Bulk Actions';
        groupsVm.model = {};
        var id = $stateParams.id;
        groupsVm.model.name = '';
        groupsVm.model.description = '';
        groupsVm.model.uid = currentUser.$id;
        groupsVm.model.timestampCreated = appUtils.getTimestamp();

        groupsVm.items = [];
        customerGroupsService.items().$loaded(function(data){
            groupsVm.items = data;
            if(id && id !== null){
                customerGroupsService.get(id).$loaded().then(function(item){
                    if(item){
                        groupsVm.edit(item);
                    }
                });
            }
        });

        groupsVm.groupedItems = [];
        groupsVm.filteredItems = [];
        groupsVm.pagedItems = [];
        groupsVm.paging = {
            pageSize: 25,
            currentPage: 0,
            totalPage: 0,
            totalRecord: 0
        };

        groupsVm.keyword = '';

        groupsVm.groupToPages = function () {
            groupsVm.pagedItems = [];
            if(!groupsVm.model.$id){
                groupsVm.model.order = groupsVm.filteredItems.length + 1;
            }
            for (var i = 0; i < groupsVm.filteredItems.length; i++) {
                if (i % groupsVm.paging.pageSize === 0) {
                    groupsVm.pagedItems[Math.floor(i / groupsVm.paging.pageSize)] = [groupsVm.filteredItems[i]];
                } else {
                    groupsVm.pagedItems[Math.floor(i / groupsVm.paging.pageSize)].push(groupsVm.filteredItems[i]);
                }
            }
            if(groupsVm.filteredItems.length % groupsVm.paging.pageSize === 0){
                groupsVm.paging.totalPage = groupsVm.filteredItems.length / groupsVm.paging.pageSize;
            }else{
                groupsVm.paging.totalPage = Math.floor(groupsVm.filteredItems.length / groupsVm.paging.pageSize) + 1;
            }
            
        };

        $scope.changePage = function () {
            groupsVm.groupToPages();
        };

        groupsVm.search = function (keyword) {
            appUtils.showLoading();
            customerGroupsService.search(keyword).then(function (result) {
                appUtils.hideLoading();
                groupsVm.filteredItems = result.sort(function(a,b){
                    return a.order - b.order;
                });
                groupsVm.paging.totalRecord = result.length; 
                groupsVm.paging.currentPage = 0;
                //group by pages
                groupsVm.groupToPages();
            });
        };

        groupsVm.search('');

        groupsVm.delete = function(){
        };

        groupsVm.selectAll = function(controlId, name){
            appUtils.checkAllCheckBox(controlId,name);
        };

        groupsVm.apply = function(chkName){
            appUtils.showLoading();
            var self = this;
            var lstIds = [];
            $('input[name=' + chkName + ']').each(function () {
                if (this.checked === true) {
                    lstIds.push($(this).val() + '');
                }
            });
            var removeIndex = groupsVm.selectAction.indexOf('Delete');
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
            $ngBootbox.confirm('Are you sure want to apply ' + groupsVm.selectAction + ' action as selected?')
            .then(function() {
                var removeRs = [];
                if(removeIndex > -1){
                    _.forEach(lstIds, function(id){
                        removeRs.push(customerGroupsService.remove(id));
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

        groupsVm.edit = function(item){
            groupsVm.showInvalid = true;
            groupsVm.formTitle = 'Edit Group';
            groupsVm.showAddNew = false;
            groupsVm.model.$id = item.$id;
            groupsVm.model.name = item.name;
            groupsVm.model.description = item.description;
            groupsVm.model.order = item.order || item.number;
        };
        
        groupsVm.cancel = function(){
            $state.go('customer.groups', {id: ''});
        };

        groupsVm.goEdit = function(id){
            $state.go('customer.groups', {id: id});
        };

        groupsVm.save = function(){
            appUtils.showLoading();
            var self = this;
            var existedName;
            //var existedNumber;

            if(groupsVm.model.$id){
                var update = {};
                customerGroupsService.get(groupsVm.model.$id).$loaded().then(function(rs){
                    update = rs;

                    existedName = _.filter(groupsVm.items, function(t) { 
                        if(t.name){
                            if(t.name.toLowerCase() === groupsVm.model.name.toLowerCase())
                            {
                                return update.name.toLowerCase() !== groupsVm.model.name.toLowerCase();
                            }
                        }
                    });

                    if(existedName.length > 0){
                        appUtils.hideLoading();
                        toaster.warning('The name is ' + groupsVm.model.name + " has existed, please try another!");
                        return;
                    }
                    update.name = groupsVm.model.name;
                    update.order = groupsVm.model.order;
                    update.number = null;
                    update.description = groupsVm.model.description;
                    customerGroupsService.update(update).then(function(rs){
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
                existedName = _.filter(groupsVm.items, function(t) { 
                    if(t.name){
                        return t.name.toLowerCase() == groupsVm.model.name.toLowerCase();
                    }
                });

                if(existedName.length > 0){
                    appUtils.hideLoading();
                    toaster.warning('The name is ' + groupsVm.model.name + " has existed, please try another!");
                    return;
                }

                customerGroupsService.create(groupsVm.model).then(function(rs){
                    appUtils.hideLoading();
                    if(rs.result){
                        self.search('');
                        toaster.success("Save success!");
                        groupsVm.model = {};
                    }else{
                        toaster.error(rs.errorMsg);
                    }
                });
            }
        };
    }

})();

  (function () {
    'use strict';

    angular.module('app.user')
	.controller('userListCtrl', userListCtrl);

    /** @ngInject */
    function userListCtrl($rootScope,$q, $scope, $state,$timeout,$ngBootbox,appUtils,toaster, currentAuth, authService, userService, roleService,permissionService, $http) {
        $rootScope.settings.layout.showSmartphone = false;
        $rootScope.settings.layout.showPageHead = true;
        $rootScope.settings.layout.guestPage = false;
        var currentUser = $rootScope.storage.currentUser;
        if(!currentUser.userRoles || (currentUser.userRoles && currentUser.userRoles.length <= 0)){
            window.location.href = '/#/home';
            return;
        }
        var userVm = this; // jshint ignore:line
        userVm.keyword = '';
        userVm.isAdmin = false;
        userVm.groupedItems = [];
        userVm.filteredItems = [];
        userVm.pagedItems = [];
        userVm.paging = {
            pageSize: 25,
            currentPage: 0,
            totalPage: 0,
            totalRecord: 0
        };
        
        //Load Data
        roleService.items().$loaded(function(data){
            userVm.roles = data;
        });

      

        /*=============================================================*/
        function initPage(){
            userService.search('').then(function (result) {
                userVm.allUsers = result.length;
                userVm.adminUser = _.filter(result, function(user){
                    if(user.userRoles){
                        return user.userRoles.indexOf('-KTlccaZaxPCGDaFPSc5') !== -1;
                    }
                    return false;
                }).length;
            });

            userVm.searchUser(userVm.keyword);
            userService.insertState();
        }
        
        //Functions
        userVm.groupToPages = function () {
            userVm.pagedItems = [];
            for (var i = 0; i < userVm.filteredItems.length; i++) {
                if (i % userVm.paging.pageSize === 0) {
                    userVm.pagedItems[Math.floor(i / userVm.paging.pageSize)] = [userVm.filteredItems[i]];
                } else {
                    userVm.pagedItems[Math.floor(i / userVm.paging.pageSize)].push(userVm.filteredItems[i]);
                }
            }
            userVm.paging.totalPage = Math.ceil(userVm.filteredItems.length / userVm.paging.pageSize);
        };


        userVm.changePage = function () {
              $('#select-all-user').attr('checked', false);
              userVm.groupToPages();
        };
        
        userVm.searchUser = function (keyword) {
            appUtils.showLoading();
            userService.search(keyword,userVm.isAdmin).then(function (result) {
                appUtils.hideLoading();
                if(userVm.isAdmin){
                   result = _.filter(result, function(item){
                        return item.userRoles !== undefined &&  item.userRoles !== null && item.userRoles !== '';
                   }); 
                }
                userVm.filteredItems = appUtils.sortArray(result,'timestampCreated');
                userVm.paging.totalRecord = result.length; 
                userVm.paging.currentPage = 0;
                //group by pages
                userVm.groupToPages();
            });
        };

        userVm.getAllUsers= function(){
            userVm.isAdmin = false;
            userVm.searchUser('');           
        };

        userVm.getAddminUsers = function(){
             userVm.isAdmin = true;
             userVm.searchUser(''); 
        };

        userVm.selectAllUser = function(controlId, name){
            appUtils.checkAllCheckBox(controlId,name);
        };

        userVm.dataLetterPic = function(item){
           	var dateLetter = item.firstName.charAt(0).toUpperCase() + item.lastName.charAt(0).toUpperCase();
            return dateLetter;
        };

        userVm.edit= function(userKey){
            $state.go('user.details', {id: userKey});
        };

        userVm.changeUserRole = function(chkName,roleControl){
            var lstUserIds = [];
            var roleName = $('#' + roleControl).val();
            $('input[name=' + chkName + ']').each(function () {
                if (this.checked === true) {
                    lstUserIds.push($(this).val() + '');
                }
            });

            if(roleName === 0 || parseInt(roleName) === 0){
                toaster.warning("Please choose role to execute!");
                return;
            }

            if(lstUserIds.length === 0){
                toaster.warning("Please choose some users to execute action!");
                return;
            }
            userService.addUserToRole(lstUserIds,roleName);

            //Delete users List storage
			delete $rootScope.storage.usersList;

            //Delete Side Bar Menus List storage
            if(_.find(lstUserIds,currentUser.$id) !== undefined){
                delete $rootScope.storage.sidebarMenus;
            }

            toaster.pop('success','Success', "Assign Role Successful!");
            
            $timeout(function(){
                initPage();
            },1000);
        };

        userVm.applyAction = function(chkName,actionControl){
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
                         reqs.push(userService.deleteUser(obj));   
                    });
                    $q.all(reqs).then(function(res){
                        appUtils.hideLoading();
                        var err = _.find(res, function(item){
                             return item.result === false;
                        });
                        if(err === undefined){
                            delete $rootScope.storage.usersList;
                             toaster.pop('success','Success', "Delete Successful!");    
                        }else{
                             toaster.pop('error','Error', "Delete Error!"); 
                        }
                        initPage();     
                    });  
                }else if(action === 'disable'){
                     _.forEach(lstUserIds, function(obj, key) {  
                         reqs.push(userService.unAuthorizedUser(obj)); 
                    });
                    $q.all(reqs).then(function(res){
                        appUtils.hideLoading();
                        var err = _.find(res, function(item){
                             return item.result === false;
                        });
                        if(err === undefined){
                            delete $rootScope.storage.usersList;
                             toaster.pop('success','Success', "Disable Successful!");    
                        }else{
                             toaster.pop('error','Error', "Disable Error!"); 
                        }
                        initPage();     
                    }); 
                }else if(action === 'enable'){
                    _.forEach(lstUserIds, function(obj, key) {
                         reqs.push(userService.authorizedUser(obj)); 
                    });  
                    $q.all(reqs).then(function(res){
                         appUtils.hideLoading();
                        var err = _.find(res, function(item){
                             return item.result === false;
                        });
                        if(err === undefined){
                            delete $rootScope.storage.usersList;
                             toaster.pop('success','Success', "Enable Successful!");    
                        }else{
                             toaster.pop('error','Error', "Enable Error!"); 
                        }
                        initPage(); 
                    }); 
                }else{
                    appUtils.hideLoading();
                }
            });
        };

        userVm.deserializeRole = function(rolesIds){
            if( rolesIds !== undefined && rolesIds.length > 0){
                var permissions = [];
                _.forEach(rolesIds, function(roleId, key) {
                    var role = _.find(userVm.roles, {$id: roleId});
                    if(role){
                        permissions.push(role.name);
                    }                
                });
                return permissions.join(", ");
            }
            return '';
        };

        userVm.getPhotoProfile = function(imgUri){
            return appUtils.getImageFBUrl(imgUri).then(function(data){
                return data.imgUrl;
            });
        };

        userVm.addNew = function(){
            $rootScope.reProcessSideBar = true;
            $state.go('user.add');
        };

        initPage();
    }
})();

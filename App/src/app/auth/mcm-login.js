(function() {
	'use strict';

	angular
		.module('app.auth')
		.controller("MCMLoginCtrl", MCMLoginCtrl)
		.controller("MCMForgotPasswordCtrl", MCMForgotPasswordCtrl);

	/** @ngInject */
	function MCMLoginCtrl($rootScope, $scope, $state,$firebaseObject,$uibModal,$timeout,firebaseDataRef,$firebaseArray, authService, currentAuth, toaster ,appUtils, APP_CONFIG, $http){
		$rootScope.settings.layout.showSmartphone = false;
		
		var loginVm = this;
		if(!loginVm.currentAuth){
			$state.go('mcmlogin');
		}

		$scope.sidebarMenus = [];
		$scope.errMessage = '';
		loginVm.emailRegx = /^[^!'"\/ ]+$/;
		loginVm.showInvalid = false;
		loginVm.userName = '';
		loginVm.password = '';
		$rootScope.settings.layout.showPageHead = false;
		$rootScope.settings.layout.showSideBar = false;
		$rootScope.settings.layout.showHeader = false;
		$rootScope.settings.layout.showSmartphone = false;
		$rootScope.settings.layout.showFooter = false;

		loginVm.login = function (form) {
		    $scope.showError = false;
		    loginVm.showInvalid = true;
		 	if(form.$invalid){
				return;
		 	}
            appUtils.showLoading();

            authService.login(loginVm).then(function(result) {
            if (result) {
                var email = authService.getCurrentUser().email;
                var roles = firebaseDataRef.child('roles');
                var users = firebaseDataRef.child('users');
                var appOptions = firebaseDataRef.child('app-options');
                var permissions = firebaseDataRef.child('permissions');
                var lstRoles = [];
                var lstUsers = [];
                var lstPermissions = [];
                $firebaseArray(users).$loaded().then(function(data){
                    lstUsers = data;
                    var user =  _.find(lstUsers, {email: email});
                    if(user && user.userRoles !== null && user.userRoles !== undefined && user.userRoles.length > 0  && (user.isDeleted === false || user.isDeleted ==='' || user.isDeleted === undefined) && (user.isAuthorized !== undefined && user.isAuthorized === true)){
                        var userRoleIds = user.userRoles;
                        //Get all states
                        var allState = $state.get();
                        $firebaseArray(roles).$loaded().then(function(data){
                            lstRoles = data;
                            _.forEach(userRoleIds, function(userRoleVal, key) {
                                var userRole =  _.find(lstRoles, {$id: userRoleVal});
                                if(userRole && userRole.name === 'Backend Access'){
                                    delete $rootScope.storage.currentUser;
                                    $rootScope.storage.currentUser = user;
                                    $firebaseObject(appOptions).$loaded().then(function(optionRs){
                                        $rootScope.storage.appSettings = optionRs;
                                        //Get tls token to set current user
                                        setTLSApiToken();
                                    });
                                    $firebaseArray(permissions).$loaded().then(function(data){
                                        lstPermissions = data;
                                        _.forEach(lstPermissions, function(permissionVal, key) {
                                            setUserSidebarMenu(permissionVal, allState, userRole);
                                        });
                                        
                                        $timeout(function(){
                                            if($scope.sidebarMenus && $scope.sidebarMenus.length > 0){
                                                $rootScope.settings.layout.showPageHead = true;
                                                $rootScope.settings.layout.showSideBar = true;
                                                $rootScope.settings.layout.showHeader = true;
                                                $rootScope.settings.layout.showSmartphone = true;
                                                $state.go('index');
                                            }
                                            else{
                                                $scope.showError = true;
                                                $scope.errMessage = "Invalid user name/password";
                                                authService.logout();
                                            }  
                                            appUtils.hideLoading();
                                            
                                        },100);
                                        return;
                                    });
                                } 
                            });
                        });
                            
                    }else{
                        $scope.showError = true;
                        $scope.errMessage = "Invalid user name/password";
                        appUtils.hideLoading();
                        authService.logout();
                    }   
                });
                
            }else{
                appUtils.hideLoading();
            }
            }).catch(function(error) {
                appUtils.hideLoading();
                $scope.showError = true;
                $scope.errMessage = error.message;
            });
		};

		loginVm.openResetPassPopup = function(){
			 var modalInstance = $uibModal.open({
				templateUrl: 'app/auth/forgotpasword.tpl.html',
				controller: 'MCMForgotPasswordCtrl',
                size: 'md',
                windowClass : 'model-z-index',
				resolve:{
					"currentAuth": ["authService", function(authService) {
				        return authService.waitForSignIn();
				     }]
				}
			});
		};

        function setUserSidebarMenu(permissionVal, allState, userRole){
            _.find(permissionVal.roles, function(o) { 
                if(o == userRole.$id){
                    _.find(allState, function(o) { 
                        if(o.data){
                            var menuRs = o.data.pageTitle == permissionVal.name; 
                            if(menuRs){
                                var subMenus = [];
                                var subCurrentStateTmp = false;
                                //Set sub menus
                                _.find(allState, function(sub) { 
                                    if(sub.data){
                                        var subRs = sub.data.parent  == o.name;
                                        if(subRs){
                                            var subCurrentState = $state.is(sub.name);
                                            if(subCurrentState){
                                                subCurrentStateTmp = true;
                                            }
                                            var itemMenu = {
                                                                name: sub.data.pageTitle,
                                                                state: sub.name,
                                                                url: sub.url,
                                                                index: sub.data.index,
                                                                currentState: subCurrentState
                                                            };
                                            subMenus.push(itemMenu);
                                        }
                                    }
                                });
                                subMenus = _.sortBy(subMenus, [function(o) { return o.index; }]);
                                var currentState = $state.is(o.name) || subCurrentStateTmp;
                                var menu = {
                                    name: o.data.pageTitle,
                                    icon: o.data.icon,
                                    state: o.name,
                                    url: o.url,
                                    subs: subMenus,
                                    index: o.data.index,
                                    currentState: currentState
                                };
                                $scope.sidebarMenus.push(menu);
                                return true;
                            }
                            return false;
                        }
                    });
                    return true;
                }
            });
        }


	}
    /** @ngInject */
	function MCMForgotPasswordCtrl($rootScope, $scope, $state, $uibModalInstance,authService,toaster) {
		$scope.email = '';
		$scope.showInvalid = false;
		$scope.errMessage = '';
		$scope.emailRegx = /^[^!'"\/ ]+$/;
        $scope.close = function () {
		    $uibModalInstance.dismiss('cancel');
		};

		$scope.resetPassword = function(form){
			$scope.showInvalid = true;
			$scope.showError = false;
			if(form.$invalid){
				return;
			}
			authService.resetPasswordAuth($scope.email).then(function(){
				$uibModalInstance.dismiss('cancel');
				toaster.success("Reset Password Successfully!");
			}, function(error) {
			    $scope.showError = true;
			  	$scope.errMessage = error.message;
			});
		};
    }

})();

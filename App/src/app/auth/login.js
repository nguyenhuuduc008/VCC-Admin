(function() {
	'use strict';

	angular
		.module('app.auth')
		.controller("LoginCtrl", LoginCtrl)
		.controller("ForgotPasswordCtrl", ForgotPasswordCtrl);

	/** @ngInject */
	function LoginCtrl($rootScope, $scope, $state,$firebaseObject,$uibModal,$timeout,firebaseDataRef,$firebaseArray, authService, currentAuth, toaster ,appUtils, APP_CONFIG, md5, $http, appSettingService){
		$rootScope.settings.layout.showSmartphone = false;
		
		var loginVm = this;
		if(!loginVm.currentAuth){
			$state.go('login');
		}

		$scope.sidebarMenus = [];
		$scope.errMessage = '';
        $scope.loading = false;
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
            
            $scope.loading = true;
            firebaseAuth(loginVm);
		};

        function firebaseAuth ( loginVm ) {
            //Delete cache of current user
            delete $rootScope.storage.currentUser;
            appUtils.showLoading();
            authService.login(loginVm).then(function(result) {
                if (result) {
                    authService.getUserInfo(result.uid).then(function(user){
                        var roles = firebaseDataRef.child('roles');
                        var appOptions = firebaseDataRef.child('app-options');
                        var permissions = firebaseDataRef.child('permissions');
                        var lstRoles = [];
                        var lstPermissions = [];
                        if(user && user.isDeleted){
                            $scope.$apply(function(){
                                $scope.showError = true;
                                $scope.errMessage = "This user may have been deleted.";
                            });
                            appUtils.hideLoading();
                            authService.deleteAuthUser(result.uid);
                        }else if(user && (user.isAuthorized && user.isAuthorized === true)){
                            if(!user.userRoles || user.userRoles.length <= 0){
                                $scope.$apply(function(){
                                    appUtils.hideLoading();
                                    $scope.showError = true;
                                    $scope.errMessage = "There are no permissions to access!";
                                    authService.logout();
                                });
                            }else{
                                var userRoleIds = user.userRoles;
                                //Get all states
                                var allState = $state.get();
                                // $firebaseArray(roles).$loaded().then(function(data){
                                //     lstRoles = data;
                                //     var backendAccessVal = 'Backend Access';
                                //     var backendAccessRole =  _.find(lstRoles, {name: backendAccessVal});
                                //     // console.log(backendAccessRole);
                                //     if(backendAccessRole){
                                user.$id = result.uid;
                                $rootScope.storage.currentUser = user;
                                appSettingService.getSettings().then(function(optionRs){
                                    $rootScope.storage.appSettings = optionRs;
                                });
                                // old code will be removed
                                // $firebaseObject(appOptions).$loaded().then(function(optionRs){
                                //     $rootScope.storage.appSettings = optionRs;
                                // });

                                // $state.go('index');
                                var dashboardUrl = '/#/transaction';
                                // if(window.location.href.indexOf('admin') !== -1){
                                //     dashboardUrl = '/admin/#/home';
                                // }
                                window.location.href = dashboardUrl;
                                $rootScope.settings.layout.showPageHead = false;
                                $rootScope.settings.layout.showSideBar = true;
                                $rootScope.settings.layout.showHeader = true;
                                $rootScope.settings.layout.showSmartphone = true;
                                    // }
                                // });
                            }
                        }else{
                            $scope.$apply(function(){
                                appUtils.hideLoading();
                                $scope.showError = true;
                                $scope.errMessage = "Invalid user name/password";
                                authService.logout();
                            });
                        }   
                    }).catch(function(error) {
                        appUtils.hideLoading();
                        $scope.showError = true;
                        $scope.errMessage = error.message;
                        authService.logout();
                    });
                }
                $scope.loading = false;
            }).catch(function(error) {
                $scope.loading = false;
                appUtils.hideLoading();
                $scope.showError = true;
                $scope.errMessage = error.message;
            });
        }

		loginVm.openResetPassPopup = function(){
			 var modalInstance = $uibModal.open({
				templateUrl: 'app/auth/forgotpasword.tpl.html',
				controller: 'ForgotPasswordCtrl',
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
	function ForgotPasswordCtrl($rootScope, $scope, $state, $uibModalInstance,authService,toaster) {
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

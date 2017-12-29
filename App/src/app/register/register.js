(function() {
	'use strict';

	angular.module('app.register')
	.controller('RegisterCtrl',RegisterCtrl);

	/** @ngInject */
	function RegisterCtrl($rootScope, $scope, $state, $ngBootbox, userService, authService, currentAuth, appUtils, toaster, appSettingService){
        $rootScope.settings.layout.showSmartphone = false;
        $rootScope.settings.layout.showPageHead = true;
        $rootScope.settings.layout.guestPage = true;
        var vm = this;// jshint ignore:line
        
		vm.showInvalid = false;
		$scope.emailRegx = /^[^!'"\/ ]+$/;
		$scope.passwordRegx =/^(?=.*[0-9]+.*)(?=.*[a-zA-Z]+.*)[0-9a-zA-Z]{6,12}$/;
		$scope.nameRegx = /^(a-z|A-Z|0-9)*[^!#$%^&*()'"\/\\;:@=+,?\[\]\/]*$/;
		$scope.addressRegx = /^(a-z|A-Z|0-9)*[^!$%^&*()'"\/\\;:@=+,?\[\]]*$/;
		$scope.zipcodeRegx = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
		vm.states = appUtils.getAllState();
		vm.user = {
			firstName: '',
			lastName: '',
			email: '',
			phoneNumber: '',
			userRoles: '',
			photoURL : '',
			state: '',
			city: '',
			address: '',
			zipCode:'',
			isAuthorized: true,
			isDeleted: false,
			timestampCreated: '',
			timestampModified: '',
			password : '',
			confirmPassword : ''
		};

		//Functions
		vm.create = function(form){
			appUtils.showLoading();
			vm.showInvalid = true;
			if(form.$invalid){
				return;
			}

			// check password
			var pvalid = $scope.passwordRegx.test(vm.user.password);
			if(!pvalid){
				$ngBootbox.alert('Password must be 6-12 characters long and include at least one letter and one number. Passwords are case sensitive.');
			    return;		
			}

			var onSuccess = function(res){
				if(!res || !res.result){
					appUtils.hideLoading();
					$ngBootbox.alert(res.errorMsg);
				    return;	
				}
                var loginVm = {
                    userName: vm.user.email,
                    password: vm.user.password
                };
				//Add more info of user in firebase
				delete vm.user.password;
				delete vm.user.confirmPassword;

                //Assign role for member
                var userRoles = ["-L1RFG7CNHThFmm5jHk2"];//Member role
                console.log('-----------userRoles');
                console.log(userRoles);
                vm.user.userRoles = userRoles;

				userService.createUser(vm.user, res.uid).then(function(res){
					if(!res.result){				
						$ngBootbox.alert(res.errorMsg);
						return;
					}
					toaster.pop('success','Success', "Account Created.");
					appUtils.hideLoading();
                    
                    //Logout current user
                    authService.logout();
                    delete $rootScope.storage.roles;
                    delete $rootScope.storage.permissions;
                    delete $rootScope.storage.currentUser;
                    appUtils.showLoading();
                    console.log('-----------loginVm');
                    console.log(loginVm);
                    authService.login(loginVm).then(function(result) {
                        console.log('----------result');
                        console.log(result);
                        if (result) {
                            authService.getUserInfo(result.uid).then(function(user){
                        console.log('----------getUserInfo');
                        console.log(user);
                                user.$id = result.uid;
                                $rootScope.storage.currentUser = user;
                                console.log('-------0 $rootScope.storage.currentUser');
                                console.log($rootScope.storage.currentUser);
                                appSettingService.getSettings().then(function(optionRs){
                                    $rootScope.storage.appSettings = optionRs;
                                });
                                // window.location.href = '/#/transaction';
                                $rootScope.settings.layout.showPageHead = false;
                                $rootScope.settings.layout.showSideBar = true;
                                $rootScope.settings.layout.showHeader = true;
                                $rootScope.settings.layout.showSmartphone = true;

                                var dashboardUrl = '/#/transaction';
                                window.location.href = dashboardUrl;
                                
                            }).catch(function(error) {
                            });
                        }
                    }).catch(function(error) {
                    });
				}, function(res){
					$ngBootbox.alert(res.errorMsg);
					return;
				});
			};//on Success

			var onFail = function(res){
				$ngBootbox.alert(res.errorMsg);
				appUtils.hideLoading();
			    return;
			};

			//check phone number exists
			var isPhoneExistReq = userService.checkPhoneExist(vm.user.phoneNumber).then(function(res){
				if(res.data !== null && res.data.length >= 1) {
					$ngBootbox.alert("Phone number already exists. Please enter another.");
					appUtils.hideLoading();
				   	return true;			
				 }//Phone exists.
				 return false;

			}, onFail);
			
			userService.checkUserIsDeleted(vm.user.email).then(function(res){
				if(res === null){
                    //Create auth user in firebase
                    authService.createUserWithEmail(vm.user).then(onSuccess, onFail);
				}else{
					appUtils.hideLoading();
					$ngBootbox.confirm('The user has been archived. Do you want to restore that user now ?').then(function(){
						userService.restoreUser(res.$id).then(function(resRestore){
							if(resRestore.result){
								userService.get(res.$id).$loaded().then(function(userData){
									$state.go('user.details', {id: res.$id});
								});
							}
						});
					});
				}
			});
		};

	}

})();
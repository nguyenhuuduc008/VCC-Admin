(function(){
	'use strict';

	angular.module("app.user")
	.controller("addUserCtrl" , addUserCtrl);
	/** @ngInject **/
	function addUserCtrl($rootScope, $scope, $state,$ngBootbox, userService, authService, currentAuth,appUtils, toaster){
		$rootScope.settings.layout.showSmartphone = false;
		$rootScope.settings.layout.showPageHead = true;
        $rootScope.settings.layout.guestPage = false;
        if($rootScope.reProcessSideBar){
            $rootScope.reProcessSideBar = false;
        }

		var userAddVm = this; // jshint ignore:line
		userAddVm.showInvalid = false;
		$scope.emailRegx = /^[^!'"\/ ]+$/;
		$scope.passwordRegx =/^(?=.*[0-9]+.*)(?=.*[a-zA-Z]+.*)[0-9a-zA-Z]{6,12}$/;
		$scope.nameRegx = /^(a-z|A-Z|0-9)*[^!#$%^&*()'"\/\\;:@=+,?\[\]\/]*$/;
		$scope.addressRegx = /^(a-z|A-Z|0-9)*[^!$%^&*()'"\/\\;:@=+,?\[\]]*$/;
		$scope.zipcodeRegx = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
		userAddVm.states = appUtils.getAllState();
		userAddVm.user = {
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
		userAddVm.create = function(form){
			appUtils.showLoading();
			userAddVm.showInvalid = true;
			if(form.$invalid){
				return;
			}

			// check password
			var pvalid = $scope.passwordRegx.test(userAddVm.user.password);
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
				//Add more info of user in firebase
				delete userAddVm.user.password;
				delete userAddVm.user.confirmPassword;

				userService.createUser(userAddVm.user,res.uid).then(function(res){
					if(!res.result){				
						$ngBootbox.alert(res.errorMsg);
						return;
					}
					toaster.pop('success','Success', "Account Created.");
					appUtils.hideLoading();

					//Delete users List storage
					//delete $rootScope.storage.usersList;
					//create succces go to edit view
					//$rootScope.reProcessSideBar = true;
					$state.go('user.details', {id: res.data});		
				}, function(res){
					$ngBootbox.alert(res.errorMsg);
					appUtils.hideLoading();
					return;
				});
			};//on Success

			var onFail = function(res){
				$ngBootbox.alert(res.errorMsg);
				appUtils.hideLoading();
			    return;
			};

			//check phone number exists
			var isPhoneExistReq = userService.checkPhoneExist(userAddVm.user.phoneNumber).then(function(res){
				if(res.data !== null && res.data.length >= 1) {
					$ngBootbox.alert("Phone number already exists. Please enter another.");
					appUtils.hideLoading();
				   	return true;			
				 }//Phone exists.
				 return false;

			}, onFail);
			
			userService.checkUserIsDeleted(userAddVm.user.email).then(function(res){
				if(res === null){
					// isPhoneExistReq.then(function(res){
					// 	if(res){	
					// 		return;
					// 	}
						//Create auth user in firebase
						authService.createUserWithEmail(userAddVm.user).then(onSuccess, onFail);
					// });	
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

		userAddVm.cancel = function(form){
			$state.go('user.list');
		};
	}
})();

(function(){
	'use strict';

	angular.module("app.customer")
	.controller("customerDetailsCtrl" , customerDetailsCtrl);
	/** @ngInject */
	function customerDetailsCtrl($q,$rootScope,$timeout, $scope, $state,$stateParams,$ngBootbox,$uibModal,appUtils,customerService, customerGroupsService,authService,notificationService,toaster,usersSubcribeService){
		$rootScope.settings.layout.showSmartphone = false;
		if($rootScope.reProcessSideBar){
            $rootScope.reProcessSideBar = false;
        }
		var customerDetailVm = this ; // jshint ignore:line
		customerDetailVm.currentUser = $rootScope.storage.currentUser;
		customerDetailVm.customer = {
			firstName: '',
			lastName: '',
			email: '',
			billingAddress: {
				address: '',
				state: '',
				zipCode: '',
				city: ''
			},
			shippingAddress: {
				address: '',
				state: '',
				zipCode: '',
				city: ''
			},
			phoneNumber: '',
			isActive: true,
			isDeleted: false,
			lastOrderDate: '',
			lastLoginDate: '',
			timestampCreated: '',
			timestampModified: '',
			isUser: false
		};
		
        $scope.groups = [];// List groups for select2
        customerDetailVm.objectDatas = {
            groups: []// Selected groups in selecte2
        };

		customerDetailVm.customer.$id = $stateParams.id;
		$scope.isEdit = false;
		$scope.emailRegx = /^[^!'"\/ ]+$/;
		$scope.passwordRegx =/^(?=.*[0-9]+.*)(?=.*[a-zA-Z]+.*)[0-9a-zA-Z]{6,12}$/;
		$scope.nameRegx = /^(a-z|A-Z|0-9)*[^!#$%^&*()'"\/\\;:@=+,?\[\]\/]*$/;
		$scope.addressRegx = /^(a-z|A-Z|0-9)*[^!$%^&*()'"\/\\;:@=+,?\[\]]*$/;
		$scope.zipcodeRegx = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
		customerDetailVm.showInvalid = true ;
		customerDetailVm.showShippingAddress = false;
		customerDetailVm.showGroups = true;
		customerDetailVm.states = appUtils.getAllState();
		var customerPhone = '';
		customerDetailVm.e_msges = {};
		
		customerDetailVm.cancel = cancel;
		customerDetailVm.enalblePhoneForm = enalblePhoneForm;
		customerDetailVm.initPage = initPage;
		customerDetailVm.saveEdit = saveEdit;
		customerDetailVm.isSubscribed = false;
		initPage();

		// $scope.$watch('customerDetailVm.customer.country', function(val){
		// 	statesService.getStates(val).then(function(data){
		// 		customerDetailVm.states = data;
		// 	});
        // });
	
		//===============================================
		//Functions
		function initPage(){
			appUtils.showLoading();
			if(customerDetailVm.customer.$id){
				$scope.isEdit = true;
				customerService.getFull(customerDetailVm.customer.$id).$loaded().then(function(result){
					if(result){
						customerDetailVm.objectDatas.groups = result.groups;
						appUtils.hideLoading();
						getCustomerInfo(result);
						usersSubcribeService.getusersSubcribeService(result.email).then(function (usersSubcribeResult){
							if(usersSubcribeResult && result.email == usersSubcribeResult.email){
								customerDetailVm.isSubscribed = true;
							}
						});
						if(result.shippingAddress){
							customerDetailVm.showShippingAddress = checkShippingAddress(result.shippingAddress);
						}
						return;
					}	
				});	
			}else{
				appUtils.hideLoading();
				$scope.isEdit = false;
				customerDetailVm.customer.password = '';
				customerDetailVm.customer.confirmPassword = '';
				customerDetailVm.showInvalid = false;
			}
			
			customerGroupsService.items().$loaded().then(function(groups){
				$scope.groups = groups;
			});
			//loadData();
		}

		// function loadData(){
		// 	 customerDetailVm.countries = countriesService.list();
		// }

		function getCustomerInfo(result){
			customerDetailVm.customer = result;
			customerDetailVm.dataLetterPic =  customerDetailVm.customer.firstName.charAt(0).toUpperCase() + customerDetailVm.customer.lastName.charAt(0).toUpperCase();  
			customerPhone =  customerDetailVm.customer.phoneNumber;
			customerDetailVm.Phone = customerDetailVm.customer.phoneNumber;
			customerDetailVm.showInvalid = true;
		}
		
		function checkPhoneExists(form){
			/* jshint ignore:start */
			var deferred = $q.defer();
			var req = customerService.checkPhoneExist(customerDetailVm.Phone);
			req.then(function(res){
				appUtils.hideLoading();
				if(res.data !== null && res.data.length >= 1) { 
					if(customerPhone != customerDetailVm.Phone){
						form.phonenumber.$setValidity('server',false);
						customerDetailVm.e_msges['phonenumber'] = "Phone number already exists. Please enter another.";
						deferred.resolve({result: true});
						return deferred.promise;
					}
				 }//Phone exists.
				deferred.resolve({result: false});
				return deferred.promise;
			}, function(res){
				// show not found error
				form.phonenumber.$setValidity('server',false);
				customerDetailVm.e_msges['phonenumber'] = "Phone number already exists. Please enter another.";
				deferred.resolve({result: true});
			});
			/* jshint ignore:end */
			return deferred.promise;
		}
		
		function update(form){
			appUtils.showLoading();
			customerDetailVm.showInvalid = true;
			if(form.$invalid){
				appUtils.hideLoading();
				return;
			}

			customerDetailVm.customer.groups = customerDetailVm.objectDatas.groups;//Set groups
			checkPhoneExists(form).then(function(checkPhoneExistsRs){
				if(!checkPhoneExistsRs.result){
					customerDetailVm.customer.phoneNumber = $.trim(customerDetailVm.Phone) === '' ? ' ' : customerDetailVm.Phone;
					var req = customerService.update(customerDetailVm.customer);
					req.then(function(res){
						if(!res.result){
							appUtils.hideLoading();
							$ngBootbox.alert(res.errorMsg);
							return;
						}

						//Delete users List storage
						delete $rootScope.storage.usersList;
						appUtils.hideLoading();
						toaster.pop('success','Success', "Customer Info Updated.");
						customerPhone = customerDetailVm.customer.phoneNumber;
						//Set new value for current user of local storage
						// if(customerDetailVm.currentUser.$id == customerDetailVm.customer.$id){
						// 	appUtils.transformObject(customerDetailVm.currentUser, customerDetailVm.customer);
						// }
					});
				}
			});
		}
		
		function saveEdit(form){
			if($scope.isEdit){
				update(form);
			}else{
				create(form);
			}
		}

		function create(form){
			appUtils.showLoading();
			customerDetailVm.showInvalid = true;
			if(form.$invalid){
				appUtils.hideLoading();
				return;
			}

			// check password
			var pvalid = $scope.passwordRegx.test(customerDetailVm.customer.password);
			if(!pvalid){
				appUtils.hideLoading();
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
				delete customerDetailVm.customer.password;
				delete customerDetailVm.customer.confirmPassword;
				delete customerDetailVm.customer.$id;
				customerDetailVm.customer.groups = customerDetailVm.objectDatas.groups;//Set groups
				customerService.create(customerDetailVm.customer, res.uid).then(function(res){
					if(!res.result){				
						$ngBootbox.alert(res.errorMsg);
						return;
					}
					toaster.pop('success','Success', "Account Created.");
					appUtils.hideLoading();
					//send welcome email
					var notiObj = {
						subject: 'Welcome To Smartcare Citizens',
						recipient : customerDetailVm.customer.email,
						firstName : customerDetailVm.customer.firstName,
						lastName  : customerDetailVm.customer.lastName,
						event: 'welcome',
						channel: 'email'
					};

					notificationService.create(notiObj);
					//Delete users List storage
					//delete $rootScope.storage.usersList;
					//create succces go to edit view
					//$rootScope.reProcessSideBar = true;
					$state.go('customer.details', {id: res.data});		
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
			var isPhoneExistReq = customerService.checkPhoneExist(customerDetailVm.customer.phoneNumber).then(function(res){
				if(res.data !== null && res.data.length >= 1) {
					$ngBootbox.alert("Phone number already exists. Please enter another.");
					appUtils.hideLoading();
				   	return true;			
				 }//Phone exists.
				 return false;

			}, onFail);
			
			customerService.checkCustomerIsDeleted(customerDetailVm.customer.email).then(function(res){
				if(res === null){
					isPhoneExistReq.then(function(res){
						if(res){	
							return;
						}
						//Create auth user in firebase
						authService.createUserWithEmail(customerDetailVm.customer).then(onSuccess, onFail);
					});	
				}else{
					appUtils.hideLoading();
					$ngBootbox.alert('The user ' + customerDetailVm.customer.email + ' has been archived. Please contact MCM Admin.');
					return;
					// .then(function(){
					// 	customerService.restore(res.$id).then(function(resRestore){
					// 		if(resRestore.result){
					// 			customerService.get(res.$id).$loaded().then(function(cusData){
					// 				//send welcome email
					// 				var notiObj = {
					// 					subject: 'Welcome To Smartcare Citizens',
					// 					recipient : cusData.email,
					// 					firstName : cusData.firstName,
					// 					lastName  : cusData.lastName,
					// 					event: 'welcome',
					// 					channel: 'email'
					// 				};

					// 				notificationService.create(notiObj);
					// 				$state.go('customer.details', {id: res.$id});
					// 			});
					// 		}
					// 	});
					// });
				}
			});
		}

		function enalblePhoneForm(form){
			/* jshint ignore:start */
			form.phonenumber.$setValidity('server', true);
			customerDetailVm.e_msges['phonenumber'] = "";
			/* jshint ignore:end */
		}

		function checkShippingAddress(shipping){
			return (shipping.address !== '' || shipping.city !== '' || shipping.zipCode !== '' || shipping.state !== '');
		}
		
		function cancel(){
			$state.go('customer.list');
		}

		customerDetailVm.resetPassword = function(){
			$ngBootbox.confirm('Are you sure want to reset password?').then(function(){
				appUtils.showLoading();
				authService.resetPasswordAuth(customerDetailVm.customer.email).then(function(){
					toaster.pop('success','Success', "Your request reset password has been sent to " + customerDetailVm.customer.email + "!");
					appUtils.hideLoading();
				}).catch(function(error) {
					toaster.pop('error','Error', error);
					appUtils.hideLoading();
				});
			});
		};

	}

})();

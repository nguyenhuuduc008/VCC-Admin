(function(){
	'use strict';

	angular.module("app.user")
	.controller("editUserCtrl" , editUserCtrl);
	/** @ngInject */
	function editUserCtrl($q,$rootScope,$timeout, $scope, $state,$stateParams,$ngBootbox,$uibModal,appUtils,userService,roleService,permissionService, authService,toaster){
		$rootScope.settings.layout.showSmartphone = false;
		$rootScope.settings.layout.showPageHead = true;
        $rootScope.settings.layout.guestPage = false;
		if($rootScope.reProcessSideBar){
            $rootScope.reProcessSideBar = false;
        }
		var userDetailVm = this ; // jshint ignore:line
		userDetailVm.currentUser = $rootScope.storage.currentUser;
		userDetailVm.user = {};
		userDetailVm.user.$id = $stateParams.id;
		$scope.zipcodeRegx = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
		$scope.nameRegx = /^(a-z|A-Z|0-9)*[^!#$%^&*()'"\/\\;:@=+,?\[\]\/]*$/;
		$scope.addressRegx = /^(a-z|A-Z|0-9)*[^!$%^&*()'"\/\\;:@=+,?\[\]]*$/;
		userDetailVm.showInvalid = true;
		var userPhone = '';
		userDetailVm.e_msges = {};
		userDetailVm.userRoles = [];
		userDetailVm.states = appUtils.getAllState();
		var roles = [];

		roleService.items().$loaded().then(function(data){
			roles = data;
		});
		
		//Load Data
		function loadUserDetails(){
			appUtils.showLoading();
			userService.get(userDetailVm.user.$id).$loaded().then(function(result){
				if(result){
					appUtils.hideLoading();
					setUser(result);
					return;
				}	
			});	
		}

		function setUser(result){
			userDetailVm.user = result;
			userDetailVm.dataLetterPic =  userDetailVm.user.firstName.charAt(0).toUpperCase() + userDetailVm.user.lastName.charAt(0).toUpperCase(); //userDetailVm.user.email.charAt(0).toUpperCase();// Handle avatar    
			userPhone =  userDetailVm.user.phoneNumber;
			userDetailVm.Phone = userDetailVm.user.phoneNumber;
			appUtils.getImageFBUrl(userDetailVm.user.photoURL).then(function(data){
				userDetailVm.profileImage = data.imgUrl;
			});
			//Get UserRole Info
			loadRoles();
		}
		
		function loadRoles(){
			//Get UserRole Info
			userDetailVm.userRoles = [];
			var userRoles = userDetailVm.user.userRoles;
			if(userRoles !== null && userRoles !== undefined && userRoles.length > 0){
				_.forEach(userRoles, function(roleId, key) {
					var role = _.find(roles, {$id: roleId});
					if(role){
						var item = role;
						item.permissionstxt = '';
						permissionService.getPermissionByRole(item.$id).then(function(res){
	                    var permissions = [];
		                    if(res.length > 0){
		                        _.forEach(res, function(val, key) {
		                            permissions.push(val.name);                 
		                        });
		                        item.permissionstxt = angular.fromJson(permissions).join(', ');
		                    }
	                	});

	                	userDetailVm.userRoles.push(item);
					}	                 
	            });
			}
		}

		//Private Functions
		function checkPhoneExists(form){
			/* jshint ignore:start */
			var deferred = $q.defer();
			var req = userService.checkPhoneExist(userDetailVm.Phone);
			req.then(function(res){
				appUtils.hideLoading();
				if(res.data !== null && res.data.length >= 1) { 
					if(userPhone != userDetailVm.Phone){
						form.phonenumber.$setValidity('server',false);
						userDetailVm.e_msges['phonenumber'] = "Phone number already exists. Please enter another.";
						deferred.resolve({result: true});
						return deferred.promise;
					}
				 }//Phone exists.
				deferred.resolve({result: false});
				return deferred.promise;
			}, function(res){
				// show not found error
				form.phonenumber.$setValidity('server',false);
				userDetailVm.e_msges['phonenumber'] = "Phone number already exists. Please enter another.";
				deferred.resolve({result: true});
			});
			/* jshint ignore:end */
			return deferred.promise;
		}
		
		function updateUser(){
			appUtils.showLoading();
			var req = userService.updateUser(userDetailVm.user);
			req.then(function(res){
				if(!res.result){
					appUtils.hideLoading();
					$ngBootbox.alert(res.errorMsg.message);
					return;
				}
				//Delete users List storage
				delete $rootScope.storage.usersList;
				appUtils.hideLoading();
				toaster.pop('success','Success', "Account Updated.");
				userPhone = userDetailVm.user.phoneNumber;
				//Set new value for current user of local storage
				if(userDetailVm.currentUser.$id == userDetailVm.user.$id){
					appUtils.transformObject(userDetailVm.currentUser, userDetailVm.user);
				}
			});
		}
		
		//Functions
		userDetailVm.saveEdit = function(form){
			appUtils.showLoading();
			userDetailVm.showInvalid = true;
			if(form.$invalid){
				return;
			}

			// checkPhoneExists(form).then(function(checkPhoneExistsRs){
			// 	if(!checkPhoneExistsRs.result){
					userDetailVm.user.phoneNumber = $.trim(userDetailVm.Phone) === '' ? ' ' : userDetailVm.Phone;
					updateUser();
			// 	}
			// });
		};

		userDetailVm.EnalblePhoneForm = function(form){
			/* jshint ignore:start */
			form.phonenumber.$setValidity('server', true);
			userDetailVm.e_msges['phonenumber'] = "";
			/* jshint ignore:end */
		};

		// userDetailVm.changeAvatar = function(form){
		// 	appUtils.showLoading();
		// 	var file = $('#file')[0].files[0];
		// 	// Create the file metadata
		// 	var metadata = {
		// 	  contentType: 'image/jpeg'
		// 	};
		// 	// Upload file and metadata to the object 'images/mountains.jpg'
		// 	var uploadTask = mediaService.uploadFile('images/user_profile/', file, metadata);// Listen for state changes, errors, and completion of the upload.
		// 	uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
		// 	  function(snapshot) {
		// 	    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
		// 	    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
		// 	    console.log('Upload is ' + progress + '% done');
		// 	  }, function(error) {
		// 	  switch (error.code) {
		// 	    case 'storage/unauthorized':
		// 	      // User doesn't have permission to access the object
		// 		  appUtils.hideLoading();
		// 	      $ngBootbox.alert(error.error);
		// 	      break;

		// 	    case 'storage/canceled':
		// 	      // User canceled the upload
		// 		  appUtils.hideLoading();
		// 	      $ngBootbox.alert(error.error);
		// 	      break;

		// 	    case 'storage/unknown':
		// 	      // Unknown error occurred, inspect error.serverResponse
		// 		  appUtils.hideLoading();
		// 	      $ngBootbox.alert(error.error);
		// 	      break;
		// 	  }
		// 	}, function() {
		// 	  // Upload completed successfully, now we can get the download URL
		// 	  appUtils.hideLoading();
		// 	  var downloadUrl = uploadTask.snapshot.downloadURL;

		// 	  //Update User Details
		// 	  userDetailVm.user.photoURL = downloadUrl;
        //       if(userDetailVm.currentUser.$id == userDetailVm.user.$id){
        //           $('#header-img-profile img').attr('src',downloadUrl + '');
        //       }

		// 	  updateUser();
		// 	  $timeout(function(){
		// 			loadUserDetails();
		// 			$('a.fileinput-exists').click();
		// 		},0);
		// 	});
		// };

		userDetailVm.removeRole = function(index){
			 userDetailVm.userRoles.splice(index, 1);
		};

		userDetailVm.loadData = function(){
			loadUserDetails();
		};

		userDetailVm.showPopupAddUserToRole = function(){
			 var modalInstance = $uibModal.open({
				templateUrl: 'app/user/user_role/add-user-role.tpl.html',
				controller: 'userRoleCtrl as userRoleVm',
                size: 'lg',
                scope: $scope,
				backdrop: 'static',
                resolve: {
			        user: function () {
			           return userDetailVm.user;
			        }
		        }
			});
		};

		userDetailVm.cancelChangeUserRoles = function(index){
			userDetailVm.cancel();
		};

		userDetailVm.saveChangeRole = function(){
			appUtils.showLoading();
			var updateUser = userDetailVm.user;
			var newRoles = [];
			_.forEach(userDetailVm.userRoles, function(val, key) {
                newRoles.push(val.$id);                 
            });
			updateUser.userRoles= newRoles;
			var req = userService.updateUser(updateUser);
			req.then(function(res){
				if(!res.result){
					appUtils.hideLoading();
					$ngBootbox.alert(res.errorMsg);
					return;
				}
				//Delete users List storage
				delete $rootScope.storage.usersList;
				
				//Delete Side Bar Menus List storage
				if(userDetailVm.currentUser.$id == userDetailVm.user.$id){
                   delete $rootScope.storage.sidebarMenus;
              	}

				appUtils.hideLoading();
				toaster.pop('success','Success', "Change User Roles Successfully!");
				$timeout(function(){
					loadUserDetails();
				},0);
			});
		};

		userDetailVm.loadUserDetails = function(){
			loadUserDetails();
		};

		userDetailVm.resetPassword = function(){
			$ngBootbox.confirm('Are you sure want to reset password?').then(function(){
				appUtils.showLoading();
				authService.resetPasswordAuth(userDetailVm.user.email).then(function(){
					toaster.pop('success','Success', "Your request reset password has been sent to " + userDetailVm.user.email + "!");
					appUtils.hideLoading();
				}).catch(function(error) {
					toaster.pop('error','Error', error);
					appUtils.hideLoading();
				});
			});
		};

		userDetailVm.cancel = function(){
			$state.go('user.list');
		};

		loadUserDetails();
	}

})();

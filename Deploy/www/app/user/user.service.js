(function() {
	'use strict';

	angular.module('app.user')
	.factory('userService' ,userService);

	/** @ngInject **/
	function userService(firebaseDataRef, $firebaseObject, appUtils, $q, storageRef, $firebaseArray, $rootScope,$filter, customerService){
		var service = {
			getAll: getAll,
			get: get,
			getUserByEmail : getUserByEmail,
			createUser: create,
            updateUser: update,
            deleteUser: deleteUser,
            restoreUser : restoreUser,
            checkPhoneExist : checkPhoneExist,
            unAuthorizedUser: unAuthorizedUser,
            authorizedUser: authorizedUser,
            addUserToRole: addUserToRole,
            search: search,
            checkUserIsDeleted: checkUserIsDeleted,
			insertState : insertState
		};

		var userRef = firebaseDataRef.child('users');

		return service;

		function getAll(){
			return $firebaseArray(userRef);
		}

		function get(id){
			var ref = userRef.child(id);
			return $firebaseObject(ref);
		}

		
		function getUserByEmail(email){
			return $firebaseArray(userRef).$loaded().then(function(data){
                userRef.onDisconnect();
				var user =  _.find(data, {email: email});
				if(user && (!user.isDeleted || user.isDeleted === '')){
					return user;
				}
				return null;
			});	
		}

		function create(user,uid){
			var ts = appUtils.getTimestamp();
			user.timestampModified = ts;
			user.timestampCreated = ts;
            return userRef.child(uid).set(user).then(function(res){
				//add customer info
				return createCustomer(user,uid);
            }).catch(function(error) {
		        return {result: false , errorMsg: error};
		    });
		}

		function createCustomer(user, uid){
			var customer = {
				firstName: user.firstName || '',
				lastName: user.lastName || '',
				email: user.email || '',
				billingAddress: {
					address: user.address || '',
					state: user.state || '',
					zipCode: user.zipCode || '',
					city: user.city || ''
				},
				shippingAddress: {
					address: user.address || '',
					state: user.state || '',
					zipCode: user.zipCode || '',
					city: user.city || ''
				},
				phoneNumber: user.phoneNumber || '',
				isActive: true,
				isDeleted: false,
				lastOrderDate: '',
				lastLoginDate: '',
				timestampCreated: user.timestampCreated || '',
				timestampModified: user.timestampModified || '',
				isUser: true
			};
			return customerService.create(customer,uid).then(function(res){
                return {result: true , data: uid};
            }).catch(function(error) {
		        return {result: false , errorMsg: error};
		    });
		}

        function update(user){
			var ts = appUtils.getTimestamp(),
			key = user.$id;
			user.timestampModified = ts;
			console.log('user');
			console.log(user);
			console.log(key);
            return userRef.child(key).update({
				isAuthorized: user.isAuthorized, 
				firstName: user.firstName,
				lastName: user.lastName,
				userRoles: user.userRoles || {},
				phoneNumber: user.phoneNumber,
				address: user.address,
				city: user.city,
				state: user.state,
				zipCode: user.zipCode,
				timestampModified: ts}).then(function(res){
                return updateCustomer(user,key);
            }).catch(function(error) {
				console.log(error);
		        return {result: false , errorMsg: error};
		    });
		}

		function updateCustomer(userInfo, uid){
			var customerRef = firebaseDataRef.child("customers/" + uid);
			console.log('customerRef');
			console.log(customerRef);
			return $firebaseObject(customerRef).$loaded().then(function(customer){
				console.log('customer');
				console.log(customer);
				if(customer.$value !== undefined && customer.$value === null){
					return createCustomer(userInfo, uid);
				}else{
					customer.firstName= userInfo.firstName;
					customer.lastName= userInfo.lastName;
					customer.phoneNumber= userInfo.phoneNumber;
					customer.billingAddress = {
						address: userInfo.address || '',
						state: userInfo.state || '',
						zipCode: userInfo.zipCode || '',
						city: userInfo.city || ''
					};
					customer.shippingAddress= {
						address: userInfo.address || '',
						state: userInfo.state || '',
						zipCode: userInfo.zipCode || '',
						city: userInfo.city || ''
					};
					customer.isActive= userInfo.isAuthorized;
					customer.isUser = true;
					return customerService.update(customer).then(function(res){
						return {result: true , data: uid};
					}).catch(function(error) {
						console.log(error);
						return {result: false , errorMsg: error};
					});
				}
			}).catch(function(error) {
				console.log(error);
				return {result: false , errorMsg: error};
			});
		}

        function deleteUser(uid){
			var ts = appUtils.getTimestamp();
            return userRef.child(uid).update({isDeleted: true, timestampModified: ts}).then(function(res){
				var customerRef = "customers/" + uid;
				firebaseDataRef.child(customerRef).update({
					isDeleted: true,
				});	
                return {result: true};
            }).catch(function(error) {
		        return {result: false , errorMsg: error};
		    });
		}

        function restoreUser(uid){
			var ts = appUtils.getTimestamp();
            return userRef.child(uid).update({isDeleted: false, timestampModified: ts}).then(function(res){
				var customerRef = "customers/" + uid;
				firebaseDataRef.child(customerRef).update({
					isDeleted: false,
				});	
                return {result: true};
            }).catch(function(error) {
		        return {result: false , errorMsg: error};
		    });
		}

        function checkPhoneExist(phone){
			if($.trim(phone) ===''){
				return $q.when({data: []});
			}
            return $firebaseArray(userRef).$loaded().then(function(data){
                userRef.onDisconnect();
                var user = _.filter(data, function(item) { 
                    return item.phoneNumber === phone && (item.isDeleted === false || item.isDeleted === '' || item.isDeleted === undefined);
                });
			    return {data: user};
            });
		}

        function unAuthorizedUser(uid){
			var ts = appUtils.getTimestamp();
            return userRef.child(uid).update({isAuthorized: false, timestampModified: ts}).then(function(res){
				var customerRef = "customers/" + uid;
				firebaseDataRef.child(customerRef).update({
					isActive: false,
				});	
                return {result: true};
            }).catch(function(error) {
		        return {result: false , errorMsg: error};
		    });
		}

        function authorizedUser(uid){
			var ts = appUtils.getTimestamp();
            return userRef.child(uid).update({isAuthorized: true, timestampModified: ts}).then(function(res){
				var customerRef = "customers/" + uid;
				firebaseDataRef.child(customerRef).update({
					isActive: true,
				});	
                return {result: true};
            }).catch(function(error) {
		        return {result: false , errorMsg: error};
		    });
		}

		function addUserToRole(userIds, roleName){
            _.forEach(userIds, function(uid){
                var ref = userRef.child(uid);
			    $firebaseObject(ref).$loaded().then(function(res){
                    ref.onDisconnect();
 					if(res){
 						if(res.userRoles !== undefined && res.userRoles.length > 0){
 							var isExistRole = $.inArray(roleName,res.userRoles); 
	 						if(isExistRole === -1){
	 							res.userRoles.push(roleName);
	 							res.$save();
	 						}  	
 						}else{
 							res.userRoles = [];
 							res.userRoles.push(roleName);
	 						res.$save();
 						}	
 						
 					}
 				});
            });
		 }

		 function search(keyword, isAdmin){
			return $firebaseArray(userRef).$loaded().then(function(data){
                userRef.onDisconnect();
				var searchFields = ['email','phoneNumber'];
				return $filter('filter')(data, function (item) {
					for(var index in searchFields) {
						var attr = searchFields[index];
						if ((searchMatch(item[attr] + '', keyword) || searchMatch(item.firstName + ' ' + item.lastName, keyword)) && (!item.isDeleted || item.isDeleted === '') && (isAdmin && item.userRoles ? item.userRoles.indexOf('-KTlccaZaxPCGDaFPSc5') !== -1 : true)){
							return true;
						}
					}
					return false;
				});
			});
		 }

		 function searchMatch(haystack, needle) {
			if (!needle) {
				return true;
			}
			return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
		 }

		 function checkUserIsDeleted(email){
			return $firebaseArray(userRef).$loaded().then(function(data){
                userRef.onDisconnect();
				var user =  _.find(data, {email: email});
				if(user && user.isDeleted){
					return user;
				}
				return null;
			});			
		 }

		 function insertState(){
			 var lst = appUtils.getAllState();
			 var reqs = [];
			 var stateRef = firebaseDataRef.child('countries');
			var obj = {
				code: 231,
				name: 'United States',
				iso: 'US'
			};

			 reqs.push(stateRef.child('231').set(obj));

			 return $q.all(reqs);
		 }
	}
})();
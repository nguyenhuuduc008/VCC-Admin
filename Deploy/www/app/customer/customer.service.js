(function() {
	'use strict';

	angular.module('app.customer')
	.factory('customerService' ,customerService);


	/** @ngInject **/
	function customerService(firebaseDataRef, $firebaseObject, appUtils, $q, storageRef, searchService, $firebaseArray, $rootScope){
		var service = {
			get: get,
			getFull : getFull,
			create: create,
			update: update,
			search : search,
			search2 : search2,
			checkPhoneExist: checkPhoneExist,
			checkCustomerIsDeleted : checkCustomerIsDeleted,
			active: active,
			unActive: unActive,
			remove: remove,
			restore: restore
		};

		var customerRef = firebaseDataRef.child('customers'),
            customerSnapRef = firebaseDataRef.child('customers-snapshot');

		return service;

		function get(id){
			var ref = customerSnapRef.child(id);
			return $firebaseObject(ref);
		}

		function getFull(id){
			var ref = customerRef.child(id);
			return $firebaseObject(ref);
		}

		function create(customer, uid){
			var ts = appUtils.getTimestamp(),
			key = uid,
            snapData = {
				email: customer.email,
				firstName: customer.firstName,
				lastName: customer.lastName,
				keyword: customer.firstName + ' ' + customer.lastName + ' ' + customer.email + ' ' + customer.phoneNumber,
				phoneNumber: customer.phoneNumber,
				isDeleted : customer.isDeleted,
				isActive : customer.isActive,
				lastOrderDate : customer.lastOrderDate || '',
				lastLoginDate : customer.lastLoginDate || '',
				timestampModified: ts,
				customerId: key,
				isUser: customer.isUser || false
			};
			customer.timestampCreated = ts;
			customer.timestampModified = ts;
            //
			return customerRef.child(key).set(customer).then(function(res){
				var ref = customerRef.child(key + '/timestampCreated');
				return $firebaseObject(ref).$loaded().then(function(rs){
					ref.onDisconnect();
					customerSnapRef.child(rs.$value || ts).set(snapData);
                	return {result: true , data: key};
				});
            }, function(error){
				 return {result: false , msgError: error};
			});
		}

		function update(customer){
			var ts = appUtils.getTimestamp(),
			key = customer.$id;
            customer.timestampModified = ts;
            var customerUpdate =  customerRef.child(key).update({
				firstName: customer.firstName,
				lastName: customer.lastName,
				displayName: customer.firstName + ' ' + customer.lastName,
				phoneNumber: customer.phoneNumber,
				billingAddress: customer.billingAddress,
				shippingAddress: customer.shippingAddress,
				isActive: customer.isActive,
				isUser: customer.isUser || false,
				groups: customer.groups || [],
				timestampModified: ts}).then(function(res){
                return {result: true , data: key};
            }).catch(function(error) {
		        return {result: false , errorMsg: error};
		    });

			 var customerSnapUpdate =  customerSnapRef.child(customer.timestampCreated).update({
				firstName: customer.firstName,
				lastName: customer.lastName,
				keyword: customer.firstName + ' ' + customer.lastName + ' ' + customer.email + ' ' + customer.phoneNumber,
				phoneNumber: customer.phoneNumber,
				isDeleted : customer.isDeleted,
				isActive : customer.isActive,
				lastOrderDate : customer.lastOrderDate,
				lastLoginDate : customer.lastLoginDate,
				timestampModified: ts}).then(function(res){
                return {result: true , data: key};
            }).catch(function(error) {
		        return {result: false , errorMsg: error};
		    });

			var reqs = [customerUpdate, customerSnapUpdate];
			return $q.all(reqs).then(function(rs){
				if(rs[0].result && rs[1].result){
					return {result: true , data: rs[0].data};
				}
				return {result: false , errorMsg: rs[0].errorMsg || rs[1].errorMsg};
			});
		}

		function updateFromUser(customer){
			var ts = appUtils.getTimestamp(),
			key = customer.$id;
            customer.timestampModified = ts;
            var customerUpdate =  customerRef.child(key).update({
				firstName: customer.firstName,
				lastName: customer.lastName,
				phoneNumber: customer.phoneNumber,
				timestampModified: ts}).then(function(res){
                return {result: true , data: key};
            }).catch(function(error) {
		        return {result: false , errorMsg: error};
		    });

			 var customerSnapUpdate =  customerSnapRef.child(customer.timestampCreated).update({
				firstName: customer.firstName,
				lastName: customer.lastName,
				keyword: customer.firstName + ' ' + customer.lastName + ' ' + customer.email + ' ' + customer.phoneNumber,
				phoneNumber: customer.phoneNumber,
				timestampModified: ts}).then(function(res){
                return {result: true , data: key};
            }).catch(function(error) {
		        return {result: false , errorMsg: error};
		    });

			var reqs = [customerUpdate, customerSnapUpdate];
			return $q.all(reqs).then(function(rs){
				if(rs[0].result && rs[1].result){
					return {result: true , data: rs[0].data};
				}
				return {result: false , errorMsg: rs[0].errorMsg || rs[1].errorMsg};
			});
		}

		function checkPhoneExist(phone){
			if($.trim(phone) ===''){
				return $q.when({data: []});
			}
            return $firebaseArray(customerRef).$loaded().then(function(data){
                customerRef.onDisconnect();
                var customer = _.filter(data, function(item) { 
                    return item.phoneNumber === phone && (item.isDeleted === false || item.isDeleted === '' || item.isDeleted === undefined);
                });
			    return {data: customer};
            });
		}

		function remove(uid){
			var ref = customerRef.child(uid);
			return $firebaseObject(ref).$loaded().then(function(customer){
				ref.onDisconnect();
				var ts = appUtils.getTimestamp();
				var reqs = [];
				reqs.push(customerRef.child(uid).update({isDeleted: true, timestampModified: ts}).then(function(res){
					return {result: true};
				}).catch(function(error) {
					return {result: false , errorMsg: error};
				}));

				reqs.push(customerSnapRef.child(customer.timestampCreated).update({isDeleted: true, timestampModified: ts}).then(function(res){
					return {result: true};
				}).catch(function(error) {
					return {result: false , errorMsg: error};
				}));

				return $q.all(reqs).then(function(res){
					if(res[0].result && res[1].result){
						return true;
					}else if(!res[0].result && res[1].result){
						customerSnapRef.child(customer.timestampCreated).update({isDeleted: false, timestampModified: ts});
					}else if(res[0].result && !res[1].result){
						customerRef.child(uid).update({isDeleted: false, timestampModified: ts});
					}
					return false;
				});
			});
		}

        function restore(uid){
			var ref = customerRef.child(uid);
			return $firebaseObject(ref).$loaded().then(function(customer){
				ref.onDisconnect();
				var ts = appUtils.getTimestamp();
				var reqs = [];
				reqs.push(customerRef.child(uid).update({isDeleted: false, timestampModified: ts}).then(function(res){
					return {result: true};
				}).catch(function(error) {
					return {result: false , errorMsg: error};
				}));

				reqs.push(customerSnapRef.child(customer.timestampCreated).update({isDeleted: false, timestampModified: ts}).then(function(res){
					return {result: true};
				}).catch(function(error) {
					return {result: false , errorMsg: error};
				}));

				return $q.all(reqs).then(function(res){
					if(res[0].result && res[1].result){
						return true;
					}else if(!res[0].result && res[1].result){
						customerSnapRef.child(customer.timestampCreated).update({isDeleted: true, timestampModified: ts});
					}else if(res[0].result && !res[1].result){
						customerRef.child(uid).update({isDeleted: true, timestampModified: ts});
					}
					return false;
				});
			});
		}

		function active(uid){
			var ref = customerRef.child(uid);
			return $firebaseObject(ref).$loaded().then(function(customer){
				ref.onDisconnect();
				var ts = appUtils.getTimestamp();
				var reqs = [];
				reqs.push(customerRef.child(uid).update({isActive: true, timestampModified: ts}).then(function(res){
					return {result: true};
				}).catch(function(error) {
					return {result: false , errorMsg: error};
				}));

				reqs.push(customerSnapRef.child(customer.timestampCreated).update({isActive: true, timestampModified: ts}).then(function(res){
					return {result: true};
				}).catch(function(error) {
					return {result: false , errorMsg: error};
				}));

				return $q.all(reqs).then(function(res){
					if(res[0].result && res[1].result){
						return true;
					}else if(!res[0].result && res[1].result){
						customerSnapRef.child(customer.timestampCreated).update({isActive: false, timestampModified: ts});
					}else if(res[0].result && !res[1].result){
						customerRef.child(uid).update({isActive: false, timestampModified: ts});
					}
					return false;
				});
			});
		}

        function unActive(uid){
			var ref = customerRef.child(uid);
			return $firebaseObject(ref).$loaded().then(function(customer){
				ref.onDisconnect();
				var ts = appUtils.getTimestamp();
				var reqs = [];
				reqs.push(customerRef.child(uid).update({isActive: false, timestampModified: ts}).then(function(res){
					return {result: true};
				}).catch(function(error) {
					return {result: false , errorMsg: error};
				}));

				reqs.push(customerSnapRef.child(customer.timestampCreated).update({isActive: false, timestampModified: ts}).then(function(res){
					return {result: true};
				}).catch(function(error) {
					return {result: false , errorMsg: error};
				}));

				return $q.all(reqs).then(function(res){
					if(res[0].result && res[1].result){
						return true;
					}else if(!res[0].result && res[1].result){
						customerSnapRef.child(customer.timestampCreated).update({isActive: true, timestampModified: ts});
					}else if(res[0].result && !res[1].result){
						customerRef.child(uid).update({isActive: true, timestampModified: ts});
					}
					return false;
				});
			});
		}

		function checkCustomerIsDeleted(email){
			return $firebaseArray(customerRef).$loaded().then(function(data){
                customerRef.onDisconnect();
				var customer =  _.find(data, {email: email});
				if(customer && customer.isDeleted){
					return customer;
				}
				return null;
			});			
		 }

		function search(keyword, isAdmin){
			return $firebaseArray(customerSnapRef).$loaded().then(function(data){
                customerSnapRef.onDisconnect();
				return $filter('filter')(data, function (item) {
					for(var attr in searchFields) {
						if (searchMatch(item[attr] + '', keyword)&& item.isActive){
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

		 function search2(cri) {
			var result = {
				items: [],
				totalRecords: 0
			};

			var ref = customerSnapRef.orderByKey().startAt(cri.timestampStart + '').endAt(cri.timestampEnd + '').once("value");
					return ref.then(function (res) {
					var data = res.val();
					var records = [];
					if (data !== null) {
						var items = map(data, function (val, key) {
							val.$id = key;
							return val;
						});
						var rs = [];
						_.forEach(items, function (item, key) {
							//filter keyword
							var keywordFlag = false;
							if ($.trim(cri.keyword) ==='') {
								keywordFlag = true;
							} else {
								var itemKeyword = item.keyword ? item.keyword.toLowerCase() : '';
								var criKeyword = cri.keyword ? cri.keyword.toLowerCase() : '';
								keywordFlag = itemKeyword.includes(criKeyword);
							}
							if (keywordFlag === true && (!item.isDeleted || item.isDeleted === '') && (!item.isUser || item.isUser === '')) {
								var obj = {
									$id: item.customerId,
									timestampModified: item.timestampModified,
									timestampCreated: item.$id,
									fullName : item.firstName + ' ' + item.lastName,
									email: item.email,
									isActive : item.isActive,
									lastOrderDate: item.lastOrderDate,
									isDeleted: item.isDeleted,
									lastLoginDate: item.lastLoginDate,
									phoneNumber: item.phoneNumber
								};
								rs.push(obj);
							}
						});

						result.items = rs.sort(function (a, b) {
							return b.timestampCreated - a.timestampCreated;
						});

						result.totalRecords = rs.length;
					}
					
					return result;
			});
      	}

		//private function Search Customer
		function map(obj, cb) {
			var out = [];
			each(obj, function (v, k) {
			out.push(cb(v, k));
			});
			return out;
		}

		function each(obj, cb) {
			if (obj) {
			for (var k in obj) {
				if (obj.hasOwnProperty(k)) {
					var res = cb(obj[k], k);
					if (res === true) {
						break;
					}
				}
			}
			}
		}
		
	}
})();
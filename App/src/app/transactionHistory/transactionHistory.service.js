(function() {
	'use strict';

	angular.module('app.transactionHistory')
	.factory('transHistoryService' ,transactionHistory);

	/** @ngInject **/
	function transactionHistory(firebaseDataRef, $firebaseObject, appUtils, $q, storageRef, $firebaseArray, $rootScope,$filter){
		var service = {
			getAll: getAll,
			get: get,
			create: create,
            deleteItem: deleteItem,
            search: search
		};

		var userRef = firebaseDataRef.child('transaction-histories');

		return service;

		function getAll(){
			return $firebaseArray(userRef);
		}

		function get(id){
			var ref = userRef.child(id);
			return $firebaseObject(ref);
		}

		function create(item, uid){
			var ts = appUtils.getTimestamp();
			item.timestampModified = ts;
			item.timestampCreated = ts;
            return userRef.child(uid).set(item).then(function(res){
				return {result: true , data: uid};
            }).catch(function(error) {
		        return {result: false , errorMsg: error};
		    });
		}

        function deleteItem(uid){
			var ts = appUtils.getTimestamp();
            return userRef.child(uid).update({isDeleted: true, timestampModified: ts}).then(function(res){
                return {result: true};
            }).catch(function(error) {
		        return {result: false , errorMsg: error};
		    });
		}

		function search(keyword){
			return $firebaseArray(userRef).$loaded().then(function(data){
				userRef.onDisconnect();
				var searchFields = ['email'];
				return $filter('filter')(data, function (item) {
					for(var index in searchFields) {
						var attr = searchFields[index];
						if (searchMatch(item[attr] + '', keyword) && (!item.isDeleted || item.isDeleted === ''))
						{
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

	}
})();
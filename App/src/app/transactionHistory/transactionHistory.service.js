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

		var historyRef = firebaseDataRef.child('transaction-histories');

		return service;

		function getAll(){
			return $firebaseArray(historyRef);
		}

		function get(id){
			var ref = historyRef.child(id);
			return $firebaseObject(ref);
		}

		function create(userEmail, obj){
        	var key = historyRef.push().key;
			var ts = appUtils.getTimestamp();
			obj.timestampModified = ts;
			obj.timestampCreated = ts;
            return historyRef.child(userEmail).child(key).set(obj).then(function(res){
		        return {result: true , key: key};
            }).catch(function(error) {
		        return {result: false , errorMsg: error};
		    });
		}

        function deleteItem(userKey, transKey){
			var ts = appUtils.getTimestamp();
            return historyRef.child(userKey).child(transKey).update({isDeleted: true, timestampModified: ts}).then(function(res){
                return {result: true};
            }).catch(function(error) {
		        return {result: false , errorMsg: error};
		    });
		}

		function search(userKey){
			var userRef = firebaseDataRef.child('transaction-histories/' + userKey);
			return $firebaseArray(userRef).$loaded().then(function(data){
				historyRef.onDisconnect();
				// var searchFields = ['email'];
				return $filter('filter')(data, function (item) {
					// for(var attr in item) {
					if (!item.isDeleted || item.isDeleted === '')
					{
						return true;
					}
					//   }
					// for(var index in searchFields) {
					// 	var attr = searchFields[index];
					// 	if (searchMatch(item[attr] + '', keyword) && (!item.isDeleted || item.isDeleted === ''))
					// 	{
					// 		return true;
					// 	}
					// }
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
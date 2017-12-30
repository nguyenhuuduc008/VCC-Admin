(function() {
	'use strict';

	angular.module('app.transaction')
	.factory('transactionService', transactionService);

	/** @ngInject **/
	function transactionService(firebaseDataRef, $firebaseObject, appUtils, $q, storageRef, $firebaseArray, $rootScope,$filter){
		var service = {
			getAll: getAll,
			get: get,
			create: create,
			updateStatus: updateStatus,
			search: search
		};

		var transRef = firebaseDataRef.child('transactions');

		return service;

		function getAll(){
			return $firebaseArray(transRef);
		}

		function get(id){
			var ref = transRef.child(id);
			return $firebaseObject(ref);
		}

		function create(userKey, obj){
        	var key = transRef.push().key;
			var ts = appUtils.getTimestamp();
			obj.timestampModified = ts;
			obj.timestampCreated = ts;
            return transRef.child(userKey).child(key).set(obj).then(function(res){
		        return {result: true , key: key};
            }).catch(function(error) {
		        return {result: false , errorMsg: error};
		    });
		}
		
        function updateStatus(obj){
			var ts = appUtils.getTimestamp(),
			userKey = obj.userKey,
			transactionKey = obj.transactionKey;
			obj.timestampModified = ts;
            return transRef.child(userKey).child(transactionKey).update({
				status: obj.status,
				timestampModified: ts}).then(function(res){
				return {result: true , data: key};
            }).catch(function(error) {
		        return {result: false , errorMsg: error};
		    });
		}

		function search(userKey, keyword){
			var ref = transRef.child(userKey);
			return $firebaseArray(ref).$loaded().then(function(data){
				ref.onDisconnect();
			  return $filter('filter')(data, function (item) {
				  for(var attr in item) {
						if (searchMatch(item[attr] + '', keyword))
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
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
			search: search
		};

		var mailRef = firebaseDataRef.child('transactions');

		return service;

		function getAll(){
			return $firebaseArray(mailRef);
		}

		function get(id){
			var ref = mailRef.child(id);
			return $firebaseObject(ref);
		}

		function create(userKey, obj){
        	var key = mailRef.push().key;
			var ts = appUtils.getTimestamp();
			obj.timestampModified = ts;
			obj.timestampCreated = ts;
            return mailRef.child(userKey).child(key).set(obj).then(function(res){
		        return {result: true , errorMsg: ""};
            }).catch(function(error) {
		        return {result: false , errorMsg: error};
		    });
		}

		function search(userKey, keyword){
			var ref = mailRef.child(userKey);
			return $firebaseArray(ref).$loaded().then(function(data){
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
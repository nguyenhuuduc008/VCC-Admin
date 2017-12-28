(function() {
	'use strict';

	angular.module('app.home')
	.factory('mailService', mailService);

	/** @ngInject **/
	function mailService(firebaseDataRef, $firebaseObject, appUtils, $q, storageRef, $firebaseArray, $rootScope,$filter){
		var service = {
			getAll: getAll,
			get: get,
			create: create,
		};

		var mailRef = firebaseDataRef.child('mail');

		return service;

		function getAll(){
			return $firebaseArray(mailRef);
		}

		function get(id){
			var ref = mailRef.child(id);
			return $firebaseObject(ref);
		}

		function create(obj){
        	var key = mailRef.push().key;
			var ts = appUtils.getTimestamp();
			obj.timestampModified = ts;
			obj.timestampCreated = ts;
            return mailRef.child(key).set(obj).then(function(res){
		        return {result: true , errorMsg: ""};
            }).catch(function(error) {
		        return {result: false , errorMsg: error};
		    });
		}

	}
})();
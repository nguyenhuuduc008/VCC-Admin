(function() {
	'use strict';

	angular.module('app.customer')
	.factory('usersSubcribeService' ,usersSubcribeService);


	/** @ngInject **/
	function usersSubcribeService(firebaseDataRef, $firebaseObject, appUtils, $q, storageRef, searchService, $firebaseArray, $rootScope){
		var service = {
			list: list,
			getusersSubcribeService : getusersSubcribeService
		};

		var ref = firebaseDataRef.child('users-subscribe');

		return service;

		function list(){
			return $firebaseArray(ref);
		}

		function getusersSubcribeService(email){
            var emailRef = ref.child(encodeEmail(email));
			return $firebaseObject(emailRef).$loaded().then(function(data){
				emailRef.onDisconnect();
				return data;
			});
		}
		
        function encodeEmail(email) { 
			return email.replace(/\./g, ',').replace(/\@/g, '-');
		}

	}

})();
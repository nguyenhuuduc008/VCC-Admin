(function() {
	'use strict';

	angular.module('app.customer')
	.factory('countriesService' ,countriesService);


	/** @ngInject **/
	function countriesService(firebaseDataRef, $firebaseObject, appUtils, $q, storageRef, searchService, $firebaseArray, $rootScope){
		var service = {
			list: list
		};

		var ref = firebaseDataRef.child('countries');

		return service;

		function list(){
			return $firebaseArray(ref);
		}
	}

})();
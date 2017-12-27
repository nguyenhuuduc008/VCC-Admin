(function() {
	'use strict';

	angular.module('app.customer')
	.factory('statesService' ,statesService);


	/** @ngInject **/
	function statesService(firebaseDataRef, $firebaseObject, appUtils, $q, storageRef, searchService, $firebaseArray, $rootScope){
		var service = {
			list: list,
			getStates : getStates
		};

		var ref = firebaseDataRef.child('states');

		return service;

		function list(){
			return $firebaseArray(ref);
		}

		function getStates(country){
			return $firebaseArray(ref).$loaded().then(function(data){
				ref.onDisconnect();
				var states =  _.filter(data, {country: country});
				return states;
			});
		}
	}

})();
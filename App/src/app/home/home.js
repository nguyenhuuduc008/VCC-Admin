(function() {
	'use strict';

	angular.module('app.home')
	.controller('HomeCtrl',HomeCtrl);

	/** @ngInject */
	function HomeCtrl($rootScope, $scope, $state, $sce, firebaseDataRef, $firebaseObject){
        $rootScope.settings.layout.showSmartphone = false;
        $rootScope.settings.layout.showPageHead = true;
        $rootScope.settings.layout.guestPage = true;
		var currentUser = $rootScope.storage.currentUser;
        var appSettings = $rootScope.storage.appSettings;
        var homeId = appSettings.pageHomeId || '-Kor_iCNGYs-AZewc_I3';
        var vm = this;
        $scope.data = {};

	}

})();
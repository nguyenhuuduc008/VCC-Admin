(function() {
	'use strict';

	angular.module('app.home')
	.controller('HomeCtrl',HomeCtrl);

	/** @ngInject */
	function HomeCtrl($rootScope, $scope, $state, $sce, firebaseDataRef, $firebaseObject){
        $rootScope.settings.layout.showPageHead = false;
        $rootScope.settings.layout.pageSidebarClosed = true;
		var currentUser = $rootScope.storage.currentUser;
        var appSettings = $rootScope.storage.appSettings;
        var homeId = appSettings.pageHomeId || '-Kor_iCNGYs-AZewc_I3';
        var vm = this;
        $scope.data = {};
        initPage();

        $scope.trustAsHtml = trustAsHtml;
        //==========================
        function initPage(){
            var ref = firebaseDataRef.child('pages/' + homeId);
            $firebaseObject(ref).$loaded().then(function(data){
                $scope.data = data;
            }); 
        }

        function trustAsHtml(string) {
			return $sce.trustAsHtml(string);
		}
	}

})();
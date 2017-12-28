(function () {
    'use strict';

    angular.module('app.view')
	.controller('ViewCtrl', ViewCtrl);

    /** @ngInject */
    function ViewCtrl($rootScope, $scope, $state, authService) {
        $rootScope.settings.layout.showSmartphone = false;
        $rootScope.settings.layout.pageSidebarClosed = true;
        $('.wysihtml5').wysihtml5();

    }

})();


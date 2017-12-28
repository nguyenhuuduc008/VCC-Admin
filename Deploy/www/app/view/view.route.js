(function () {
    'use strict';
    angular
		.module('app.view')
		.config(config)
		.run(appRun);
	/** @ngInject */
    function appRun() { }
	/** @ngInject */
    function config($stateProvider) {
        $stateProvider.state(
			'view', {
			    url: '/view',
			    templateUrl: 'app/view/view.tpl.html',
			    controller: 'ViewCtrl',
			    controllerAs: 'viewVm',
			    data: {
			        pageTitle: 'Review Page',
					module: 'view',
					permission: 'Review Page'
			    },
			    resolve: {
			        "currentAuth": ["authService", function (authService) {
			            return authService.requireSignIn();
			        }]
			    }
			}
		);

    }
})();

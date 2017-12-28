(function() {
	'use strict';

	angular
		.module('app.register')
		.config(config)
		.run(appRun);
	/** @ngInject */	
	function appRun() {}

	/** @ngInject */
	function config($stateProvider) {
		$stateProvider.state(
			'register', {
				parent: 'root',
				url: '/register',
				templateUrl: 'app/register/register.tpl.html',
				controller: 'RegisterCtrl',
				controllerAs: 'vm',
				data: {
					pageTitle: 'Register',
					module: 'register',
					icon: 'fa fa-users',
					permission: 'Register'
				},
			    resolve: {
			        // "currentAuth": ["authService", function (authService) {
			        //     return authService.requireSignIn();
			        // }]
			    }
			}
		);
	}
})();
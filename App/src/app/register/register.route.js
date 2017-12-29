(function() {
	'use strict';

	angular
		.module('app.register')
		.config(config);
		// .run(appRun);
	/** @ngInject */	
	function appRun() {}

	/** @ngInject */
	function config($stateProvider) {
		var states = {};

		states.register ={
			parent: 'root',
			url: '/register',
			templateUrl: 'app/register/register.tpl.html',
			controller: 'RegisterCtrl',
			controllerAs: 'vm',
			data: {
				//requireLogin: true,
				pageTitle: 'Register',
				module: 'register',
				icon: 'fa fa-users',
				permission: 'Register'
			},
			resolve:{
				"currentAuth": ["authService", function(authService) {
					return authService.requireSignIn();
				}],
				deps: ['$ocLazyLoad', function($ocLazyLoad){
					return $ocLazyLoad.load({
						cache: true,
						name: 'app.register',
						files: [
							'./app/register/register.js',
							'./app/user/user.service.js',
							'./app/customer/customer.service.js'
						]
					});
				}]
			}
		};

		for(var state in states){
			$stateProvider.state(state, states[state]);
		}
	}
	// function config($stateProvider) {
	// 	$stateProvider.state(
	// 		'register', {
	// 			parent: 'root',
	// 			url: '/register',
	// 			templateUrl: 'app/register/register.tpl.html',
	// 			controller: 'RegisterCtrl',
	// 			controllerAs: 'vm',
	// 			data: {
	// 				pageTitle: 'Register',
	// 				module: 'register',
	// 				icon: 'fa fa-users',
	// 				permission: 'Register'
	// 			},
	// 		    resolve: {
	// 		        // "currentAuth": ["authService", function (authService) {
	// 		        //     return authService.requireSignIn();
	// 		        // }]
	// 		    }
	// 		}
	// 	);
	// }
})();
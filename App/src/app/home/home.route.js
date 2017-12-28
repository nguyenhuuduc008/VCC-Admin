(function() {
	'use strict';

	angular
		.module('app.home')
		.config(config)
		.run(appRun);
	/** @ngInject */	
	function appRun() {}

	/** @ngInject */
	
	function config($stateProvider) {
		var states = {};

		states.home ={
			parent: 'root',
			url: '/home',
			templateUrl: 'app/home/home.tpl.html',
			controller: 'HomeCtrl',
			controllerAs: 'vm',
			data: {
				//requireLogin: true,
				pageTitle: 'Home',
				module: 'home',
				icon: 'fa fa-home',
				permission: 'Home'
			},
			resolve:{
				"currentAuth": ["authService", function(authService) {
					return authService.requireSignIn();
				}],
				deps: ['$ocLazyLoad', function($ocLazyLoad){
					return $ocLazyLoad.load({
						cache: true,
						name: 'app.home',
						files: [
							'./app/home/home.js',
							'./app/home/mail.service.js'
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
	// 		'index', {
	// 			parent: 'root',
	// 			url: '/home',
	// 			templateUrl: 'app/home/home.tpl.html',
	// 			controller: 'HomeCtrl',
	// 			controllerAs: 'vm',
	// 			data: {
	// 				//requireLogin: true,
	// 				pageTitle: 'Home',
	// 				module: 'home',
	// 				icon: 'fa fa-home',
	// 				permission: 'Home'
	// 			},
	// 		    resolve: {
	// 		        "currentAuth": ["authService", function (authService) {
	// 		            return authService.requireSignIn();
	// 		        }]
	// 		    }
	// 		}
	// 	);
	// }
})();
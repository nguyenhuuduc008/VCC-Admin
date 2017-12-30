(function() {
	'use strict';

	angular
		.module('app.transaction')
		.config(config);
		// .run(appRun);
	/** @ngInject */	
	function appRun() {}

	/** @ngInject */
	
	function config($stateProvider) {
		var states = {};

		states.transaction ={
			parent: 'root',
			url: '/transaction',
			templateUrl: 'app/transaction/transaction.tpl.html',
			controller: 'TransactionCtrl',
			controllerAs: 'vm',
			data: {
				//requireLogin: true,
				pageTitle: 'Transaction',
				module: 'transaction',
				icon: 'fa fa-id-card',
				permission: 'Transaction'
			},
			resolve:{
				"currentAuth": ["authService", function(authService) {
					return authService.requireSignIn();
				}],
				deps: ['$ocLazyLoad', function($ocLazyLoad){
					return $ocLazyLoad.load({
						cache: true,
						name: 'app.transaction',
						files: [
							'./app/transaction/transaction.js',
							'./app/transaction/transaction.service.js'
						]
					});
				}]
			}
		};

		for(var state in states){
			$stateProvider.state(state, states[state]);
		}
	}
})();
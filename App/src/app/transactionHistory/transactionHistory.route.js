(function() {
	'use strict';

	angular
		.module('app.transactionHistory')
		.config(config);
		// .run(cfgmenu);

	/** @ngInject */
	function config($stateProvider) {
		var states = {};

		states.transactionHistory ={
			parent: 'root',
			url: '/transaction-history',
			templateUrl: './app/transactionHistory/transaction-history-layout.tpl.html',
			resolve:{
				"currentAuth": ["authService", function(authService) {
					return authService.requireSignIn();
				}],
				deps: ['$ocLazyLoad', function($ocLazyLoad){
					return $ocLazyLoad.load({
						cache: true,
						name: 'app.transactionHistory',
						files: [
							'./lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
							'./lib/angular-bootstrap/ui-bootstrap.min.js',
							'./app/transactionHistory/transactionHistory.service.js'
						]
					});
				}]
			}
		};

		states['transactionHistory.list'] = {
			url: '/list',
			templateUrl: './app/transactionHistory/list/history-list.tpl.html',
			controller: 'historyListCtrl as Vm',
			data: {
				pageTitle: 'Transaction History',
				module: 'transactionHistory',
				icon: 'fa fa-list-alt',
				permission: 'Transaction History'
			},
			resolve: {
				deps: ['$ocLazyLoad', function($ocLazyLoad){
					return $ocLazyLoad.load({
						cache: true,
						name: 'app.transactionHistory.list',
						files: [
							'./app/transactionHistory/list/history-list.js'
						]
					});
				}]
			}
		};

		states['transactionHistory.add'] = {
			url: '/add',
			templateUrl: './app/transactionHistory/add_edit/add-history.tpl.html',
			controller: 'addTransHistoryCtrl as vm',
			data: {
				pageTitle: 'Add New History',
				module: 'transactionHistory',
				parent: 'transactionHistory',
				hide: true
			},
			resolve: {
				deps: ['$ocLazyLoad', function($ocLazyLoad){
					return $ocLazyLoad.load({
						cache: true,
						name: 'app.transactionHistory.add',
						files: [
							'./app/transactionHistory/add_edit/add-history.js'					
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

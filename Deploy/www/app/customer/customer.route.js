(function() {
	'use strict';

	angular
		.module('app.customer')
		.config(config);
		// .run(cfgmenu);

	/** @ngInject */
	function config($stateProvider) {
		var states = {};

		states.customer ={
			parent: 'root',
			url: '/customer',
			templateUrl: './app/customer/customer-layout.tpl.html',
			resolve:{
				"currentAuth": ["authService", function(authService) {
					return authService.requireSignIn();
				}],
				deps: ['$ocLazyLoad', function($ocLazyLoad){
					return $ocLazyLoad.load({
						cache: true,
						name: 'app.customer',
						files: [
							'./app/customer/customer.service.js',
							'./app/customer/countries.service.js',
							'./app/customer/states.service.js',
							'./app/customer/usersSubcribe.service.js',
						]
					});
				}]
			}
		};

		states['customer.list'] = {
			url: '/list',
			templateUrl: './app/customer/list/customer-list.tpl.html',
			controller: 'customerListCtrl as customerVm',
			data: {
				pageTitle: 'Customers',
				module: 'customer',
				parent: 'eCommerce'
				// icon: 'fa fa-user-circle',
				// permission: 'Customer'
			},
			resolve: {
				deps: ['$ocLazyLoad', function($ocLazyLoad){
					return $ocLazyLoad.load({
						cache: true,
						name: 'app.customer.list',
						files: [
							'./app/customer/list/customer-list.js'
						]
					});
				}]
			}
		};

		states['customer.details'] = {
			url: '/details?id',
			templateUrl: './app/customer/add_edit/customer-details.tpl.html',
			controller: 'customerDetailsCtrl as customerDetailVm',
			data: {
				pageTitle: 'Customer Info',
				module: 'customer',
				parent: 'customer',
				hide: true
			},
			resolve: {
				deps: ['$ocLazyLoad', function($ocLazyLoad){
					return $ocLazyLoad.load({
						cache: true,
						name: 'app.customer.details',
						files: [
							'./app/customer/add_edit/customer-details.js',
							'./app/customer/customerGroups.service.js'
						]
					});
				}]
			}
		};

		states['customer.groups'] = {
			url: '/groups/:id',
			templateUrl: './app/customer/groups/groups.tpl.html',
			controller: 'GroupsCtrl as groupsVm',
			data: {
				pageTitle: 'Groups',
				module: 'customer',
				parent: 'customer.list'
			},
			resolve: {
				deps: ['$ocLazyLoad', function($ocLazyLoad){
					return $ocLazyLoad.load({
						cache: true,
						name: 'app.customer.groups',
						files: [
							'./app/customer/groups/groups.js',
							'./app/customer/customerGroups.service.js'
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

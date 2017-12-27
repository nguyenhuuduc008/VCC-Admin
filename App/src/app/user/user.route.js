(function() {
	'use strict';

	angular
		.module('app.user')
		.config(config);
		// .run(cfgmenu);

	/** @ngInject */
	function config($stateProvider) {
		var states = {};

		states.user ={
			parent: 'root',
			url: '/user',
			templateUrl: './app/user/user-layout.tpl.html',
			resolve:{
				"currentAuth": ["authService", function(authService) {
					return authService.requireSignIn();
				}],
				deps: ['$ocLazyLoad', function($ocLazyLoad){
					return $ocLazyLoad.load({
						cache: true,
						name: 'app.user',
						files: [
							'./lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
							'./lib/angular-bootstrap/ui-bootstrap.min.js',
							'./app/user/user.service.js',
							'./app/customer/customer.service.js'
						]
					});
				}]
			}
		};

		states['user.list'] = {
			url: '/list',
			templateUrl: './app/user/list/user-list.tpl.html',
			controller: 'userListCtrl as userVm',
			data: {
				pageTitle: 'Users',
				module: 'user',
				icon: 'fa fa-users',
				permission: 'User'
			},
			resolve: {
				deps: ['$ocLazyLoad', function($ocLazyLoad){
					return $ocLazyLoad.load({
						cache: true,
						name: 'app.user.list',
						files: [
							'./app/user/list/user-list.js'
						]
					});
				}]
			}
		};

		states['user.add'] = {
			url: '/add',
			templateUrl: './app/user/add_edit/add-user.tpl.html',
			controller: 'addUserCtrl as userAddVm',
			data: {
				pageTitle: 'Add New User',
				module: 'user',
				parent: 'user',
				hide: true
			},
			resolve: {
				deps: ['$ocLazyLoad', function($ocLazyLoad){
					return $ocLazyLoad.load({
						cache: true,
						name: 'app.user.add',
						files: [
							'./app/user/add_edit/add-user.js'					
						]
					});
				}]
			}
		};

		states['user.details'] = {
			url: '/details?id',
			templateUrl: './app/user/add_edit/edit-user.tpl.html',
			controller: 'editUserCtrl as userDetailVm',
			data: {
				pageTitle: 'User Info',
				module: 'user',
				parent: 'user',
				hide: true
			},
			resolve: {
				deps: ['$ocLazyLoad', function($ocLazyLoad){
					return $ocLazyLoad.load({
						cache: true,
						name: 'app.user.details',
						files: [
							'./app/user/add_edit/edit-user.js',
							'./app/user/user_role/add-user-role.js'				
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

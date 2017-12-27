(function () {
    'use strict';
    angular
		.module('app.menus')
		.config(config)
		.run(appRun);
	/** @ngInject */
    function appRun() { }
	/** @ngInject */
    function config($stateProvider) {
        $stateProvider.state(
			'menus', {
				parent: 'root',
			    url: '/appearance/menus',
			    templateUrl: 'app/menus/list/menus-list.tpl.html',
			    controller: 'MenusListCtrl',
			    controllerAs: 'menusVm',
			    data: {
			        pageTitle: 'Menus',
					module: 'menus',
					icon: 'fa fa-bars',
					permission: 'Menus'
			    },
			    resolve: {
			        "currentAuth": ["authService", function (authService) {
			            return authService.requireSignIn();
			        }]
			    }
			}
		).state(
			'addMenu', {
				parent: 'root',
			    url: '/menu/add',
			    templateUrl: 'app/menus/add_edit/add.tpl.html',
			    controller: 'MenuAddCtrl',
			    controllerAs: 'menusVm',
			    data: {
			        pageTitle: 'Add New Menu',
					module: 'menus'
			    },
			    resolve: {
			        "currentAuth": ["authService", function (authService) {
			            return authService.requireSignIn();
			        }]
			    }
			}
		).state(
			'editMenu', {
				parent: 'root',
			    url: '/menu/edit',
			    templateUrl: 'app/menus/add_edit/edit.tpl.html',
			    controller: 'MenuEditCtrl',
			    controllerAs: 'menusVm',
			    data: {
			        pageTitle: 'Edit Menu',
					module: 'menus'
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

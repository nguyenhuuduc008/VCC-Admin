(function () {
    'use strict';
    angular
		.module('app.settings')
		.config(config)
		.run(appRun);
	/** @ngInject */
    function appRun() { }
	/** @ngInject */
    function config($stateProvider) {
        $stateProvider.state(
			'general', {
				parent: 'root',
			    url: '/settings/general',
			    templateUrl: 'app/settings/general/general.tpl.html',
			    controller: 'GeneralCtrl',
			    controllerAs: 'settingsVm',
			    data: {
			        pageTitle: 'General Settings',
					module: 'settings',
					icon: 'fa fa-cogs',
					permission: 'General Settings'
			    },
			    resolve: {
			        "currentAuth": ["authService", function (authService) {
			            return authService.requireSignIn();
			        }]
			    }
			}
		).state(
			'analytics', {
				parent: 'root',
			    url: '/settings/analytics',
			    templateUrl: 'app/settings/analytics/analytics.tpl.html',
			    controller: 'AnalyticsCtrl',
			    controllerAs: 'settingsVm',
			    data: {
			        pageTitle: 'Analytics',
					module: 'settings'
			    },
			    resolve: {
			        "currentAuth": ["authService", function (authService) {
			            return authService.requireSignIn();
			        }]
			    }
			}
		).state(
			'media', {
				parent: 'root',
			    url: '/settings/media',
			    templateUrl: 'app/settings/media/media.tpl.html',
			    controller: 'MediaCtrl',
			    controllerAs: 'settingsVm',
			    data: {
			        pageTitle: 'Media Settings',
					module: 'settings'
			    },
			    resolve: {
			        "currentAuth": ["authService", function (authService) {
			            return authService.requireSignIn();
			        }]
			    }
			}
		).state(
			'payment', {
				parent: 'root',
			    url: '/settings/payment',
			    templateUrl: 'app/settings/payment/payment.tpl.html',
			    controller: 'PaymentCtrl',
			    controllerAs: 'settingsVm',
			    data: {
			        pageTitle: 'Payment Settings',
					module: 'settings'
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

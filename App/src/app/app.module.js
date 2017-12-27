(function () {
    'use strict';
    /*-------------- APP CONSTANTS ---------------------- */
    var settings = {
        layout: {
            pageSidebarClosed: false, // sidebar menu state
            pageContentWhite: true, // set page content layout
            pageBodySolid: false, // solid body color state
            pageAutoScrollOnLoad: 1000, // auto scroll to top on page load
            showPageHead: true,
            showSideBar: true,
            showHeader: true,
            showSmartphone: true
        },
        assetsPath: '../assets',
        globalPath: '../assets/global',
        layoutPath: '.'
    };
    /*-------------- END APP CONSTANTS ---------------------- */

    var app = angular
		.module('app', [
			/*
		 	* Angular modules
		 	*/
		 	'app.config',
            'ngMaterial',
			'ngAnimate',
            'ngRoute',
            'ngSanitize',
            'toaster',
            'ngBootbox',
            'ngTagsInput',
            'ngStorage',
            'dropzone',
            'googleAutocomplete',
            'angular-md5',
            'summernote',
            'bcherny/formatAsCurrency',
            'elasticsearch',
            'angularjs-autocomplete',
            'textAngular',
            'thatisuday.dropzone',
			/*
			*	3rd modules
			*/
			'ui.router',
            'ui.router.history',
            'ui.mask',
            'ui.bootstrap',
            'ui.sortable',
            'ui.tree',
            'ui.select2',
            'oc.lazyLoad',
            'highcharts-ng',
            'creditCardInput',
            'firebase',
            'benharold.haversine',
            'app.options',
            'app.utils',
			'app.auth',
			'app.core',
			'app.home',
			'app.layout',
            'app.menus',
			'app.permission',
			'app.role',
			'app.settings',
            'app.search',
            'app.dRemote'
		])
		.config(config)
		.run(run)
	    .controller('AppCtrl', AppCtrl);

    $(document).ready(function () {
        // setTimeout(function(){
        bootstrapApplication();
        // },1000);
    });

    /////////////////////////////////////////////////////////////
    /** @ngInject */
    function config($locationProvider, APP_CONFIG, $ngBootboxConfigProvider, $mdThemingProvider, $urlRouterProvider, $provide) {
        // $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('');
        firebase.initializeApp(APP_CONFIG.fbConnection);
        $mdThemingProvider.theme('default')
        .primaryPalette('deep-orange')
        .accentPalette('brown'); 

        // handle dRemote
        $urlRouterProvider.otherwise(function($injector, $location){
            var path = $location.url();
            var appUtils = $injector.get('appUtils'),
                loaded= appUtils.DRemoteLoaded;
            if(!loaded){
                return '/dremote/dremoteholder?link='+encodeURIComponent(path);
            }
            return '';
        });

        $provide.decorator('taOptions', ['taRegisterTool', '$delegate', 'appUtils', function(taRegisterTool, taOptions, appUtils){
            taRegisterTool('insertMedia', {
                iconclass: 'fa fa-file',
                tooltiptext: "Add Media",
                action: function btnClick($deferred, restoreSelection) {
                    var textAngular = this;

                    appUtils.popupMediaMulti().then(function (selectedItems) {
                        _.forEach(selectedItems, function(item) {
                            if(!item.type) item.type = '';

                            if(item.type.toLowerCase().indexOf('image') > -1){
                                textAngular.$editor().wrapSelection('insertImage', item.downloadUrl, true);
                            }else if(item.type.toLowerCase().indexOf('application') > -1){
                                textAngular.$editor().wrapSelection("createLink", {
                                    'href' : item.downloadUrl,
                                    'target' : '_blank',
                                    'rel' : 'nofollow',
                                    'text': item.displayName
                                });
                            }
                        });//End foreach
                    });
                },
                activestate: function() {
                    //   return this.$editor().queryCommandState('insertMedia');
                }
            });
  
            taOptions.toolbar[1].push('insertMedia');
        
            return taOptions;
        }]);
    }

    /** @ngInject */
    function run($rootScope, $state, $timeout, authService, $localStorage,appUtils) {  
        $rootScope.settings = settings;
        $rootScope.storage = $localStorage;
        $rootScope.goTo = function (state) {
            $state.go(state);
        };

        $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
            if (error === "AUTH_REQUIRED") {
                $state.go('login');
            }
            console.log('$stateChangeError');
            console.log(error);
        });

         $rootScope.$on('$stateChangeStart', function (event,toState, next, current) {
             var eCommerce = $rootScope.storage.appSettings && $rootScope.storage.appSettings.enableEcommerce ? $rootScope.storage.appSettings.enableEcommerce : false;
            if(toState && toState.data && toState.data.parent && toState.data.parent === 'eCommerce' && !eCommerce){
                event.preventDefault();
                appUtils.hideLoading();
                $state.go('index');
            }
        });
      
    }

    /** @ngInject */
    function bootstrapApplication() {
        angular.bootstrap(document, ['app']);
    }
    
    /** @ngInject */
    function AppCtrl($rootScope, $state, $http, toaster,appUtils){
        if(!$rootScope.storage.currentUser){
            $state.go('login');
        }
        var clipboard = new Clipboard('.btn');
        clipboard.on('success', function(e) {
            console.info('Action:', e.action);
            console.info('Text:', e.text);
            console.info('Trigger:', e.trigger);
        });

        clipboard.on('error', function(e) {
            console.error('Action:', e.action);
            console.error('Trigger:', e.trigger);
        });

        $rootScope.editorInsertMedia = function (context) {
            var ui = $.summernote.ui;
            // create button
            var button = ui.button({
                contents: '<i class="fa fa-file-code-o"/>',
                tooltip: 'Insert Media',
                click: function () {
                    // invoke insertText method with 'hello' on editor module.
                    appUtils.popupMediaMulti().then(function (selectedItems) {
                        _.forEach(selectedItems, function(item) {
                            if(!item.type) item.type = '';
                            if(item.type.toLowerCase().indexOf('image') > -1){
                                context.invoke('editor.insertImage', item.downloadUrl, item.displayName);
                            }else if(item.type.toLowerCase().indexOf('application') > -1){
                                context.invoke('editor.createLink',{
                                     text: item.displayName,
                                     url: item.downloadUrl,
                                     isNewWindow: true
                                });
                            }
                        });//End foreach
                    });
                    
                }
            });

            return button.render();   // return button as jquery object
        };

        $rootScope.downloadImage = function(url){
            var a = document.createElement('a');
            a.href = url;
            a.download = "output.jpg";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };

        $rootScope.downloadImageWithCustomName = function(url, fileName){
            var nameArr = fileName.split('.'), 
            fullName = nameArr[0], i;
            for(i = 1 ; i < nameArr.length - 1; i++){
                fullName += '.' + nameArr[i];
            }
            var type = nameArr[nameArr.length -1];
            var arr = fullName.split('_');
            if(arr && arr.length >= 2){
                var downloadName = arr[0];
                for(i = 1 ; i < arr.length - 1; i++){
                    downloadName += '_' + arr[i];
                }

                downloadName = downloadName + '.' + type; 
                $http.get(url, {responseType: "blob"}).then(function(res){
                    var file = new File([res.data], downloadName);
                    var a = document.createElement('a');
                    a.href = window.URL.createObjectURL(file);
                    a.download = downloadName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                },function(error, status) {
                    console.log(error);
                    console.log(status);
                });
            } 
        };

        $rootScope.historyBack = function(){
            window.history.back();
        };
    }

})();

(function () {
    'use strict';

    angular
        .module('app.layout', ['app.Directive.TreeSidebarMenus'])
        .service('AppData', AppData)
        .run(run)
        .controller('Shell', Shell)
        .controller('HeaderController', HeaderController)
        .controller('SidebarController', SidebarController)
        .controller('PageHeadController', PageHeadController)
        .controller('QuickSidebarController', QuickSidebarController)
        .controller('FooterController', FooterController);


    /////////////////////////////////////////////////////////////////

    /*
     * share data across application
     */
    /** @ngInject */
    function AppData($timeout) {
        var data = this;
        return data;
    }

   /** @ngInject */
    function run(AppData, $state) {
    }

    /** @ngInject */
    function Shell() {
        var vm = this;
    }
    /** @ngInject */
    function HeaderController($rootScope, $scope, $state, authService, $location,$timeout,firebaseDataRef, $firebaseObject, $firebaseArray) {

        $scope.homeUrl = '/#/home';
        if(window.location.href.indexOf('admin') !== -1){
            $scope.homeUrl = '/admin/#/home';
        }

        $scope.userInfo = {};

        $scope.toggleMenu = function(){
            $rootScope.settings.layout.pageSidebarClosed = !$rootScope.settings.layout.pageSidebarClosed;
        };

        $scope.logOut = function () {
            authService.logout();
            delete $rootScope.storage.currentUser;
            delete $rootScope.storage.roles;
            delete $rootScope.storage.permissions;
            
            // $state.go('index', {}, {reload: true});
            $location.path($scope.homeUrl);
            // window.location.href = $scope.homeUrl;
        };

        $scope.goToUserProfile = function(){
            var currentUser = $rootScope.storage.currentUser;
            // $location.path('/employee/edit/' + currentUser.$id);
            // var currentUser = $rootScope.storage.currentUser;
            window.location.href = '/#/user/details?id=' + currentUser.$id;
        };

       
        function getUserInfo(){
            $timeout(function(){
                if(!$rootScope.storage.currentUser || $rootScope.storage.currentUser === null){
                    var uid = authService.getCurrentUser() ? authService.getCurrentUser().uid : null;
                    var userRef = firebaseDataRef.child('users/' + uid);
                    $firebaseObject(userRef).$loaded().then(function(user){
                        $rootScope.storage.currentUser = user;
                        setUserInfo(user);
                    });
                }else{
                    setUserInfo($rootScope.storage.currentUser);
                }
                Layout.initHeader(); // init header
            },0);
        }

        function setUserInfo(user){
            if(user){
                $scope.userInfo.fullName = user.firstName + ' ' + user.lastName;
                $scope.userInfo.email = user.email;
                $scope.userInfo.urlProfile = user.photoURL;
                $scope.dataLetterPic = user.firstName && user.lastName ? user.firstName.charAt(0).toUpperCase() + user.lastName.charAt(0).toUpperCase() : '';
            }
        }

        $scope.$on('$includeContentLoaded', function () {
            getUserInfo();
        });

    }
    /** @ngInject */
    function SidebarController($rootScope,$scope, $state,$timeout, $filter, authService, firebaseDataRef, $firebaseObject, $firebaseArray,appSettingService, appUtils, DataUtils, $q) {
        function setChildrenMenus(allState, menu){
            var childrenMenus = _.filter(allState, function(o) {
                return o.name !== '' && menu.name !== '' && o.data && o.data.parent === menu.name && !o.data.hide; 
            });
            if(childrenMenus){
                _.forEach(childrenMenus, function(childMenu) { 
                    setChildrenMenus(allState, childMenu);
                });
                menu.children = childrenMenus;
            }
        }
        
        function searchTree(item, name){
            if(item.name == name){
                return item;
            }else if (item.children !== null){
                var i;
                var result = null;
                for(i=0; result === null && i < item.children.length; i++){
                    result = searchTree(item.children[i], name);
                }
                return result;
            }
            return null;
        }

        function findMenu(stateName){
            var allState = $state.get();
             var rs = _.find(allState, { 'name': stateName });
             return rs;
        }

        function unActiveMenus(){
            var allState = $state.get();
            _.forEach(allState, function ( item, index ) {
                item.isSelected = false;
            });
        }

        function activeMenus(stateName){
            var item = findMenu(stateName);
            if(!item) return;
            if(item.name !== 'root'){
                item.isSelected = true;
            }
            if(item.parent && item.parent !== ''){
                activeMenus(item.parent);
            }
        }

        function activeParentMenus(root, menu){
            if(menu && menu.data && menu.data.parent){
                var parentMenu = searchTree(root, menu.data.parent);
                if(parentMenu){
                    parentMenu.isSelected = true;
                    if(parentMenu.data && parentMenu.data.parent){
                        activeParentMenus(root, parentMenu);
                    }
                }
            }
        }

        $scope.goTo = function (state, parentMenu, subMenu) {
            unActiveMenus();
            state.isSelected = true;
            activeMenus(state.name);
            generateMenus(state);
            $state.go(state.name);
        };

        function setSidebarMenus(allState, userRoles, currentState){
            var backendAccessPermissions =_.filter($rootScope.storage.permissions, function(oPermission) { 
                var roleRs = _.find(oPermission.roles, function(oRoleId) {
                    return userRoles && userRoles.indexOf(oRoleId) != -1;
                });
                return roleRs && roleRs !== null; 
            });
            if(!backendAccessPermissions || backendAccessPermissions.length <= 0) return;
            var root = {
                name: 'Root',
                parent: '',
                children: [],
                url: ''
            };
            _.forEach(allState, function(o) { 
                var menu = {
                    name: o.name,
                    parent: o.parent ? o.parent : '',
                    children: [],
                    url: o.url ? o.url : '',
                    data: o.data ? o.data : {},
                    isSelected: o.isSelected ? o.isSelected : false,
                    index: 0
                };
                setChildrenMenus(allState, menu);
                if(o.isSelected){
                    menu.isSelected = true;
                    activeParentMenus(root, menu);
                }
                if(menu.name && menu.name !== '' && menu.name !== 'root' && (!menu.data || !menu.data.parent)){
                    if(currentState.name === menu.name){
                        menu.isSelected = true;
                    }
                    var rsItem = _.find(backendAccessPermissions, function(p){
                        return menu.data && p.name === menu.data.permission;
                    });
                    if(rsItem){
                        menu.index = rsItem.index;
                        root.children.push(menu);
                    }
                }
            });
            var rMenu = root;
            var enableEcom = $rootScope.storage.appSettings && $rootScope.storage.appSettings.enableEcommerce ? $rootScope.storage.appSettings.enableEcommerce : false;
            if(!enableEcom && root && root.children && root.children.length > 0){
                root.children = _.filter(root.children, function(item){
                    return item.data && item.data.module !== 'eCommerce';
                }); 
            }
            rMenu.children = _.sortBy(root.children, [function(o) { return o.index; }]);
            $scope.rootMenus = rMenu;
        }

        function generateMenus(currentState){
            var storageCurrentUser = $rootScope.storage.currentUser;
            var storageRoles = $rootScope.storage.roles;
            var storagePermissions = $rootScope.storage.permissions;

            appSettingService.checkNewSettings().then(function(res){
                var allState = $state.get();
                if(!res && storageRoles && storageRoles.length > 0 && storagePermissions && storagePermissions.length > 0){
                    setSidebarMenus(allState, storageCurrentUser.userRoles, currentState);
                }else{
                    var roleRef = firebaseDataRef.child('roles');
                    var permissionRef = firebaseDataRef.child('permissions');
                    $q.all([DataUtils.firebaseLoadOnce(roleRef), DataUtils.firebaseLoadOnce(permissionRef)]).then(function(rs){
                        $rootScope.storage.roles = DataUtils.toAFArray(rs[0]);
                        $rootScope.storage.permissions = DataUtils.toAFArray(rs[1]);
                        if(storageCurrentUser.userRoles){
                            setSidebarMenus(allState, storageCurrentUser.userRoles, currentState);
                        }
                    });
                }
            });
        }

        $scope.$on('$includeContentLoaded', function () {
            $scope.loadedContent = true;
            unActiveMenus();
            if($rootScope.loadedDyamicModules){
                var currentState = $state.current;
                activeMenus(currentState.name);
                generateMenus(currentState);
            }
            // setTimeout(function() {
            //     var currentState = $state.current;
            //     activeMenus(currentState.name);
            //     generateMenus(currentState);
            // }, 1000);
        });

        $rootScope.$on('reloadSibarMenus', function() {
            $scope.loadedContent = true;
            unActiveMenus();
            if($rootScope.loadedDyamicModules){
                var currentState = $state.current;
                activeMenus(currentState.name);
                generateMenus(currentState);
            }
        });

        $rootScope.$on('loadedDyamicModules', function(){
            if($scope.loadedContent){
                var currentState = $state.current;
                activeMenus(currentState.name);
                generateMenus(currentState);
            }
        });
    }

    /** @ngInject */
    function PageHeadController($scope, $state) {
        $scope.state = $state;
        $scope.$on('$includeContentLoaded', function () {
            //Demo.init(); // init theme panel
        });
    }

    /** @ngInject */
    function QuickSidebarController($scope) {
        $scope.$on('$includeContentLoaded', function () {
            setTimeout(function () {
                QuickSidebar.init(); // init quick sidebar
            }, 2000);
        });
    }

    /** @ngInject */
    function FooterController($scope) {
        $scope.$on('$includeContentLoaded', function () {
            Layout.initFooter(); // init footer
        });
    }

})();

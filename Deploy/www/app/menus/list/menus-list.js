(function () {
    'use strict';

    angular.module('app.menus')
	.controller('MenusListCtrl', MenusListCtrl);

    /** @ngInject */
    function MenusListCtrl($rootScope, $scope, $state, $location, $ngBootbox, authService, menusService, toaster, appUtils) {
        $rootScope.settings.layout.showSmartphone = true;
        $rootScope.settings.layout.showPageHead = true;
        var menusVm = this;

        var mobilePlatform = 'Mobile';
        var webPlatform = 'Web';

        $scope.nameRegx = /^(a-z|A-Z|0-9)*[^!#$%^&*()'"\/\\;:@=+,?\[\]\/]*$/;
       
        $scope.menus = {};
        $scope.pages = {};
        $scope.posts = {};
        $scope.currentTab = 'Mobile';

        $scope.staticPages = [ {
                                "icon" : "star",
                                "link" : "home",
                                "text" : "Home",
                                "type" : "inapp"
                            }] ;
                            // [{
                            //     "icon" : "paper",
                            //     "link" : "weekly-ad",
                            //     "text" : "Weekly Ad",
                            //     "type" : "inapp"
                            // }, {
                            //     "icon" : "nutrition",
                            //     "link" : "recipe-list/all",
                            //     "text" : "Recipes",
                            //     "type" : "inapp"
                            // }, {
                            //     "icon" : "locate",
                            //     "link" : "store-locator",
                            //     "text" : "Stores",
                            //     "type" : "inapp"
                            // }, {
                            //     "icon" : "gift",
                            //     "link" : "coupons",
                            //     "text" : "Coupons",
                            //     "type" : "inapp"
                            // }];

        $scope.platformType = 'Mobile';

        $scope.menuType = 'all';
        $scope.menuTypeName = '';
        $scope.mobileMenuTypes = [];
        $scope.webMenuTypes = [];

        $scope.showInvalid = false;
        $scope.showInvalidAddMenuType = false;
        $scope.showInvalidAddCustomLinksForm = false;

        $scope.customLinkModel = {
            url: '',
            LinkText: ''
        };
        
        //Load data
        loadView();

        function loadView() {
            loadMenuTypes(mobilePlatform);
            loadMenus($scope.menuType);
            loadPages();
            loadPosts();
        }

        function loadPosts() {
            menusService.getPosts().then(function (result) {
                if (result) {
                    $scope.posts = result;
                }
            });
        }

        function loadPages() {
            menusService.getPages().then(function (result) {
                if (result) {
                    $scope.pages = _.filter(result, function(item){
                        return !item.isTrashed;
                    });
                }
            });
        }

        function loadMenus(type) {
            $rootScope.settings.sectionMenu = type;
            menusService.get(type).then(function (result) {
                if (result) {
                    $scope.menus = result;
                    
                    if($scope.menus && $scope.menus.items){
                        for (var i = 1; i <= $scope.menus.items.length; i++){
                            if(!$scope.menus.items[i - 1].items){
                                $scope.menus.items[i - 1].items = [];
                            }
                        }
                    }
                }
            });
        }

        function loadMenuTypes(type){
            $rootScope.settings.sectionMenu = type;
            if(!$scope.navigation){
                menusService.getNavigation().then(function (result) {
                    if (result) {
                        $scope.navigation = result;
                        pushMenuTypes(type);
                    }
                });
            }else{
                pushMenuTypes(type);
            }
        }

        function pushMenuTypes(type){
            $scope.menuTypes = [];
            _.forEach($scope.navigation, function(item, key){
                if (item && item.type === type)
                {
                    var obj = item;
                    obj.id = key;
                    $scope.menuTypes.push(obj);
                }
            });
        }
        
        function updateMoreMenus(type) {
            var req = menusService.updateMoreMenus($scope.menus, type);
            req.then(function (res) {
                if (!res.result) {
                    $ngBootbox.alert(res.errorMsg);
                    return;
                }
                toaster.pop('success', 'Success', "Setting Updated.");
            });
        }

        function updateMenus() {
            var req = menusService.updateMenus($scope.menus);
            req.then(function (res) {
                if (!res.result) {
                    $ngBootbox.alert(res.errorMsg);
                    return;
                }
                toaster.pop('success', 'Success', "Setting Updated.");
            });
        }
        
        /*$scope.deleteMenu = function (item) {
            //var delMenu = null;
            //delMenu = menusService.deleteMenu(item);

            var index = menusVm.model.items.indexOf(item);
            var update = menusVm.model.items[index];
            if (index !== -1) {
                menusVm.model.items[index] = item;
                menusVm.model.items.splice(index, 1);
            }
            memAppService.update(menusVm.model).then(function (rs) {
                if (rs.result) {
                    toaster.success("Process success!");
                } else {
                    toaster.error(rs.errorMsg);
                }
            });

            //delete item
            //delMenu = $scope.splice(item.$$hashKey, 1);
            //delMenu = menusService.deleteMenu(item.$$hashKey);
            //var deleteMenu = $scope.item[$$hashKey];

            //API.DeletePerson({ id: person_to_delete.id }, function (success) {
            //    $scope.persons.splice(idx, 1);
            //});
        };*/
        
        $scope.deleteMenu = function (item) {
            $ngBootbox.confirm('Are you sure you want to remove this menu?').then(function () {
                var index = $scope.findMenuItemToRemove($scope.menus.items, item);
                if (index !== -1) {
                    toaster.pop('info', 'Information', "Click save menu to update setting!.");
                }
            });
        };

        $scope.findMenuItemToRemove = function(items, item){
            if(items && items.length > 0){
                var result = items.indexOf(item);
                if (result === -1) {
                    _.forEach(items, function(data){
                        var index = $scope.findMenuItemToRemove(data.items, item);
                        if(index !== -1){
                            result = index;
                            return;
                        }
                    });
                    return result;
                }else{
                    items.splice(result, 1);
                    return result;
                }
            }

            return -1;
        };

        $scope.typeMenu = function () {
            loadMenus($scope.menuType);
        };

        $scope.typePlatform = function(type){
            $scope.menuType = 'all';
            $scope.platformType = type;
            loadMenuTypes(type);
        };

        //Functions
        $scope.saveEdit = function (form) {
            var type = $rootScope.settings.sectionMenu;
            // if (type === 'more') {
            //     updateMoreMenus(type);
            // } else {
            updateMenus();
            // }

        };

        $scope.addPagesToMenu = function(){
            $scope.menus = $scope.menus ? $scope.menus : {};
            $scope.menus.items = $scope.menus.items ? $scope.menus.items : [];
            angular.forEach($scope.pages, function(page){
                if(page.selected){
                    var obj = {
                        icon: '',
                        link: 'page/' + page.urlSlug,
                        text: page.title,
                        type: 'dynamic-page'
                    };
                    var existed = _.find($scope.menus.items, function(o) { return o.link == obj.link; });
                    if(!existed){
                        $scope.menus.items.push(obj);
                    }
                }
            });
        };

        $scope.addStaticPagesToMenu = function(){
            $scope.menus = $scope.menus ? $scope.menus : {};
            $scope.menus.items = $scope.menus.items ? $scope.menus.items : [];
            angular.forEach($scope.staticPages, function(page){
                if(page.selected){
                    var obj = {
                        icon: page.icon,
                        link: page.link,
                        text: page.text,
                        type: 'static-page'
                    };
                    var existed = _.find($scope.menus.items, function(o) { return o.link == obj.link; });
                    if(!existed){
                        $scope.menus.items.push(obj);
                    }
                }
            });
        };
        
        $scope.addPostsToMenu = function(){
            $scope.menus = $scope.menus ? $scope.menus : {};
            $scope.menus.items = $scope.menus.items ? $scope.menus.items : [];
            angular.forEach($scope.posts, function(post){
                if(post.selected){
                    var obj = {
                        icon: '',
                        link: 'page/' + post.$id,
                        text: post.title,
                        type: 'post'
                    };
                    var existed = _.find($scope.menus.items, function(o) { return o.link == obj.link; });
                    if(!existed){
                        $scope.menus.items.push(obj);
                    }
                }
            });
        };

        $scope.checkAddedToMenu = function(link){
            var existed = _.find($scope.menus.items, function(o) { return (o && o.link) && (o.link === link || o.link === 'page/' + link); });
            return !existed;
        };

        $scope.addNewMenuType = function(form){
            $scope.showInvalidAddMenuType = true;
            if(form.$invalid){
                return;
            }

            var nodeName = $scope.menuTypeName.split(' ').join('-');
            $scope.navigation[nodeName] = {
                name: $scope.menuTypeName,
                showIcons: true,
                timestampCreated: appUtils.getTimestamp(),
                type: $scope.platformType
            };
            menusService.updateNavigation($scope.navigation).then(function (res) {
                if (!res.result) {
                    $ngBootbox.alert(res.errorMsg);
                    return;
                }
                $scope.showInvalidAddMenuType = false;
                $scope.menuTypeName = '';
                toaster.pop('success', 'Success', "Setting Updated.");
                loadMenuTypes($scope.platformType);
            });

        };

        $scope.replaceCollapseTabId = function(link){
            link = link.split(' ').join('-');
            // var res = link.replace("/", "-");
            // res = res.replace(".", "-");
            var res = link.replace(/[^a-zA-Z0-9]/g, '-');
            return res;
        };

        $scope.cancel = function () {
            $scope.typePlatform($scope.currentTab);
            $scope.menus = {};
        };

        $scope.addCustomLinkToMenu = function(form){
            $scope.showInvalidAddCustomLinksForm = true;
            if(form.$invalid){
                return;
            }
            $scope.menus = $scope.menus ? $scope.menus : {};
            $scope.menus.items = $scope.menus.items ? $scope.menus.items : [];
            var link = $scope.customLinkModel.url.split(' ').join('-');
            var obj = {
                icon: '',
                link: link,
                text: $scope.customLinkModel.LinkText,
                type: 'custom-link'
            };
            var existed = _.find($scope.menus.items, function(o) { return o.link == obj.link; });
            if(!existed){
                $scope.menus.items.push(obj);
                $scope.customLinkModel.url = '';
                $scope.customLinkModel.LinkText = '';
                $scope.showInvalidAddCustomLinksForm = false;
                return;
            }
        };
        
        $scope.sortableOptions = {
            connectWith: ".apps-container",
            update: function(e, ui) {
                $scope.sortMenuItems($scope.menus.items);
            },
            stop: function(e, ui) {
                $scope.sortMenuItems($scope.menus.items);
            }
        };

        $scope.sortMenuItems = function(items){
            _.forEach(items, function(item, index){
                item.order = index;
                if(item.items && item.items.length > 0){
                    $scope.sortMenuItems(item.items);
                }
            });
        };

        $scope.removeMenu = function(menu){
            $ngBootbox.confirm('Are you sure you want to remove this menu?').then(function () {
                menusService.deleteMenu(menu.$id).then(function (res) {
                    if (!res.result) {
                        $ngBootbox.alert(res.errorMsg);
                        return;
                    }
                    toaster.pop('success', 'Success', "Remove Menu Success.");
                    $scope.typePlatform($scope.currentTab);
                });
            });
        };

        $scope.getView = function (item) {
            /*
                you can return a different url
                to load a different template dynamically
                based on the provided item 
                */
            if (item) {
                return 'nestable_item.html';
            }
            return null;
        };
        
        $scope.selectAll = function (controlId, name) {
            var _isChecked = function(Id) {
                 var text =  $("#" + Id).text();
				 var check = $.trim(text) === 'Select All' ? true : false;
                 $("#" + Id).text($.trim(text) === 'Select All' ? 'Unselect All' : 'Select All');
                 return check;
			};

			var check = _isChecked(controlId);
	        if (typeof(check) === 'undefined') {
	            check = false;
	        }
	        $('input[name=' + name + ']').attr('checked', check);
        };
    }

})();


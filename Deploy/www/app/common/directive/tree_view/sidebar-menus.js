(function(){
	'use strict';
	angular.module('app.Directive.TreeSidebarMenus',[]).directive('treeSidebarMenus',['$parse',function($parse){
	return{
			restrict: "E",
	        scope: {
                family: '=',
			    data:'=ngModel',
			    goTo: '&goTo',
                keyword: '@'
            },
	        template: [
                    '<ul class="sub-menu" ng-class="{\'display\': family.isSelected}">',
                        '<li class="nav-item" ng-repeat="item in family.children" ng-class="{\'open\': item.isSelected}">',
                            '<a href="#" ng-click="redirectTo(item)" ng-disabled="item.isSelected && (!item.children || item.children.length <= 0)">',
                                '<span class="title">{{item.name}} </span>',
                                '<span ng-if="item.children && item.children.length > 0" class="arrow" ng-class="{\'open\': item.isSelected}"></span>',
                            '</a>',
                            '<tree-sidebar-menus ng-if="item.children && item.children.length > 0" family="item" style="display: block;" keyword="" go-to="goTo()"></tree-sidebar-menus>',
                        '</li>',
                    '</ul>'
                    ].join(''),
            link: function(scope,iElement, iAttrs, ngModelCtrl){
                scope.redirectTo = function(item, keyword){
                    scope.goTo()(item, keyword);
                };
                
                // scope.countItems = function(cate){
                //     return cate.products ? Object.keys(cate.products).length : cate.items ? Object.keys(cate.items).length : 0;
                // };
            }
		};
	}]);
})();


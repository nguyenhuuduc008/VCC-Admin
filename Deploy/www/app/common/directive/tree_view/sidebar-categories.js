(function(){
	'use strict';
	angular.module('app.Directive.TreeSidebarCategories',[]).directive('treeSidebarCategories',['$parse',function($parse){
	return{
			restrict: "E",
	        scope: {
                family: '=',
			    data:'=ngModel',
			    searchByCategory: '&searchByCategory',
                keyword: '@'
            },
	        template: [
                    '<ul class="sub-menu" ng-class="{\'display\': family.isSelected}">',
                        '<li class="nav-item" ng-if="countItems(item) > 0" ng-repeat="item in family.children" ng-class="{\'active\': item.isSelected}">',
                            '<a href="#tab_2" data-toggle="tab" class="nav-link nav-toggle" ng-click="getByCategory(item, keyword)" ng-disabled="item.isSelected && (!item.children || item.children.length <= 0)">',
                                '<span class="title">{{item.name}} </span>',
                                '<span class="title bold">({{countItems(item)}})</span>',
                                '<span ng-if="item.children && item.children.length > 0" class="arrow" ng-class="{\'open\': item.isSelected}"></span>',
                            '</a>',
                            '<tree-sidebar-categories ng-if="item.children && item.children.length > 0" family="item" style="display: block;" keyword="{{keyword}}" search-by-category="searchByCategory()"></tree-sidebar-categories>',
                        '</li>',
                    '</ul>'
                    ].join(''),
            link: function(scope,iElement, iAttrs, ngModelCtrl){
                scope.getByCategory = function(item, keyword){
                    scope.searchByCategory()(item, keyword);
                };
                
                scope.countItems = function(cate){
                    return cate.products ? Object.keys(cate.products).length : cate.items ? Object.keys(cate.items).length : 0;
                };
            }
		};
	}]);
})();


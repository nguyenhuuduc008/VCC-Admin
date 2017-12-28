(function () {
    'use strict';
    angular.module('app.Directive.DynamicHtml', []).directive('dynamicHtml', ['$compile',function ($compile) {
        return {
            restrict: 'A',
            replace: true,
            link: function (scope, element, attrs) {
                scope.$watch(attrs.dynamicHtml, function (html) {
                    element[0].innerHTML = html;
                    $compile(element.contents())(scope);
                });
            }
        };
    }]);
})();


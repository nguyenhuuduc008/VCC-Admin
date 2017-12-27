(function () {
    'use strict';
    angular.module('app.Directive.OutsideClick', []).directive('outsideClick', ['$document', '$parse', function ($document, $parse) {
        return {
            link: function ($scope, $element, $attributes) {
                var scopeExpression = $attributes.outsideClick,
                    onDocumentClick = function (event) {
                        var isChild = $element.find(event.target).length > 0;

                        if (!isChild && $scope.$root && $scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                            $scope.$apply(scopeExpression);
                        }
                    };

                $document.on('click', onDocumentClick);

                $element.on('$destroy', function () {
                    $document.off("click", onDocumentClick);
                });
            }
        };
    }]);
})();


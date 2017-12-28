(function(){
	'use strict';
	angular.module('app.Directive.PasswordMatch',[]).directive('passwordMatch',['$parse',function($parse){
	return {
			restrict: 'A',
			require: '?ngModel',
			link: function (scope, elem, attrs, ctrl) {
                console.log('PasswordMatch');
				if (!ctrl) return;
				if (!attrs.passwordMatch) return;
				var firstPassword = $parse(attrs.passwordMatch);
				var validator = function (value) {
					var temp = firstPassword(scope),v;
					value = value || '';
					temp = temp || ''; 					
					v = value === temp;
					ctrl.$setValidity('match', v);
					return value;
				};
				ctrl.$parsers.unshift(validator);
				ctrl.$formatters.push(validator);
				attrs.$observe('passwordMatch', function (confirmPassword) {
					validator(ctrl.$viewValue);
				});

			}
		};  
	}]);
})();


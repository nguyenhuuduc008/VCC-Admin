(function(){
	'use strict';
	angular.module('app.Directive.timePicker',[]).directive('timePicker',['$parse','$timeout',function($parse,$timeout){
	return{
		restrict: 'AE',
		replace: true,
		scope: {
			id:'@id',
			data: '=ngModel'
		},
		link: function(scope,iElement, iAttrs, ngModelCtrl){ 
            var id = scope.id;
            if(id){
                $(function (){
					$timeout(function(){
						 $('#' + id).timepicker({
							showMeridian : true,
							minuteStep: 5,
							showInputs: true
						});
					},0);
                });
            }	            
		}
	};
	}]);
})();


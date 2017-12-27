(function(){
	'use strict';
	angular.module('app.Directive.singleDatePicker',[]).directive('singleDatePicker',['$parse','$timeout',function($parse,$timeout){
	return{
		restrict: 'AE',
		replace: true,
		require: 'ngModel',
		scope: {
			data:'=ngModel',
			isRequire: '@',
			isDisable: '@',
			name: '@'
		},
		template: ['<div class="input-group date project_datetime singleDateTimePicker-{{index}}">', 
						'<input type="text" class="form-control" ng-disabled="isDisable" ng-required="req" name="{{name}}" placeholder="mm/dd/yyyy hh:ii" ng-model="data" required >',
						'<span class="input-group-btn input-group-addon no-padding">',
							'<button class="btn default date-set" type="button">',
								'<i class="fa fa-calendar" data-time-icon="icon-time"></i>',
							'</button>',
						'</span>',
					'</div>'].join(''),
		link: function(scope,iElement, iAttrs, ngModelCtrl){ 
			scope.index = Math.floor(Math.random() * 1000, 1);
			$timeout(function(){
				scope.req = scope.isRequire === 'true' ? true : false;
				scope.isDisable = scope.isDisable === 'true' ? true : false;
				$(function () {
					$('.singleDateTimePicker-'  + scope.index).datetimepicker({
						format: 'mm/dd/yyyy hh:ii',
						todayHighlight: true,
						todayBtn: "linked",
						autoclose: true
					}).on('changeDate', function(){
						var newValue = $(".singleDateTimePicker-" + scope.index + " input").val();
						scope.$apply(function(){
							scope.data  = newValue;
						});
					});
				});
			},2000);	            
		}
	};
	}]);
})();


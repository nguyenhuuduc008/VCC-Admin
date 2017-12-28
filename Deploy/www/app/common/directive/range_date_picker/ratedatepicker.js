(function(){
	'use strict';
	angular.module('app.Directive.RateDatePicker',[]).directive('rateDatePicker',['$parse','$timeout',function($parse,$timeout){
	return{
		restrict: 'AE',
		replace: true,
		require: 'ngModel',
		scope: {
			data:'=ngModel',
			cls: '@',
			clsControl: '@',
			clsLabel: '@',
			isRequire: '@',
			isDisable: '@'
		},
		 template: [ '<div class="rate-date-picker row">',
		 				'<div class="form-group {{cls}}">',
							'<label class="control-label {{clsLabel}}" style="text-align: left;">Start Date <span class="required-field" ng-if="req">*</span></label>',
							'<div class="{{clsControl}}">',
								'<div class="input-group date form_meridian_datetime start-datetime-{{index}}">',
									'<input type="text" class="form-control" ng-disabled="isDisable" placeholder="mm/dd/yyyy hh:ii" ng-required="req" name="eventstartdatetime" ng-model="startDate">',
									'<span class="input-group-btn input-group-addon no-padding">',
										'<button class="btn default date-set" type="button">',
											'<i class="fa fa-calendar" data-time-icon="icon-time"></i>',
										'</button>',
									'</span>',
								'</div>',
							'</div>',
                    	'</div>',
                    	'<div class="form-group {{cls}}">',
							'<label class="control-label {{clsLabel}}" style="text-align: left;">End Date <span class="required-field" ng-if="req">*</span></label>',
							'<div class="{{clsControl}}">',
	                    		'<div class="input-group date form_meridian_datetime end-datetime-{{index}}">',
									'<input type="text" class="form-control" ng-disabled="isDisable" placeholder="mm/dd/yyyy hh:ii" ng-required="req"  name="eventenddatetime" ng-model="endDate">',
									'<span class="input-group-btn input-group-addon no-padding">',
										'<button class="btn default date-set" type="button">',
											'<i class="fa fa-calendar" data-time-icon="icon-time"></i>',
										'</button>',
									'</span>',
								'</div>',
	                       '</div>',
                       '</div>',
					'</div>'].join(''),
		link: function(scope,iElement, iAttrs, ngModelCtrl){
			if (!scope.data.$$hashKey) 
				scope.index = Math.floor(Math.random() * 1000, 1);
			else
				scope.index = scope.data.$$hashKey.split(":")[1];
				
			$timeout(function(){
				scope.startDate = scope.data.startDate || scope.data.startTime;
				scope.endDate = scope.data.endDate  || scope.data.endTime;
				scope.req = scope.isRequire === 'true' ? true : false;
				scope.isDisable = scope.isDisable === 'true' ? true : false;
				var start = new Date();
				// set end date to max one year period:
				var end = new Date(new Date().setYear(start.getFullYear()+1));
				$(".start-datetime-" + scope.index).datetimepicker({
	                isRTL: App.isRTL(),
	                format: "mm/dd/yyyy hh:ii",
	                autoclose: true,
	                startDate: '',
					isInline: false
	            }).on('changeDate', function(){
				    // set the "toDate" start to not be later than "fromDate" ends:
					var newValue = $(".start-datetime-" + scope.index + " input").val();
					if(scope.data.startDate !== undefined){
						scope.data.startDate  = newValue;
					}
					if(scope.data.startTime !== undefined){
						scope.data.startTime  = newValue;
					}
				    $(".end-datetime-" + scope.index).datetimepicker('setStartDate', new Date(newValue));
				});

	            $(".end-datetime-" + scope.index).datetimepicker({
	                isRTL: App.isRTL(),
	                format: "mm/dd/yyyy hh:ii",
	                autoclose: true,
	                startDate: '',
					isInline: false
	            }).on('changeDate', function(){
				    // set the "toDate" start to not be later than "fromDate" ends:
					var newValue = $(".end-datetime-" + scope.index + " input").val();
					if(scope.data.endDate !== undefined){
						scope.data.endDate  = newValue;
					}
					if(scope.data.endTime !== undefined){
						scope.data.endTime  = newValue;
					}
				    $(".start-datetime-" + scope.index).datetimepicker('setEndDate', new Date(newValue));
				});
			},2000);            
		}
	};
	}]);
})();


(function(){
	'use strict';
	angular.module('app.Directive.DateRangeReport',[]).directive('dateRangeReport',['$parse','$timeout',function($parse,$timeout){
	return{
		restrict: 'AE',
		replace: true,
		template: ['<div class="btn default">',
                        '<i class="fa fa-calendar"></i> &nbsp;',
                            '<span> </span>',
                        '&nbsp;&nbsp;<b class="fa fa-angle-down"></b>',
                    '</div>'].join(''),
		link: function(scope,iElement, iAttrs, ngModelCtrl){ 
					var dateRangeId = iAttrs.id;
					var subtractDays = iAttrs.subtract ? parseInt(iAttrs.subtract) : 6;
					var startDate = iAttrs.start ? moment(parseInt(iAttrs.start)) : moment().subtract('days', subtractDays);
					var endDate = iAttrs.end ? moment(parseInt(iAttrs.end)) : moment();
					if(dateRangeId){
						$(function () {
				        	$('#' + dateRangeId).daterangepicker({
					            opens: (App.isRTL() ? 'left' : 'right'),
					            startDate: startDate,
					            endDate: endDate,
					            //minDate: '01/01/2012',
					            //maxDate: '12/31/2014',
					            showDropdowns: true,
					            showWeekNumbers: true,
					            timePicker: false,
					            timePickerIncrement: 1,
								timePicker12Hour: true,
								linkedCalendars: false,
					            ranges: {
					                'Today': [moment(), moment()],
					                'Yesterday': [moment().subtract('days', 1), moment().subtract('days', 1)],
					                'Last 7 Days': [moment().subtract('days', 6), moment()],
					                'Last 30 Days': [moment().subtract('days', 29), moment()],
					                'This Month': [moment().startOf('month'), moment().endOf('month')],
									'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')],
									'All': [moment('01/01/2016').startOf('day'),moment().endOf('day')]
					            },
					            buttonClasses: ['btn'],
					            applyClass: 'green',
					            cancelClass: 'default',
					            format: 'MM/DD/YYYY',
					            separator: ' to ',
					            locale: {
					                applyLabel: 'Apply',
					                fromLabel: 'From',
					                toLabel: 'To',
					                customRangeLabel: 'Custom Range',
					                daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
					                monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
					                firstDay: 1
					            }
					        },
					            function (start, end) {
					                $('#' + dateRangeId +' span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
					            }
					        );

					        //Set the initial state of the picker label
					        $('#' + dateRangeId +' span').html(startDate.format('MMMM D, YYYY') + ' - ' + endDate.format('MMMM D, YYYY'));
				    	});
					}	            
		}
	};
	}]);
})();


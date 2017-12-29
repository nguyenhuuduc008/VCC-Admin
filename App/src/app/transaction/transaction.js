(function() {
	'use strict';

	angular.module('app.transaction')
	.controller('TransactionCtrl', TransactionCtrl);

	/** @ngInject */
	function TransactionCtrl($rootScope, $scope, $state, $sce, firebaseDataRef, $firebaseObject, appUtils, mailService, toaster){
        $rootScope.settings.layout.showSmartphone = false;
        $rootScope.settings.layout.showPageHead = true;
        $rootScope.settings.layout.guestPage = false;
		var currentUser = $rootScope.storage.currentUser;
        if(!currentUser.userRoles || (currentUser.userRoles && currentUser.userRoles.length <= 0)){
            window.location.href = '/#/home';
            return;
        }
        var appSettings = $rootScope.storage.appSettings;
        var homeId = appSettings.pageHomeId || '-Kor_iCNGYs-AZewc_I3';
        var vm = this;
		vm.showInvalid = false;

        $scope.data = {};
        // $scope
		$scope.options = {
            height: 300,
            toolbar: [
                    ['edit',['undo','redo']],
                    ['headline', ['style']],
                    ['style', ['bold', 'italic', 'underline', 'superscript', 'subscript', 'strikethrough', 'clear']],
                    ['fontface', ['fontname']],
                    ['textsize', ['fontsize']],
                    ['fontclr', ['color']],
                    ['alignment', ['ul', 'ol', 'paragraph', 'lineheight']],
                    ['height', ['height']],
                    ['table', ['table']],
                    ['insert', ['link','picture','video','hr']],
                    ['view', ['codeview']],
                    ['mybutton', ['insertMedia']],
            ],
            buttons: {
                insertMedia: $rootScope.editorInsertMedia
            }
        };

        initPage();

        //==========================
        function initPage(){
            var ref = firebaseDataRef.child('pages/' + homeId);
            $firebaseObject(ref).$loaded().then(function(data){
                $scope.data = data;
            }); 
        }

        vm.sendGmailMessage = function(obj) {
            appUtils.showLoading();
            // parameters: service_id, template_id, template_parameters
            emailjs.send("gmail","template_9K5AQ3SZ", obj)
            .then(function(response) {
                console.log("SUCCESS. status=%d, text=%s", response.status, response.text);
                appUtils.hideLoading();
            }, function(err) {
                console.log("FAILED. error=", err);
                appUtils.hideLoading();
            });
        };

        
		vm.create = function(form){
			appUtils.showLoading();
			// vm.showInvalid = true;
			if(form.$invalid){
				return;
			}

            mailService.create(vm.mail).then(function(res){
                if(!res.result){				
                    $ngBootbox.alert(res.errorMsg);
                    return;
                }
                appUtils.hideLoading();

                var obj = {
                    to_email: vm.mail.toEmail,
                    reply_to: vm.mail.replyTo,
                    from_name: vm.mail.fromName,
                    to_name: vm.mail.toName,
                    subject: vm.mail.subject,
                    message_html: vm.mail.content,
                    cc: vm.mail.cc,
                    bcc: vm.mail.bcc
                };
                vm.sendGmailMessage(obj);
                toaster.pop('success','Success', "Mail Created.");
                vm.mail = {};
            }, function(res){
                $ngBootbox.alert(res.errorMsg);
                appUtils.hideLoading();
                return;
            });

		};

	}

})();
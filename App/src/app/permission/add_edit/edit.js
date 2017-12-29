(function() {
	'use strict';

	angular.module('app.permission')
	.controller('PermissionEditCtrl', PermissionEditCtrl);

	/** @ngInject */
	function PermissionEditCtrl($rootScope, $scope, $state,$q, permissionService,roleService, $stateParams, toaster, $ngBootbox, authService, appUtils){
    $rootScope.settings.layout.showSmartphone = false;
    $rootScope.settings.layout.showBreadcrumb = true;
    $rootScope.settings.layout.guestPage = false;
		$rootScope.breadcrumb = {
            name: 'Permissions',
            link: '#/permissions'
    };
    
    var currentUser = authService.getCurrentUser();
    var permissionVm = this;
		permissionVm.model = {};
    permissionVm.roles = [];
    permissionVm.model.$id = $stateParams.id;
    permissionVm.nameRegx = /^(a-z|A-Z|0-9)*[^!#$%^&*()'"\/\\;:@=+,?\[\]\/]*$/;
    permissionVm.numberRegx = /^\d+$/;
    permissionVm.showInvalid = true;
    permissionVm.permissions = [];
    //Load Data
    function loadDataRoles(){
      return roleService.items().$loaded().then(function(data){
            return {roles: data};
        });
    }

    function loadDataPermission(){
      return permissionService.items().$loaded().then(function(data){
            permissionVm.permissions = data;
            return permissionService.get(permissionVm.model.$id).$loaded().then(function(item){
              console.log(item);
              if(item){
                return {permistion: item};
              }
            });
        });
    }

    function loadData(){
      appUtils.showLoading();
      var reqs;
      var roles =  loadDataRoles();
      var permissions = loadDataPermission();
      reqs = [roles,permissions];
      return $q.all(reqs).then(function(res_array){
          appUtils.hideLoading();
          permissionVm.roles = res_array[0].roles;
          permissionVm.model = res_array[1].permistion;
          permissionVm.name = permissionVm.model.name;
          permissionVm.index = permissionVm.model.index;
          _.forEach(permissionVm.roles, function(obj, key) {
              var isExisted = $.inArray(obj.$id,permissionVm.model.roles); 
              if(isExisted === -1){
                  obj.checked = false;
              }else{
                  obj.checked = true;
              }                  
          });
        return res_array;
      });
    }

    loadData();

    //Functions
    
    permissionVm.update = function(form){
      appUtils.showLoading();
      if(form.$invalid){
        appUtils.hideLoading();
        return;
      }
      
      var existed = _.find(permissionVm.permissions,{name: permissionVm.name});
      if(existed && permissionVm.name !== permissionVm.model.name){
         toaster.warning('Permission is existed');
         delete $rootScope.storage.permissions;
         appUtils.hideLoading();
         return;
      }

      permissionVm.model.name = permissionVm.name;
      var index = permissionVm.index === '' ? '0' : permissionVm.index;
      permissionVm.index = parseInt(index);
      permissionVm.model.index = parseInt(index);
      permissionVm.model.uid = currentUser.$id;
      permissionVm.model.timestampModified = appUtils.getTimestamp();
      var roles = [];

      $('input[name=tnc]').each(function () {
            if (this.checked === true) {
                roles.push($(this).val() + '');
            }
      });

      permissionVm.model.roles = roles;
      permissionService.update(permissionVm.model).then(function(rs){
        appUtils.hideLoading();
				if(rs.result){
						toaster.success("Save success!");
            delete $rootScope.storage.permissions;
						$state.go('permissionList');
				}else{
						toaster.error(rs.errorMsg);
				}
      });
    };

    permissionVm.delete = function(){
      $ngBootbox.confirm('Are you sure want to delete ' + permissionVm.model.name + '?')
      .then(function() {
        appUtils.showLoading();
        permissionService.remove(permissionVm.model.$id).then(function(rs){
          appUtils.hideLoading();
  				if(rs.result){
  						toaster.success("Delete success!");
              delete $rootScope.storage.permissions;
  						$state.go('permissionList');
  				}else{
  						toaster.error(rs.errorMsg);
  				}
        });
      }, function() {
      });

    };

		permissionVm.cancel = function(){
			$state.go('permissionList');
		};

    permissionVm.checkRoleOfPermission = function(role, permissionRole){
      var isExisted = $.inArray(role.$id,permissionRole); 
      return isExisted === -1;
    };

	}

})();

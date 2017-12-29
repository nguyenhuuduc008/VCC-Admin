(function () {
  'use strict';

  angular.module('app.permission')
    .controller('PermissionAddCtrl', PermissionAddCtrl);

  /** @ngInject */
  function PermissionAddCtrl($rootScope, $scope, $state, $q, $ngBootbox, permissionService, $location, toaster, authService, roleService, appUtils) {
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
    permissionVm.model.name = '';
    permissionVm.model.index = '';
    permissionVm.model.roles = [];
    permissionVm.model.uid = currentUser.$id;
    permissionVm.model.timestampCreated = appUtils.getTimestamp();
    permissionVm.nameRegx = /^(a-z|A-Z|0-9)*[^!#$%^&*()'"\/\\;:@=+,?\[\]\/]*$/;
    permissionVm.numberRegx = /^\d+$/;
    permissionVm.showInvalid = false;
    permissionVm.permissions = [];
    //Load Data
    function loadDataRoles() {
      return roleService.items().$loaded().then(function (data) {
        return { roles: data };
      });
    }

    function loadData() {
      appUtils.showLoading();
      var reqs;
      var roles = loadDataRoles();
      var permissions = permissionService.items().$loaded().then(function(data){
          return  { permissions: data };
      });
      reqs = [roles, permissions];
      return $q.all(reqs).then(function (res_array) {
        appUtils.hideLoading();
        permissionVm.roles = res_array[0].roles;
        permissionVm.permissions = res_array[1].permissions;
        return res_array;
      });
    }

    loadData();

    //Functions

    permissionVm.create = function (form) {
      appUtils.showLoading();
      permissionVm.showInvalid = true;
      if (form.$invalid) {
        appUtils.hideLoading();
        return;
      }

      var existed = _.find(permissionVm.permissions , { name: permissionVm.model.name });
      if (existed) {
        appUtils.hideLoading();
        $ngBootbox.alert('Permission is existed');
        return;
      }
      $('input[name=tnc]').each(function () {
        if (this.checked === true) {
          permissionVm.model.roles.push($(this).val() + '');
        }
      });

      var index = permissionVm.model.index === '' ? '0' : permissionVm.model.index;
      permissionVm.model.index = parseInt(index);
      permissionService.create(permissionVm.model).then(function (rs) {
        appUtils.hideLoading();
        if (rs.result) {
          toaster.success("Save success!");
          delete $rootScope.storage.permissions;
          $state.go('permissionList');
        } else {
          toaster.error(rs.errorMsg);
        }
      });

    };

    permissionVm.cancel = function () {
      $state.go('permissionList');
    };
  }

})();

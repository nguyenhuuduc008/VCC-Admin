(function() {
	'use strict';
  angular.module('app.permission').factory('permissionService', permissionService);
  /** @ngInject **/
  function permissionService($q, $filter, $firebaseObject, $firebaseArray, firebaseDataRef, appUtils){
  		var rootPath = 'permissions' , items = firebaseDataRef.child(rootPath);
  		var service = {
  			items: getAll,
  			get : get,
  			create: create,
  			update: update,
  			remove: remove,
  			search : search,
        getPermissionByRole: getPermissionByRole,
			  checkPermisionByRole: checkPermisionByRole
  		};

  		return service;

			function getAll(){
        return $firebaseArray(items);
      }

      function get(id){
        var ref = items.child(id);
        return $firebaseObject(ref);
			}
			
			function create(add){
        var ts = appUtils.getTimestamp(), key = items.push().key;
        add.timestampModified = ts;
        add.timestampCreated = ts;
        return items.child(key).update(add).then(function(result) {
              return {result: true , errorMsg: "", key: key};
            }).catch(function(error) {
              return {result: false , errorMsg: error};
          });
      }

      function update(update){
        var ts = appUtils.getTimestamp();
        update.timestampModified = ts;
        return update.$save().then(function(){
          return {result: true , errorMsg: ""};
        }).catch(function(error) {
          return {result: false , errorMsg: error};
        });
      }

      function remove(id){
        return items.child(id).remove().then(function(){
          return {result: true , errorMsg: ""};
        }).catch(function(error) {
          return {result: false , errorMsg: error};
        });
      }
      
      function search(keyword){
        return $firebaseArray(items).$loaded().then(function(data){
          return $filter('filter')(data, function (item) {
              for(var attr in item) {
                if (searchMatch(item[attr] + '', keyword))
                {
                  return true;
                }
              }
              return false;
            });
        });
      }

      function searchMatch(haystack, needle) {
          if (!needle) {
            return true;
          }
          return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
      }

      function getPermissionByRole(roleId){
        return $firebaseArray(items).$loaded().then(function(data){
          return _.filter(data, function (item){
              var isExisted = $.inArray(roleId,item.roles); 
              if(isExisted !== -1){
                return true;
              }
              return false;
          });
        });
      }

			function checkPermisionByRole(roleIds, permission){
        return $firebaseArray(items).$loaded().then(function(data){
					 var hasPermission  = false;
					 if(roleIds !== undefined && roleIds.length > 0){
							_.forEach(roleIds, function(roleId, key) {
									var permissions = _.filter(data, function (item){
											var isExisted = $.inArray(roleId,item.roles); 
											if(isExisted !== -1){
												return true;
											}
											return false;
									});
									if(permissions !== undefined && permissions.length > 0){
										 	var match = _.find(permissions, function(per){
												 	return per.name === permission || per.$id === permission;
											 });
											if(match !== undefined){
													hasPermission = true;
													return;
											}
									}
							});
					 }
					 return hasPermission;
        });
      }
    }
})();

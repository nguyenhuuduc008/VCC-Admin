(function () {
    'use strict';
    angular.module('app.menus').factory('menusService', ['$q', '$filter', 'authService', 'firebaseDataRef', '$firebaseObject', '$firebaseArray', 'appUtils',
      function ($q, $filter, authService, firebaseDataRef, $firebaseObject, $firebaseArray, appUtils) {
          var items = firebaseDataRef.child('pages');
          var lst = [];
          //if (authService.getCurrentUser()) {
              lst = $firebaseArray(items);
          //}
          var options;
          var menuOption;
          var pages;
          if (authService.getCurrentUser()) {
              //options = $firebaseObject(appOptionsRef);
          }
          var service = {
              getNavigation: getNavigation,
              updateNavigation: updateNavigation,
              options: options,
              get: get,
              updateMenus: updateMenus,
              updateMoreMenus: updateMoreMenus,
              getPages: getPages,
              getPosts: getPosts,
              deleteMenu: deleteMenu,
              items: lst
          };

          return service;

          function getNavigation(type) {
              var optionsRef = firebaseDataRef.child('navigation');
              var navs = $firebaseObject(optionsRef);
              return navs.$loaded().then(function (data) {
                  return data;
              });
          }
          
          function updateNavigation(update) {
              update.timestampModified = appUtils.getTimestamp();
              return update.$save().then(function () {
                  return { result: true, errorMsg: "" };
              }).catch(function (error) {
                  return { result: false, errorMsg: error };
              });
          }

          function get(type) {
              var optionsRef = firebaseDataRef.child('navigation/' + type);
              options = $firebaseObject(optionsRef);
              return options.$loaded().then(function (data) {
                  return data;
              });
          }
          
          function getPages() {
              var pagesRef = firebaseDataRef.child('pages');
              var listPages = $firebaseArray(pagesRef);
              return listPages.$loaded().then(function (data) {
                  return data;
              });
          }

          function getPosts() {
              var postsRef = firebaseDataRef.child('posts');
              var listPosts = $firebaseArray(postsRef);
              return listPosts.$loaded().then(function (data) {
                  return data;
              });
          }


          function deleteMenu(id) {
            var ref = firebaseDataRef.child('navigation/' + id);
            return ref.remove().then(function () {
                return { result: true, errorMsg: "" };
            }).catch(function (error) {
                return { result: false, errorMsg: error };
            });
          }

          function updateMenus(updateMenus) {
            //   updateMenus.name = updateMenus.name;
            //   updateMenus.showIcons = updateMenus.showIcons;

            //   updateMenus.items.forEach(function (item, index) {
            //       self.options.items = {};
            //       self.options.items[index].icon = item.icon;
            //       self.options.items[index].link = item.link;
            //       self.options.items[index].text = item.text;
            //       self.options.items[index].type = item.type;
            //   });

            //   options.timestampModified = appUtils.getTimestamp();
              updateMenus.timestampModified = appUtils.getTimestamp();
              return updateMenus.$save().then(function () {
                  return { result: true, errorMsg: "" };
              }).catch(function (error) {
                  return { result: false, errorMsg: error };
              });

              //return $q.when({ result: false, errorMsg: "Menu could not be found!" });

          }

          //Update More Menu
          function updateMoreMenus(updateMoreMenus) {
              //var updateMenu = options.get(updateMenus.$id)
              //options.$id = type;
              options.name = updateMoreMenus.name;
              options.showIcons = updateMoreMenus.showIcons;

              options.timestampModified = appUtils.getTimestamp();
              return options.$save().then(function () {
                  return { result: true, errorMsg: "" };
              }).catch(function (error) {
                  return { result: false, errorMsg: error };
              });

              //return $q.when({ result: false, errorMsg: "Menu could not be found!" });

          }
      }
    ]);
})();

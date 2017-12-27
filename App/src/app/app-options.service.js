(function () {
    'use strict';
    angular.module('app.options').factory('appSettingService', ['$rootScope','$http', '$q', '$filter', 'authService', 'firebaseDataRef', '$firebaseObject', '$firebaseArray', 'DataUtils',
        function ($rootScope,$http, $q, $filter, authService, firebaseDataRef, $firebaseObject, $firebaseArray, DataUtils) {
            var items = firebaseDataRef.child('app-options');
            var lst = [];
            if (authService.getCurrentUser()) {
                lst = $firebaseArray(items);
            }
            var service = {
                items: lst,
                get: get,
                checkNewSettings: checkNewSettings,
                getSettings: getSettings
            };

            return service;

            function get(id) {
                return lst.$getRecord(id);
            }

            function checkNewSettings(){
                var appOptions = 'app-options';
                var timestampModified = 'timestampModified';
                var cacheTimestamp = firebaseDataRef.child(appOptions + '/' + timestampModified);
                return DataUtils.firebaseLoadOnce(cacheTimestamp, false).then(function(cacheTimestampRs){
                    var oldCacheTimestamp = $rootScope.storage.appSettings ? $rootScope.storage.appSettings[timestampModified] : 0;
                    var rs = cacheTimestampRs === oldCacheTimestamp;
                    if(!rs){
                        var appOptionsRef = firebaseDataRef.child(appOptions);
                        return DataUtils.firebaseLoadOnce(appOptionsRef).then(function(optionRs){
                            $rootScope.storage.appSettings = optionRs;
                            return !rs;
                        });
                    }
                    return !rs;
                });
            }

            function getSettings(){
                // console.log(DataUtils);
                // return $firebaseObject(items).$loaded();
                return DataUtils.getDataFirebaseLoadOnce(items);
            }
        }
    ]);
})();

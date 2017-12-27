(function () {
    'use strict';
    angular.module('app.settings').factory('settingsService', ['$q','$filter', 'authService', 'firebaseDataRef', '$firebaseObject', '$firebaseArray','appUtils', 
      function ($q, $filter, authService, firebaseDataRef, $firebaseObject, $firebaseArray, appUtils) {
        var appOptionsRef = firebaseDataRef.child('app-options');
        var options;
        if (authService.getCurrentUser()) {
            options = $firebaseObject(appOptionsRef);
        }
        var service = {
            options: options,
            get: get,
            updateGeneralSetting: updateGeneralSetting,
            updateAnalyticsSetting: updateAnalyticsSetting,
            updateMediaSetting: updateMediaSetting,
            updatePaymentSetting: updatePaymentSetting
        };

        return service;

        function get() {
            return options.$loaded().then(function (data) {
              return data;
          });
        }

       
        function updateGeneralSetting(settingToUpdate) {
            options.adminEmail = settingToUpdate.adminEmail;
            options.adminURL = settingToUpdate.adminURL;
            options.appURL = settingToUpdate.appURL;
            options.webURL = settingToUpdate.webURL;
            options.allowSignUp = settingToUpdate.allowSignUp;
            options.requireLogin = settingToUpdate.requireLogin;
            options.briefMaxChar = settingToUpdate.briefMaxChar;
            options.homePage = settingToUpdate.homePage;
            options.commentsPerPage = settingToUpdate.commentsPerPage;
            options.postsPerPage = settingToUpdate.postsPerPage;
            options.feedImageDirectory = settingToUpdate.feedImageDirectory;
            options.feedPostMaxChar = settingToUpdate.feedPostMaxChar;
            options.membershipApplicationPaymentImageDirectory = settingToUpdate.membershipApplicationPaymentImageDirectory;
            options.membershipApplicationImageDirectory = settingToUpdate.membershipApplicationImageDirectory;
            options.timestampModified = appUtils.getTimestamp();
            // App Setting
            options.appName = settingToUpdate.appName;
            options.appURL = settingToUpdate.appURL;
            options.appLogo = settingToUpdate.appLogo;
            options.androidBuildVersion = settingToUpdate.androidBuildVersion;
            options.androidDownloadURL = settingToUpdate.androidDownloadURL;
            options.iosBuildVersion = settingToUpdate.iosBuildVersion;
            options.iosDownloadURL = settingToUpdate.iosDownloadURL;
            options.appUpdateMessage = settingToUpdate.appUpdateMessage;
            //Nagigation Setting
            options.bottomMenu = settingToUpdate.bottomMenu;
            options.topMenuLocation = settingToUpdate.topMenuLocation;
            options.enableEcommerce = settingToUpdate.enableEcommerce;
            return options.$save().then(function () {
                    return { result: true, errorMsg: "" };
                }).catch(function (error) {
                    return { result: false, errorMsg: error };
                });
            //}
            //return $q.when({ result: false, errorMsg: "Information could not be found!" });
        }

        function updateAnalyticsSetting(settingToUpdate) {
            //options.$loaded().then(function (data) {});
            options.piwikSiteId = settingToUpdate.piwikSiteId;
            options.piwikURL = settingToUpdate.piwikURL;
            options.timestampModified = appUtils.getTimestamp();
            return options.$save().then(function () {
                return { result: true, errorMsg: "" };
            }).catch(function (error) {
                return { result: false, errorMsg: error };
            });
            //}
            //return $q.when({ result: false, errorMsg: "Information could not be found!" });
            
        }

        function updateMediaSetting(settingToUpdate) {
            options.largeSizeH = settingToUpdate.largeSizeH;
            options.largeSizeW = settingToUpdate.largeSizeW;
            options.mediumSizeH = settingToUpdate.mediumSizeH;
            options.mediumSizeW = settingToUpdate.mediumSizeW;
            options.thumbSizeH = settingToUpdate.thumbSizeH;
            options.thumbSizeW = settingToUpdate.thumbSizeW;
            options.timestampModified = appUtils.getTimestamp();
            return options.$save().then(function () {
                return { result: true, errorMsg: "" };
            }).catch(function (error) {
                return { result: false, errorMsg: error };
            });
            //}
            //return $q.when({ result: false, errorMsg: "Information could not be found!" });
        }

        function updatePaymentSetting(settingToUpdate) {
            options.paypalKeyDev = settingToUpdate.paypalKeyDev;
            options.paypalKeyProd = settingToUpdate.paypalKeyProd;
            options.timestampModified = appUtils.getTimestamp();
            return options.$save().then(function () {
                return { result: true, errorMsg: "" };
            }).catch(function (error) {
                return { result: false, errorMsg: error };
            });
            //}
            //return $q.when({ result: false, errorMsg: "Information could not be found!" });
        }

      }
    ]);
})();

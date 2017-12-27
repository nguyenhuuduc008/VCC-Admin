(function(){
	'use strict';
  	angular.module('app.utils')
  	.factory('FileUploadService', FileUploadService);

  	/** @ngInject **/
  	function FileUploadService(storageRef, appUtils, $q){
  		var service = {
  			upload: upload,
  			genThumbAndLowRes: genThumbAndLowRes
  		};
  		return service;

  		function upload(folderPath, file, metadata){
  			var filename  = appUtils.formatImgFileName(file.name, !file.width?'ori': file.width+'x'+file.height);
  			return storageRef.child(folderPath+'/'+filename).put(file.data || file, metadata);
  		}
  		function genThumbAndLowRes(file){
  			var _URL = window.URL || window.webkitURL,
  				img = new Image(),
  				initGen = false;

  			img.src = _URL.createObjectURL(file);
  			var deferred = $q.defer();
  			img.onload = function(){
  				if(initGen){
  					return;
  				}
  				var thumb = appUtils.imageHandler(img, true, file.type);
  				thumb.name = file.name;
  				thumb.type = file.type;

  				var lowRes = appUtils.imageHandler(img, false, file.type);
  				lowRes.name = file.name;
  				lowRes.type = file.type;
  				initGen = true;
  				deferred.resolve({
  					thumb: thumb, 
  					lowRes: lowRes
  				});

  			};
        img.onerror = function(){
          deferred.resolve({
            thumb: null, 
            lowRes: null
          });
        };
  			return deferred.promise;
  		}
  	}
})();
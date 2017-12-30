(function(){
	'use strict';
	angular.module('app.utils').factory('appUtils',['$http','$q','APP_CONFIG', '$filter', '$uibModal', function($http,$q,APP_CONFIG, $filter, $uibModal){
		var geoCodeUrl =  APP_CONFIG.geocodeMapUrl || 'https://maps.googleapis.com/maps/api/geocode/';

		var statelist = [
			{text: 'Alabama', value: 'AL'},
			{text: 'Alaska', value: 'AK'},
			{text: 'Arizona', value: 'AZ'},
			{text: 'Arkansas', value: 'AR'},
			{text: 'California', value: 'CA'},
			{text: 'Colorado', value: 'CO'},
			{text: 'Connecticut', value: 'CT'},
			{text: 'Delaware', value: 'DE'},
			{text: 'District Of Columbia', value: 'DC'},
			{text: 'Florida', value: 'FL'},
			{text: 'Georgia', value: 'GA'},
			{text: 'Hawaii', value: 'HI'},
			{text: 'Idaho', value: 'ID'},
			{text: 'Illinois', value: 'IL'},
			{text: 'Indiana', value: 'IN'},
			{text: 'Iowa', value: 'IA'},
			{text: 'Kansas', value: 'KS'},
			{text: 'Kentucky', value: 'KY'},
			{text: 'Louisiana', value: 'LA'},
			{text: 'Maine', value: 'ME'},
			{text: 'Maryland', value: 'MD'},
			{text: 'Massachusetts', value: 'MA'},
			{text: 'Michigan', value: 'MI'},
			{text: 'Minnesota', value: 'MN'},
			{text: 'Mississippi', value: 'MS'},
			{text: 'Missouri', value: 'MO'},
			{text: 'Montana', value: 'MT'},
			{text: 'Nebraska', value: 'NE'},
			{text: 'Nevada', value: 'NV'},
			{text: 'New Hampshire', value: 'NH'},
			{text: 'New Jersey', value: 'NJ'},
			{text: 'New Mexico', value: 'NM'},
			{text: 'New York', value: 'NY'},
			{text: 'North Carolina', value: 'NC'},
			{text: 'North Dakota', value: 'ND'},
			{text: 'Ohio', value: 'OH'},
			{text: 'Oklahoma', value: 'OK'},
			{text: 'Oregon', value: 'OR'},
			{text: 'Pennsylvania', value: 'PA'},
			{text: 'Rhode Island', value: 'RI'},
			{text: 'South Carolina', value: 'SC'},
			{text: 'South Dakota', value: 'SD'},
			{text: 'Tennessee', value: 'TN'},
			{text: 'Texas', value: 'TX'},
			{text: 'Utah', value: 'UT'},
			{text: 'Vermont', value: 'VT'},
			{text: 'Virginia', value: 'VA'},
			{text: 'Washington', value: 'WA'},
			{text: 'West Virginia', value: 'WV'},
			{text: 'Wisconsin', value: 'WI'},
			{text: 'Wyoming', value: 'WY'}
		];

		var postStatus = [
			{key: '0', value: 'Draff'},
			{key: '1', value: 'Pending'}
		];

		var postVisibility = [
			{key: '0', value: 'Public', text: 'Public - Stick this post to the front page'},
			{key: '1', value: 'Password Protected', text: 'Password protected'},
			{key: '2', value: 'Private', text: 'Private'}
		];

		var commentStatus = [
			{key: '0', value: 'Bulk Actions', text: 'Bulk Actions'},
			{key: '1', value: 'Pending', text: 'Pending'},
			{key: '2', value: 'Approve', text: 'Approve'},
			{key: '3', value: 'Mark as Spam', text: 'Mark as Spam'},
			{key: '4', value: 'Move to Trash', text: 'Move to Trash'}
		];

		var eventRegisStatus = [
			{key: '0', value: 'Approved'},
			{key: '1', value: 'Not Approved'},
			{key: '2', value: 'Pending Payment'},
			{key: '3', value: 'Wait List'}
		];

		var logEvent = {
			changeStatus : 'ChangeStatus',
			createApp : 'CreateApp',
			editApp: 'EditApp',
			submitApp: 'SubmitApp'
		};

		var dateNow = new Date();
		var lastMonth = new Date(dateNow.getFullYear(), dateNow.getMonth() - 1, dateNow.getDate());
		var last2Month = new Date(dateNow.getFullYear(), dateNow.getMonth() - 2, dateNow.getDate());
		var last3Month = new Date(dateNow.getFullYear(), dateNow.getMonth() - 3, dateNow.getDate());
		var last6Month = new Date(dateNow.getFullYear(), dateNow.getMonth() - 6, dateNow.getDate());
		var thisYear = new Date(dateNow.getFullYear(), 0, 1);
		var lastYear = new Date(dateNow.getFullYear(), dateNow.getMonth() - 12, dateNow.getDate());

      	var currentDate = $filter('date')(dateNow, 'MM/dd/yyyy');
		var postFilterDates = [
			{key: 0, value: 'All', text: 'All dates'},
			{key: 1, value: Date.parse(currentDate), text: 'Today'},
			{key: 2, value: Date.parse(lastMonth), text: 'Last 30 days'},
			{key: 3, value: Date.parse(last2Month), text: 'Last 60 days'},
			{key: 4, value: Date.parse(last3Month), text: 'Last 90 days'},
			{key: 5, value: Date.parse(last6Month), text: 'Last 6 months'},
			{key: 6, value: Date.parse(thisYear), text: 'This year'},
			{key: 7, value: Date.parse(lastYear), text: 'Last year'}
		];

		var appMethods = [
			{key: 0, value: 'App Manual'},
			{key: 1, value: 'Web Admin OCR'},
			{key: 2, value: 'App OCR'},
			{key: 3, value: 'Web Admin Manual'}
		];

		var appStatus = [
			{key: -1, value: 'All Status'},
			{key: 0, value: 'New'},
			{key: 1, value: 'Processing'},
			{key: 2, value: 'Verified'},
			{key: 3, value: 'Billing Pending'},
			{key: 4, value: 'Billing Approved'},
			{key: 5, value: 'Billing Denied'},
			{key: 6, value: 'Cancelled'},
			{key: 7, value: 'Error'}
		];

		var appFileStatus = [
			{key: 0, value: 'New'},
			{key: 1, value: 'Scheduled'},
			{key: 2, value: 'Processing'},
			{key: 3, value: 'Completed'}
		];

		var appStatelist = [
			{text: 'Arkansas', value: 'AR'},
			{text: 'Colorado', value: 'CO'},
			{text: 'Florida', value: 'FL'},
			{text: 'Georgia', value: 'GA'},
			{text: 'Kansas', value: 'KS'},
			{text: 'Missouri', value: 'MO'},
			{text: 'New Jersey', value: 'NJ'},
			{text: 'Oklahoma', value: 'OK'},
			{text: 'Pennsylvania', value: 'PA'},
			{text: 'Texas', value: 'TX'}
		];
		var appFullAddonStates = [
			{text: 'Oklahoma', value: 'OK'},
			{text: 'Texas', value: 'TX'}
		];
		var appNumAdults = [
			{key: '1', text: 'Individual', value: 'Individual'},
			{key: '2', text: 'Couple', value: 'Couple'}
		];
		var appCycles = [
			{key: '2', text: 'Monthly', value: 'Monthly'},
			{key: '1', text: 'Annual', value: 'Annual'}
		];
		var appPaymentMethods = [
			{key: '0', text: 'Card', value: 'Credit'},
			{key: '1', text: 'Cash', value: 'Cash'},
			{key: '2', text: 'Check', value: 'Check'}
		];

		//Recipe
		var nutritionTypes = [
			{key: '0', name: 'Calories', abbrName: 'Calories', unit: '', primary: true, daylyAmount: 3000},
			{key: '1', name: 'Total Cholesterol', abbrName: 'CHOL', unit: 'mg', primary: true, daylyAmount: 3000},
			{key: '2', name: 'Total Fat', abbrName: 'FAT', unit: 'g', primary: true, daylyAmount: 3000},
			{key: '3', name: 'Solidum', abbrName: 'Solidum', unit: 'mg', primary: true, daylyAmount: 3000},
			{key: '4', name: 'Total Carbohydrate', abbrName: 'CARBS', unit: 'g', primary: true, daylyAmount: 3000},
			{key: '5', name: 'Dietary Fiber', abbrName: 'FIBER', unit: 'g', primary: false, daylyAmount: 3000},
			{key: '6', name: 'Vitamin A', abbrName: 'Vitamin A', unit: 'g', primary: false, daylyAmount: 3000}
		];

		var imageHandlerConfig = {
			thumbnail: 150,
			lowRes: 780,
			quality: 1
		};
		
		var orderStatus = [
			{key: 0, value: 'New'},
			{key: 1, value: 'Pending Payment'},
			{key: 2, value: 'Payment Approved'},
			{key: 3, value: 'Completed'},
			{key: 4, value: 'Canceled'},
			{key: 5, value: 'Refunded'},
			{key: 6, value: 'Shipped'},
			{key: 7, value: 'On Hold'},
			{key: 8, value: 'Payment Failed'}
		];
		var orderActiveStatus = {
			0: 'New',
			1: 'Pending Payment',
			3: 'Reviewing',
			4: 'Waiting on Customer',
			5: 'Approved',
			6: 'Shipped',
			7: 'Completed'
		};

		var doctorTitle = [
			{text: 'Dr.', value: 'Dr'},
			{text: 'D.D.S.', value: 'D.D.S'},
			{text: 'M.D.', value: 'M.D'},
			{text: 'M.O.', value: 'M.O'},
			{text: 'Ph.D.', value: 'Ph.D'}
		];

		var gender = [
			{text: 'Male', value: 'Male'},
			{text: 'Female', value: 'Female'}
		];
		
		var directoryTypes = [
			{text: 'Doctor', value: '0'},
			{text: 'Personal Training', value: '1'}
		];

		var mediaIcons = [
			{type: 'file', value: './img/file.png'},
			{type: 'audio', value: './img/audio_file.png'},
			{type: 'mp3', value: './img/audio_file.png'},
			{type: 'pdf', value: './img/adobe-pdf-document.jpg'},
			{type: 'application/pdf', value: './img/adobe-pdf-document.jpg'},
			{type: 'powerpoint', value: './img/file.png'},
			{type: 'excel', value: './img/file.png'},
			{type: 'code', value: './img/file.png'},
			{type: 'txt', value: './img/file.png'}
		];

		var imgFileIcons = [
			{type: 'image/jpeg', value: './img/img.png'},
			{type: 'jpeg', value: './img/img.png'},
			{type: 'jpg', value: './img/img.png'},
			{type: 'image/jpg', value: './img/img.png'},
			{type: 'png', value: './img/img.png'},
			{type: 'image/png', value: './img/img.png'},
			{type: 'gif', value: './img/img.png'},
			{type: 'image/gif', value: './img/img.png'},
			{type: 'tif', value: './img/img.png'},
			{type: 'image/tif', value: './img/img.png'}
		];

		var videoFileIcons = [
			{type: 'mov', value: './img/youtube-play.jpg'},
			{type: 'video/mov', value: './img/youtube-play.jpg'},
			{type: 'mp4', value: './img/youtube-play.jpg'},
			{type: 'video/mp4', value: './img/youtube-play.jpg'}
		];

		var transactonRequirements = [{
				value: '0',
				text: 'Bitcoin to VCC',
			}
			// ,{
			//     value: '1',
			//     text: 'VCC to Bitcoin',
			// }
		];

		var utils = {
			showLoading: showLoading,
			hideLoading: hideLoading,
			getAllState: getAllState,
			getBlankImgProfile: getBlankImgProfile,
			generatePassword: generatePassword,
			generateId: generateId,
			getImageFBUrl: getImageFBUrl,
			formatImgFileName: formatImgFileName,
			checkAllCheckBox: checkAllCheckBox,
			getTreeCategories: getTreeCategories,
			getTreeMenus: getTreeMenus,
			postStatus: postStatus,
			postVisibility: postVisibility,
			getItemByKey: getItemByKey,
			postFilterDates: postFilterDates,
			getTimestamp: getTimestamp,
			popupMediaMulti: popupMediaMulti,
			popupMediaSingle: popupMediaSingle,
			commentStatus: commentStatus,
			eventRegisStatus: eventRegisStatus,
			sortArray: sortArray,
			toArray: toArray,
			formatBytesSize: formatBytesSize,
			appMethods: appMethods,
			appStatus: appStatus,
			appFileStatus: appFileStatus,
			appStatelist: appStatelist,
			appFullAddonStates: appFullAddonStates,
			uploadFileDropzone: uploadFileDropzone,
			appNumAdults: appNumAdults,
			appCycles: appCycles,
			getCardType: getCardType,
			transformObject: transformObject,
			appPaymentMethods: appPaymentMethods,
			formatNumber: formatNumber,
			formatCurrency: formatCurrency,
			logEvent: logEvent,
			imageHandler: imageHandler,
			getLowRes: getLowRes,
			nutritionTypes: nutritionTypes,
			injectTmestamp: injectTmestamp,
			doctorTitle: doctorTitle,
			gender: gender,
			directoryTypes: directoryTypes,
			getCurrentPosition: getCurrentPosition,
			getLatLonByAddress: getLatLonByAddress,
			getAddressByLatLng: getAddressByLatLng,
			dataLetterPicture: dataLetterPicture,
			orderStatus: orderStatus,
			orderActiveStatus: orderActiveStatus,
			mediaIcons: mediaIcons,
			imgFileIcons: imgFileIcons,
			videoFileIcons: videoFileIcons,
			mediaImgSrc: mediaImgSrc,
			transactonRequirements: transactonRequirements
		};
		
        function mediaImgSrc(item, imgMaxWidth){
			if(!imgMaxWidth){
				imgMaxWidth = '100px';
			}
            var imgRs = _.find(imgFileIcons, function(o) { return o.type === item.fileType; });
            if(imgRs){
                var imgSrc = !item.thumbnail ? item.downloadUrl : item.thumbnail.downloadUrl;
                return '<img style="max-width: ' + imgMaxWidth + '" src="' + item.downloadUrl + '" title="' + item.fileName + '" alt="' + item.alternativeText + '"/>';
            }
            
            var videoRs = _.find(videoFileIcons, function(o) { return o.type === item.fileType; });
            if(videoRs){
                return '<img style="max-width: ' + imgMaxWidth + '" src="' + videoRs.value + '" title="' + item.fileName + '" alt="' + item.alternativeText + '"/>';
            }
            var rs = _.find(mediaIcons, function(o) { return o.type === item.fileType; });
            if(rs){
                return '<img style="max-width: ' + imgMaxWidth + '" src="' + rs.value + '" title="' + item.fileName + '" alt="' + item.alternativeText + '"/>';
            }
            var fileIcon = mediaIcons[0];
            return '<img style="max-width: ' + imgMaxWidth + '" src="' + fileIcon.value + '" title="' + item.fileName + '" alt="' + item.alternativeText + '"/>';
        }

		function showLoading () {
			var el = angular.element(document.querySelectorAll("[ng-spinner-bar]"));
			if ( el ) el.removeClass('hide'); 
		}

		function hideLoading () {
			var el = angular.element(document.querySelectorAll("[ng-spinner-bar]"));
			if ( el ) el.addClass('hide'); 
		}

		function getAllState(){
			return statelist;
		}

		function getBlankImgProfile(){
			return APP_CONFIG.profileBlankImg;
		}

		function generatePassword() {
			var letterLeng = 10,digitLeng = 2,
			text = "",
			letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
			digit = "0123456789";

	    	for( var i=0; i < letterLeng; i++ ){
	    		text += letter.charAt(Math.floor(Math.random() * letter.length));
	    	}

	    	for( var j=0; j < digitLeng; j++ ){
	    		text += digit.charAt(Math.floor(Math.random() * digit.length));
	    	}
	        	
	    	return text;		 
		}

		function generateId(){
			var letterLeng = 15,digitLeng = 5,
			text = "",
			letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
			digit = "0123456789";

	    	for( var i=0; i < letterLeng; i++ ){
	    		text += letter.charAt(Math.floor(Math.random() * letter.length));
	    	}

	    	for( var j=0; j < digitLeng; j++ ){
	    		text += digit.charAt(Math.floor(Math.random() * digit.length));
	    	}
	        	
	    	return text;
		}

		function getImageFBUrl(imageUri){
			if (imageUri.startsWith('gs://')) {
			    return firebase.storage().refFromURL(imageUri).getMetadata().then(function(metadata) {
			        return $q.when({imgUrl: metadata.downloadURLs[0]});
			    });
			} else {
			      return $q.when({imgUrl: imageUri});
			}
		}

		function formatImgFileName(name, size){
			var timestamp = +new Date(), 
        		ts = timestamp.toString(),
				parts = name.split("."),
				type = parts[parts.length -1];
				
			size = size !== "" ? "-" + size : "";
			var fullName = parts[0], i;
            for(i = 1 ; i < parts.length - 1; i++){
                fullName += '.' + parts[i];
            }
        	return fullName + "_" + ts + size + "." + type;
		}

		function checkAllCheckBox(controlId,name){
			var _isChecked = function(Id) {
				 return $("#" + Id).is(':checked');
			};

			var check = _isChecked(controlId);
	        if (typeof(check) === 'undefined') {
	            check = false;
	        }
	        $('input[name=' + name + ']').attr('checked', check);
		}

		function getTreeCategories(cateItems, checkedItems){
			var categories = [];
			_.forEach(cateItems, function(value, key) {
				var subCates = _.filter(cateItems, ['parent', value.$id]);
				value.children = [];
				if(subCates.length > 0){
			  		value.children = subCates;
			  	}

				value.checked = false;
			  	if(checkedItems && checkedItems.length > 0){
					var checkedCates = _.filter(checkedItems, function(o) { 
						if ( o == value.$id ) {
							checkedItems.push(value.$id);
							return true;
						}
						return false; 
					});
					if(checkedCates.length > 0){
						value.checked = true;
					}
			  	}
			  	categories.push(value);
			});
			categories = _.find(categories,function(item){return item.parent ==='' || item.parent === 'root';});
			return categories;
		}
		
		function getTreeMenus(cateItems, checkedItems){
			var categories = [];
			_.forEach(cateItems, function(value, key) {
				var parent = value.data ? value.data.parent : '';
				var subCates = _.filter(cateItems, ['name', parent]);
				value.children = [];
				if(subCates.length > 0){
			  		value.children = subCates;
			  	}

				value.checked = false;
			  	if(checkedItems && checkedItems.length > 0){
					var checkedCates = _.filter(checkedItems, function(o) { 
						if ( o == value.$id ) {
							checkedItems.push(value.$id);
							return true;
						}
						return false; 
					});
					if(checkedCates.length > 0){
						value.checked = true;
					}
			  	}
			  	categories.push(value);
			});
			categories = _.find(categories,function(item){return item.parent ==='' || item.parent === 'root';});
			return categories;
		}

		function getItemByKey(items, keyVal){
			var rs = _.filter(items, ['key', keyVal]);
			if(rs.length > 0) return rs[0];
			return {};
		}

		function getTimestamp(){

			if(firebase && firebase.database){
				var offsetRef = firebase.database().ref(".info/serverTimeOffset");
				offsetRef.on("value", function(snap) {
					var offset = snap.val();
					var estimatedServerTimeMs = new Date().getTime() + offset;
					console.log(estimatedServerTimeMs);
					return estimatedServerTimeMs;
				});
				//return firebase.database.ServerValue.TIMESTAMP;
			}
			return + new Date();
		}
		function injectTmestamp(obj, isCreate){
			var ts = getTimestamp();
			if(isCreate){
				obj.timestampCreated = ts;
			}
			obj.timestampModified = ts;
		}

		function popupMediaMulti(selectedItems, onlyImages, hideInsertButton){
            var modalInstance = $uibModal.open({
                templateUrl: 'app/media/popup/images_gallery.tpl.html',
                controller: 'ImagesGalleryCtrl as galleryVm',
                size: 'lg',
                resolve: {
                    isFeatured: function () {
                       return false;
                    },
					onlyImages: function(){
						return onlyImages;
					},
					selectedItems: function(){
						return selectedItems;
					},
					hideInsertButton: function(){
						return hideInsertButton;
					}
                }
            });
			//return modalInstance.result;
			return modalInstance.result.then(function (result) {
                $('.widgets').parent().show();
				return result;
            }, function (res) {
                 $('.widgets').parent().show();
				 return [];
            });
		}

		function popupMediaSingle(){
			var modalInstance = $uibModal.open({
                templateUrl: 'app/media/popup/images_gallery.tpl.html',
                controller: 'ImagesGalleryCtrl as galleryVm',
                size: 'lg',
                resolve: {
                    isFeatured: function () {
                       return true;
                    }
                }
            });

            return modalInstance.result;
		}

		function sortArray(arr , sortField, isAsc){
			return arr.sort(function(a,b){
				if(isAsc)
					return a[sortField] - b[sortField];
				else
					return b[sortField] - a[sortField];
			});	
		}

		function toArray(targetObject) {
		    if(!targetObject){return [];}
		    return Object.keys(targetObject).map(
		      function (key) {
		        return {
		        	key: key,
		        	value: targetObject[key]
		        };
		    });
		}

		function formatBytesSize(bytes,decimals) {
		   if(bytes === 0) return '0 Byte';
		   var k = 1000;
		   var dm = decimals + 1 || 3;
		   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
		   var i = Math.floor(Math.log(bytes) / Math.log(k));
		   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
		}

		function uploadFileDropzone(func, membershipMediaService, currentUser){
			//Overite submitRequest method of dropzone.js file
			Dropzone.prototype.submitRequest = function(xhr, formData, files) {
				// var formDropzone = $("#form-dropzone:visible");
				$('.dz-upload:visible').css('background', 'green');
				var file = files[0];
				// Create the file metadata
				var metadata = {
					contentType: file.type
				};
				// Upload file and metadata to the object 'images/mountains.jpg'
				var uploadTask = membershipMediaService.uploadFile('application/', file, metadata);// Listen for state changes, errors, and completion of the upload.
				uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
				function(snapshot) {
					// Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
					var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
					var dzProgress = $('.dz-progress:visible');
					dzProgress.find('.dz-upload').css('width', progress + '%');
					if(progress == 100){
					setTimeout(function(){
						dzProgress.hide();
					}, 1000);
					}

					switch (snapshot.state) {
					case firebase.storage.TaskState.PAUSED: // or 'paused'
						break;
					case firebase.storage.TaskState.RUNNING: // or 'running'
						break;
					}
				}, function(error) {
				switch (error.code) {
					case 'storage/unauthorized':
					// User doesn't have permission to access the object
					break;

					case 'storage/canceled':
					// User canceled the upload
					break;

					case 'storage/unknown':
					// Unknown error occurred, inspect error.serverResponse
					break;
				}
				}, function() {
					// Upload completed successfully, now we can get the download URL
					var downloadURL = uploadTask.snapshot.downloadURL;
					var imgFile = {
						fileName : uploadTask.snapshot.metadata.name,
						fileSize :  uploadTask.snapshot.metadata.size,
						type :  uploadTask.snapshot.metadata.contentType,
						timestampCreated : getTimestamp(),
						timestampModified :  getTimestamp(),
						storageLocation :  'gs://'+ uploadTask.snapshot.metadata.bucket +'/'+ uploadTask.snapshot.metadata.fullPath,
						downloadUrl :  uploadTask.snapshot.downloadURL,
						author :  currentUser.email,
						bucket:  uploadTask.snapshot.metadata.bucket,
						fullPath: uploadTask.snapshot.metadata.fullPath,
						displayName: file.name.split('.')[0],
						fileType:file.name.split('.')[1],
						description: '',
						alternativeText: '',
						caption: ''
					};

					//Execute function
					func(imgFile);

				});

			};
		}

		function getCardType(text){
			var num, regAmex, regDisc, regMast, regVisa;
			if (!text) {
				return;
			}
			regAmex = new RegExp("^(34|37)");
			regVisa = new RegExp("^4");
			regMast = new RegExp("^5[1-5]");
			regDisc = new RegExp("^60");
			switch (false) {
			case !regAmex.test(text):
				return 'Amex';
			case !regVisa.test(text):
				return 'Visa';
			case !regMast.test(text):
				return 'Master';
			case !regDisc.test(text):
				return 'Discover';
			default: 
				return "Visa";
			}
		}

		function transformObject(item, update){
			// var attrs = Object.keys(item).length > (Object.keys(update).length + 2) ? item : update;
			for(var attr in update) {
				// if(item[attr] && update[attr]){
				if(update[attr]){
					item[attr] = update[attr];
				}
			}
			return item;
		}

		function formatCurrency(value){
			if(value === null || value === undefined || value === "") return 0;

			return parseFloat(value).toFixed(2);
		}

		function formatNumber(value){
			if(value === null || value === undefined || value === "") return 0;

			return parseFloat(value);
		}

		// Image handler
		function imageHandler(img, isThumb, mimeType) {
			if (!mimeType) mimeType = 'image/jpeg';

			var canvas = document.createElement('canvas');

			canvas.width = img.width;
			canvas.height = img.height;
			
			canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

			if ( isThumb ) {
				canvas = scaleCanvasWithAlgorithm(canvas, imageHandlerConfig.thumbnail);
			} else {
				canvas = scaleCanvasWithAlgorithm(canvas, imageHandlerConfig.lowRes);
			}
			
			return {
				width: canvas.width,
				height: canvas.height,
				data: dataURItoBlob(canvas.toDataURL(mimeType, imageHandlerConfig.quality))
			};
		}

		function getLowRes(img, maxWidth, quality, mimeType) {
			if (!mimeType) mimeType = 'image/jpeg';

			var canvas = document.createElement('canvas');

			canvas.width = img.width;
			canvas.height = img.height;
			
			canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

			canvas = scaleCanvasWithAlgorithm(canvas, maxWidth);			
			
			return {
				width: canvas.width,
				height: canvas.height,
				data: dataURItoBlob(canvas.toDataURL(mimeType, quality))
			};
		}

		function dataURItoBlob(dataURI) {
			// convert base64/URLEncoded data component to raw binary data held in a string
			var byteString;
			if (dataURI.split(',')[0].indexOf('base64') >= 0)
				byteString = atob(dataURI.split(',')[1]);
			else
				byteString = unescape(dataURI.split(',')[1]);

			// separate out the mime component
			var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

			// write the bytes of the string to a typed array
			var ia = new Uint8Array(byteString.length);
			for (var i = 0; i < byteString.length; i++) {
				ia[i] = byteString.charCodeAt(i);
			}

			return new Blob([ia], {type:mimeString});
		}

		function scaleCanvasWithAlgorithm ( canvas, maxWidth ) {
			var scaledCanvas = document.createElement('canvas');

			var scale = maxWidth / canvas.width;

			scaledCanvas.width = canvas.width * scale;
			scaledCanvas.height = canvas.height * scale;

			var srcImgData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
			var destImgData = scaledCanvas.getContext('2d').createImageData(scaledCanvas.width, scaledCanvas.height);

			applyBilinearInterpolation(srcImgData, destImgData, scale);

			scaledCanvas.getContext('2d').putImageData(destImgData, 0, 0);

			return scaledCanvas;
		}

		function applyBilinearInterpolation ( srcCanvasData, destCanvasData, scale ) {
			function inner(f00, f10, f01, f11, x, y) {
				var un_x = 1.0 - x;
				var un_y = 1.0 - y;
				return (f00 * un_x * un_y + f10 * x * un_y + f01 * un_x * y + f11 * x * y);
			}
			var i, j;
			var iyv, iy0, iy1, ixv, ix0, ix1;
			var idxD, idxS00, idxS10, idxS01, idxS11;
			var dx, dy;
			var r, g, b, a;
			for (i = 0; i < destCanvasData.height; ++i) {
				iyv = i / scale;
				iy0 = Math.floor(iyv);
				// Math.ceil can go over bounds
				iy1 = (Math.ceil(iyv) > (srcCanvasData.height - 1) ? (srcCanvasData.height - 1) : Math.ceil(iyv));
				for (j = 0; j < destCanvasData.width; ++j) {
					ixv = j / scale;
					ix0 = Math.floor(ixv);
					// Math.ceil can go over bounds
					ix1 = (Math.ceil(ixv) > (srcCanvasData.width - 1) ? (srcCanvasData.width - 1) : Math.ceil(ixv));
					idxD = (j + destCanvasData.width * i) * 4;
					// matrix to vector indices
					idxS00 = (ix0 + srcCanvasData.width * iy0) * 4;
					idxS10 = (ix1 + srcCanvasData.width * iy0) * 4;
					idxS01 = (ix0 + srcCanvasData.width * iy1) * 4;
					idxS11 = (ix1 + srcCanvasData.width * iy1) * 4;
					// overall coordinates to unit square
					dx = ixv - ix0;
					dy = iyv - iy0;
					// I let the r, g, b, a on purpose for debugging
					r = inner(srcCanvasData.data[idxS00], srcCanvasData.data[idxS10], srcCanvasData.data[idxS01], srcCanvasData.data[idxS11], dx, dy);
					destCanvasData.data[idxD] = r;

					g = inner(srcCanvasData.data[idxS00 + 1], srcCanvasData.data[idxS10 + 1], srcCanvasData.data[idxS01 + 1], srcCanvasData.data[idxS11 + 1], dx, dy);
					destCanvasData.data[idxD + 1] = g;

					b = inner(srcCanvasData.data[idxS00 + 2], srcCanvasData.data[idxS10 + 2], srcCanvasData.data[idxS01 + 2], srcCanvasData.data[idxS11 + 2], dx, dy);
					destCanvasData.data[idxD + 2] = b;

					a = inner(srcCanvasData.data[idxS00 + 3], srcCanvasData.data[idxS10 + 3], srcCanvasData.data[idxS01 + 3], srcCanvasData.data[idxS11 + 3], dx, dy);
					destCanvasData.data[idxD + 3] = a;
				}
			}
		}

		function getCurrentPosition(){
			var deferred = $q.defer();
			var onSuccess = function(position){
				deferred.resolve({data: {latitude: position.coords.latitude, longitude: position.coords.longitude}});
			};
			var onFail = function(error){
				deferred.reject();
			};  				
			navigator.geolocation.getCurrentPosition(onSuccess, onFail, { timeout: 10000 });
			return deferred.promise;
		}

		function getLatLonByAddress(data){
			var address = data.address + ", " + data.city + ", " + data.state + ", " + data.zipCode + ", US";
			return $http.get(geoCodeUrl + 'xml?sensor=false&address=' + address).then(function(res){
				if(res.statusText !== 'OK' && res.status != 200){
					return [];
				}
				var xml = res.data;
				var parser = new DOMParser();
				var xmlDoc = parser.parseFromString(xml, "application/xml");
				var locationNodes = xmlDoc.getElementsByTagName("location");
				if(locationNodes.length === 0){
					return [];
				}
				return _.map(locationNodes,function (location) {
					if(location.children){
						var latNode = location.children[0].innerHTML;
						var lngNode = location.children[1].innerHTML;
						if (latNode && lngNode)
						{
							return {
								lat: latNode,
								lng: lngNode
							};
						}
					}
				});
			},function(error){
				return [];
			});
		}

		function getAddressByLatLng(position){
			var latLng = position.latitude + ',' + position.longitude;
			var result ={
				address: '',
				city: '',
				state: '',
				zipCode: ''
			};
			return $http.get(geoCodeUrl + 'xml?sensor=true&latlng=' + latLng).then(function(res){
				if(res.statusText !== 'OK' && res.status != 200){
					return [];
				}
				var xml = res.data;
				var parser = new DOMParser();
				var xmlDoc = parser.parseFromString(xml, "application/xml");
				var resultNodes = xmlDoc.getElementsByTagName("result");
				if(resultNodes.length === 0){
					return result;
				}
				var fullAddress = resultNodes[0].getElementsByTagName("formatted_address");
				if(fullAddress.length === 0){
					return result;
				}
				if(fullAddress[0].innerHTML === '')
					return result;

				var str = fullAddress[0].innerHTML.split(',');
				if(str.length > 0){
					angular.extend(result,{
						address: $.trim(str[0]) || '',
						city: $.trim(str[1]) || ''
					});

					if(str[2] !== ''){
						var attr =  $.trim(str[2]).split(' ');
						if(attr.length > 0){
							angular.extend(result,{
								state: attr[0] || '',
								zipCode: attr[1] || ''
							});
						}
					}
				}
				return result;
			},function(error){
				return result;
			});
		}

		function dataLetterPicture(item){
			var dateLetter;
			if(item.firstName && item.lastName)
				dateLetter = item.firstName.charAt(0).toUpperCase() + item.lastName.charAt(0).toUpperCase();
			else
				dateLetter = 'Doctors'.charAt(0).toUpperCase();

            return dateLetter;
        }

		return utils;
	}]);

})();
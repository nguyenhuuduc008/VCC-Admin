(function () {
	'use strict';

	angular
		.module('app.auth').factory("authService", authService);
		/** @ngInject */
		function authService($rootScope, $firebaseAuth, $q, firebaseDataRef, $http, APP_CONFIG) {
			var auth = $firebaseAuth();

			var service = {
				auth: auth,
				login: login,
				logout: logout,
				sendWelcomeEmail: sendWelcomeEmail,
				waitForSignIn: waitForSignIn,
				requireSignIn: requireSignIn,
				createUserWithEmail: createUserWithEmail,
				deleteAuthUser: deleteAuthUser,
				changePasswordAuth: changePasswordAuth,
				resetPasswordAuth: resetPasswordAuth,
				getCurrentUser: getCurrentUser,
				checkUserIsExisted: checkUserIsExisted,
				createFBUser: createFBUser,
				createMemShipEmployee: createMemShipEmployee,
				getUserInfo : getUserInfo
			};

			return service;

			function login(user) {
				return auth.$signInWithEmailAndPassword(user.userName, user.password);
			}

			function logout() {
				return auth.$signOut();
			}

			function getCurrentUser() {
				var currentUser = $rootScope.storage.currentUser;
				if(currentUser === undefined || currentUser === null){
					currentUser = auth.$getAuth();
					if(currentUser !== undefined && currentUser !== null){
						currentUser.$id = currentUser.uid;
						currentUser.userRoles = currentUser.userRoles || [];		
					}
				}
				return currentUser;
			}

			function sendWelcomeEmail(email) {
				auth.emails.push({
					emailAddress: email
				});
			}

			function waitForSignIn() {
				return auth.$waitForSignIn();
			}

			function requireSignIn() {
				return auth.$requireSignIn();
			}

			function createUserWithEmail(user) {
				return auth.$createUserWithEmailAndPassword(user.email, user.password).then(function (result) {
					return $q.when({ result: true, errorMsg: '', errorCode: '', uid: result.uid });
				}).catch(function (error) {
					var errorCode = error.code;
					var errorMessage = error.message;
					return $q.when({ result: false, errorMsg: errorMessage, errorCode: errorCode, uid: '' });
				});
			}

			function deleteAuthUser(uid) {
				var reqs = [];
				reqs.push(firebaseDataRef.child('users/' + uid).remove());
				return $q.all(reqs).then(function(res){
					return auth.$deleteUser();
				});
			}

			function changePasswordAuth(newPass) {
				return auth.$updatePassword(newPass);
			}

			function resetPasswordAuth(email) {
				return auth.$sendPasswordResetEmail(email);
			}

			function checkUserIsExisted(employeeId) {
				return firebaseDataRef.child('membership-employee/' + employeeId).once("value");
			}

			function createMemShipEmployee(employeeId, email) {
				var memShipRef = firebaseDataRef.child('membership-employee');
				memShipRef.child(employeeId).child('email').set(email);
			}

			function getUserInfo(uid){
				return firebaseDataRef.child('users/' + uid).once( "value" ).then(function(res){
					return res.val();
				}).catch(function (error) {
					var errorCode = error.code;
					var errorMessage = error.message;
					return errorMessage;
				});
			}

			function createFBUser(authId, profile, user) {
				var userRef = firebaseDataRef.child('users');
				user = {
					displayName: profile.lastname + ' ' + profile.firstname,
					firstName: profile.firstname,
					lastName: profile.lastname,
					address: '',
					city: '',
					state: 'TX',
					zipCode: '',
					email: user.email,
					primaryPhone: profile.phone,
					cellPhone: '',
					isReceiveEmail: false,
					interests: '',
					occupation: '',
					about: '',
					websiteUrl: '',
					// password: user.password,
					userRoles: ['-KTlcsVRwRIIftqNVoiY'],
					photoURL: '',
					isAuthorized: true,
					externalId: profile.employeeId,
					repCode: profile.repCode,
					isDeleted: false
				};

				userRef.child(authId).set(user);
			}
		}
})();

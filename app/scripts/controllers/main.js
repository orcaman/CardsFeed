'use strict';

angular.module('nowApp').config(function(facebookProvider){
	facebookProvider.setAppID('<your_app_id>');
})
.controller('MainCtrl', function ($scope, $timeout, $http, facebook) {
	$scope.cards = [];
	function resetNotConnected() {
		$scope.cards = [
		{ "connected" : false, "timeBased" : true, "timeTo" : "Not Connected", "toWhere" : 'Login with FB'}
		];	
	}

	function addEvent(from, text, latLng) {
		var e = {"event" : true, "connected" : true, "from" : from, "text" : text };
		if (latLng) {
			e.latLng = latLng;
			e.hasMap = true;
		}
		$scope.cards.push(e);
	}
	function addComment(from, text) {
		var e = {"comment" : true, "connected" : true, "from" : from, "text" : text };
		$scope.cards.push(e);
	}

	function onNotificationsGotten(response) {
		for (var i = 0; i < response.data.length; i++) {
			var r = response.data[i];
			console.log(r);
			(function(r) {
				switch(r.application.name) {
					case 'Events':
					var location = r.object.location; 
					if (location) {
						var apiKey = '<your_api_key>';
						var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + location 
						+ '&sensor=true&key=' + apiKey;
						$http.get(url).success(function(rslt) {
							if (rslt && rslt.results && rslt.results.length) {
								var latLng = {
									"latitude":rslt.results[0].geometry.location.lat,
									"longitude":rslt.results[0].geometry.location.lng
								};
								addEvent(r.from.name, r.title.replace(r.from.name, ''), latLng);
							}
						})
						.error(function(err) {
							console.log(err);
						});
					} else {
						addEvent(r.from.name, r.title.replace(r.from.name, ''));
					}
					break;
					case 'Links':
					addComment(r.from.name, r.title.replace(r.from.name, ''));
					break;
				}
			})(r);
		}
	}

	function statusChangeCallback(response) {
		$timeout(function() {
			$scope.cards = [];
			if (response.status != 'connected') {
				resetNotConnected();
				return;
			}
			facebook.graph('/me/notifications', onNotificationsGotten);
		}, 0);
	}


	$scope.connectToFB = function() {
		facebook.login(function(result) {
			console.log(result);
			if (result.expiresIn && result.expiresIn > 0) {
				statusChangeCallback({"status" : "connected"})
			}
		});
	}
	facebook.getLoginStatus(statusChangeCallback);
});
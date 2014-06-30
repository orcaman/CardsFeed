'use strict';

angular.module('nowApp').config(function(facebookProvider){
	facebookProvider.setAppID('');
})
.controller('MainCtrl', function ($scope, $timeout, $http, facebook) {
	$scope.cards = [];
	$scope.selected = undefined;
	_gaq.push(['_trackEvent', 'landing_page', 'view']);

	$scope.openLink = function(link) {
		_gaq.push(['_trackEvent', 'landing_page', 'link-click', $(this).text()]);
		window.open(link);
	}

	$scope.onSwipeLeft = function(idx) {
		_gaq.push(['_trackEvent', 'landing_page', 'swipe-left']);
		$scope.removeItem(idx, 1);
	}

	$scope.removeItem = function(idx) {
		$scope.cards.splice(idx, 1);
	}

	$scope.onSearchTermSelected = function ($item) {
		doSearch($item);
	};

	function doSearch(term) {
		_gaq.push(['_trackEvent', 'landing_page', 'search', term]);
		window.open('https://www.google.com/search?q=' + term);
	}

	$scope.getTerms = function(q) {
		return $http.jsonp("https://suggestqueries.google.com/complete/search?client=chrome&q="+q+"&callback=JSON_CALLBACK")
		.then(function(response){
			if (response && response.data && response.data.length > 1) {
				var rslt = response.data[1];
				for (var i in rslt) {
					if (rslt[i].indexOf('http://') === 0 || rslt[i].indexOf('https://') === 0) {
						var removed = rslt.splice(i, 1);
					}
				}
				rslt = rslt.slice(0, 4);
				if (document.getElementById('searchText').value) {
					rslt.unshift(document.getElementById('searchText').value);
				}
				return rslt;
			}
		});
	};

	function resetNotConnected() {
		$scope.cards = [
		{ "connected" : false, "timeBased" : true, "timeTo" : "Not Connected", "toWhere" : 'Login with FB'}
		];	
	}

	function addEvent(from, text, latLng, link) {
		var e = {"event" : true, "connected" : true, "from" : from, "text" : text, "link": link };
		if (latLng) {
			e.latLng = latLng;
			e.hasMap = true;
		}
		$timeout(function() {
			$scope.cards.push(e);
		}, 0);
	}


	function addNothing() {
		_gaq.push(['_trackEvent', 'fb_stats', 'no-notifications']);
		var e = {"comment" : true, "connected" : true, "from" : 'No new notifications!', "text" : '', "isLike" : false, "link": 'https://www.facebook.com/' };
		$timeout(function() {
			$scope.cards.push(e);
		}, 0);
	}

	function addComment(from, text, isLike, link) {
		var e = {"comment" : true, "connected" : true, "from" : from, "text" : text, "isLike" : isLike, "link": link };
		$timeout(function() {
			$scope.cards.push(e);
		}, 0);
	}

	function onNotificationsGotten(response) {
		if (response.data.length === 0) {
			addNothing();
		}
		_gaq.push(['_trackEvent', 'fb_stats', 'notifications', response.data.length]);
		for (var i = 0; i < response.data.length; i++) {
			var r = response.data[i];
			(function(r) {
				switch(r.application.name) {
					case 'Events':
					var location = r.object.location; 
					if (location) {
						var apiKey = 'AIzaSyAmZHunuYUijjLfgwAv6D_KnPL_PFg3sRY';
						var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + location 
						+ '&sensor=true&key=' + apiKey;
						$http.get(url).then(function(rslt) {
							if (rslt && rslt.results && rslt.results.length) {
								var latLng = {
									"latitude":rslt.results[0].geometry.location.lat,
									"longitude":rslt.results[0].geometry.location.lng
								};
								addEvent(r.from.name, r.title.replace(r.from.name, ''), latLng, r.link);
							} else {
								addEvent(r.from.name, r.title.replace(r.from.name, ''), null, r.link);			
							} 
						});
					} else { 
						addEvent(r.from.name, r.title.replace(r.from.name, ''), null, r.link);
					}
					break;
					default:
					addComment(r.from.name, r.title.replace(r.from.name, ''), r.application.name === 'Likes', r.link);
					break;
				}
			})(r);
		}
	}

	function statusChangeCallback(response) {
		$timeout(function() {
			$scope.cards = [];
			if (response.status != 'connected') {
				_gaq.push(['_trackEvent', 'fb_stats', 'not-connected']);
				resetNotConnected();
				return;
			}
			facebook.graph('/me/notifications', onNotificationsGotten);
		}, 0);
	}


	$scope.connectToFB = function() {
		facebook.login(function(result) {
			if (result.expiresIn && result.expiresIn > 0) {
				statusChangeCallback({"status" : "connected"})
			}
		});
	}
	facebook.getLoginStatus(statusChangeCallback);
});
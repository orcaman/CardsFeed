Let's make a fun Google Now style angular app that uses angular's provider pattern to perform facebook API operations (login, query the graph API).

Angular Facebook Provider

Facebook SDK is one (relatively rare?) example where I would fancy the provider pattern over the otherwise simpler factory or service patterns. This is because the provider pattern supports the initiation step, and this works nice as an option to setup your facebook app ID.
angular.module('nowApp').config(function(facebookProvider){
 facebookProvider.setAppID('<your_app_id>');
})
This simple provider does the following:
1. The "fbInit" function initiates the facebook SDK asynchronously.
2. The fbReady variable gets set to true once the FB.init function call is done (this is needed because we do not want to call any FB functions before the async script finishes loading)
3. The $get method exposes the useful facebook functions: graph (query the graph API), getLoginStatus (is the user authenticated and is the app authorized), login, logout and getAuth (stores the result of the login method for easy reference).

The Main Controller
The main controller initiates the facebookProvider using your appID and then builds the cards according to the connected users' latest notifications. After allowing the user to connect, we fetch the latest notifications using our facebookProvider's "graph" method - facebook.graph('/me/notifications', onNotificationsGotten). If the notification is an event, we grab the location string, and using Google's Geo Coding API, we geocode the address into a LatLng instance.

The LatLng instance is then passed to the card model, which is rendered on the view using the excellent google-map directive.

The Main View
Nothing special here. basically an input with the cool x-webkit-speech autocomplete attribute to make it Googlish and a repeater that distinguishes between card types (login card, event card, comment card). if the card instance has a map in it, the google-map directive is used.
 <div ng-if="card.hasMap">
     <google-map class="map"
     center="card.latLng"
     zoom="15"
     draggable="false"
     pan="true">
     <layer type="TrafficLayer" show="map.showTraffic"></layer>
     <marker coords="card.latLng"></marker>
    </google-map>
</div>

The CSS
The card css was forked from this codepen example, and was modified a bit (added media queries to support some phone types).


* Notes:
- If you are going to use the code (and by all means feel free to do so), please change the API keys/App ID to your own app
- The project uses yeoman, so make sure you have latest node.js, bower and grunt installed (some versions of bower do not work well with font-awesome, which is used here).



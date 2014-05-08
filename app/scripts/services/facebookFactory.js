var app = angular.module('nowApp');

app.provider('facebook', function() {
  var fbReady = false
  this.appID = 'Default';
  
  function fbInit(appID) {
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));  
    window.fbAsyncInit = function() {
     FB.init({
      appId      : appID,
      cookie     : true,  
      xfbml      : true,  
      version    : 'v2.0' 
    });
     fbReady = true;
   }   
 }

 this.setAppID = function(appID) {
  this.appID = appID;
};

this.$get = function() {
  var appID = this.appID;
  var self = this;
  fbInit(appID);

  return {
    graph : function(path, cb) {
      FB.api(path, function(response) {
        cb(response);
      });
    },
    getAuth: function() {
      return self.auth;
    },
    getLoginStatus: function(cb) {
      if (!fbReady) {
        setTimeout(function() { 
          self.$get()['getLoginStatus'](cb);
        } , 100);
        console.log('fb not ready');
        return;
      }
      FB.getLoginStatus(function(response) {
        cb(response);
      });
    },
    login: function(cb) {
      if (!fbReady) {
        self.$get()['login'](cb);
        console.log('fb not ready');
        return;
      }
      FB.login(function(response) {
        if (response.authResponse) {
          self.auth = response.authResponse;
          cb(self.auth);
        } else {
          console.log('Facebook login failed', response);
        }
      }, {"scope" : "manage_notifications"});

    },
    logout: function() {
      FB.logout(function(response) {
        if (response) {
          self.auth = null;
        } else {
          console.log('Facebook logout failed.', response);
        }

      });
    }
  }
}
});

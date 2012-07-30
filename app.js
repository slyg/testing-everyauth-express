var 
	express = require('express'),
	swig = require('swig'),
	everyauth = require('everyauth'),
	authconf = require('./authconf')
	app = express.createServer();
;

everyauth.twitter
        .consumerKey(authconf.twitter.consumerKey)
        .consumerSecret(authconf.twitter.consumerSecret)
        .findOrCreateUser(function(session, accessToken, accessTokenSecret, twitterUserData){
                return twitterUserData;
        })
	.redirectPath('/')
;

everyauth.google
	.myHostname('http://localhost:4000')
	.appId(authconf.google.clientId)
	.appSecret(authconf.google.clientSecret)
	.scope('https://www.googleapis.com/auth/userinfo.profile')
	.findOrCreateUser( function (session, accessToken, accessTokenExtra, googleUserMetadata) {
		//var promise = this.Promise();
		//promise.fulfill(googleUserMetadata);
		//return promise;
		return googleUserMetadata;
	})
	.redirectPath('/')
;

// give express some everyauth helpers
everyauth.helpExpress(app); 

// Configuration
app.configure(function(){
  
  // assign the swig engine to .html files
  app.register('html', swig);

  // set .html as the default extension 
  app.set('view engine', 'html');
  app.set('views', __dirname + '/views');
  swig.init({ root: __dirname + '/views', allowErrors: true });

  // Setting this to false allows to properly use {% extends %} and {% block %} tags
  app.set('view options', { layout: false });

  app.use(express.bodyParser());

  app.use(express.cookieParser()); // ADDED LINE (order matters)
  app.use(express.session({ 'secret' : 'test' })); // ADDED LINE
  app.use(everyauth.middleware()); // ADDED LINE

  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', checkAuth, function(req, res){
        res.render('home.html');
});

app.get('/auth/twitter/callback', function(req, res){
	res.redirect('/');
});

app.get('/auth/google/callback', function(req, res){
        res.redirect('/');
});

// helper

function checkAuth(req, res, next){
	console.log(req.session);
	console.log("has session : %s", req.loggedIn);
	next();
}

// start server

app.listen(4000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

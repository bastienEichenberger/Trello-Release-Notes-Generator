
/**
 * Module dependencies.
 */

var express = require('express');
var notes = require('./routes/notes');
var http = require('http');
var path = require('path');


/********************************************
 * APP CONFIGURATION
 ********************************************/

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


// routes
app.get('/', notes.home);
app.post('/lists', notes.chooselist);
app.post('/notes', notes.generate_report);


// start the server
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});



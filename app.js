
/**
 * Module dependencies.
 */

var express = require('express')
var notes = require('./routes/notes')
var http = require('http')
var path = require('path');

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

app.get('/', notes.home);
app.post('/lists', notes.chooselist);
app.post('/notes', notes.generatenotes);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


var board_id = '56bc7b21716890f4ba80dbc5';
var key = '1b41d2a31722f588818c709f2e3b0d19';
var token = '3da81fc42d94c5359d7160970dcdfff40f5476cc47bb8e20cc2daa4fc0c1a98d';
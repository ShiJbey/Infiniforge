var express = require( 'express' );
var THREE = require( 'three' );
var fs = require( 'fs' );
var blender = require( './lib/blenderConnect' );
var app = express();

// Static files
app.use( express.static('.') );

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.get( '/', function( req, res ) {
	res.sendFile( __dirname + '/views/index.html' );
} );

app.get( '/js/sword_scene.js', function( req, res ) {
	res.sendFile( __dirname + '/js/sword_scene.js' );
} );

app.post( '/', function( req, res ) {
	res.sendFile( __dirname + '/views/index.html' );
    // Start blender in the background
    blender.connect( req.body );
    console.log( req.body );
} );

app.listen( 8080 );
console.log( 'Server running on \'http://localhost:8080\'');
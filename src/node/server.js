var express = require( 'express' );
var app = express();
var fs = require( 'fs' );

var swordsJsonPath = '../json/swords.json';

var sword = {
	"name" : "Excalibur"
};


app.get( '/addSword', function( req, res ) {
	// reads existing users
	fs.readFile( swordsJsonPath, 'utf8', function( err, data ) {
		data = JSON.parse( data );
		data[ "sword3" ] = sword;
		console.log( data );
		var jsonRep = JSON.stringify( data );
		fs.writeFile( swordsJsonPath, jsonRep, function( err ) {
			if( err ){
				return console.log( err );
			}
		});
		res.end( jsonRep );
		
	});
});

app.get( '/deleteSword', function( req, res ) {
	fs.readFile( swordsJsonPath, 'utf8', function( err, data ) {
		data = JSON.parse( data );
		delete data[ "sword" + 2 ];
		console.log( data );
		res.end( JSON.stringify( data ) );
	});
});

app.get( '/listSwords', function( req, res ) {
	fs.readFile( swordsJsonPath , 'utf8', function( err, data ) {
		console.log( data );
		res.end( data );
	});
});

app.get( '/:id', function( req, res ) {
	fs.readFile( swordsJsonPath, 'utf8', function( err, data ) {
		swords = JSON.parse( data );
		var s1 = swords[ "sword" + req.params.id ];
		console.log( req.params.id );
		console.log( s1 );
		res.end( JSON.stringify( s1 ) );
	});
});

var server = app.listen( 8081, '127.0.0.1' , function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log( "Example app listening at http://%s:%s", host, port );
});

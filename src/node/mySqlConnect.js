var mysql = require( 'mysql' );

var connection = mysql.createConnection({
	host : 'localhost',
	user : 'crafting-user',
	password : '',
	database : 'GameItem'
});

connection.connect( function( err ) {
	if( err ) {
		console.log( 'Error connecting to Db' );
		return;
	}
	console.log( 'Connection established' );
});

connection.query( 'SELECT * FROM Ore', function( err, rows ) {
	if( err ) {
		throw err;
	}

	console.log( 'Data recieved from Db:\n' );
	console.log( rows );
})

connection.end( function( err ) {

});
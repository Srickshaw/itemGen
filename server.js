var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');

app.use(express.static('dist'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
})

app.get('/weapon', function(req, res) {
	fs.readFile(path.join(__dirname, 'weapon.json'), function(err, data) {
		if(err) {
			console.log(err);
		}
		res.send(JSON.parse(data));
	});
});

app.listen(3000, function() {
	console.log('Server listening on port 3000');
})

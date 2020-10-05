var express = require('express');
var app = express();

var path = '/client/UI-prototypes/'
var port = '56017';

app.use(express.static(__dirname + path));
app.listen(port);

console.log(path + ' now running on http://localhost:' + port );
console.log('Main UI: http://localhost:' + port + '/regex-ui.html')

// silly chrome wants SSL to do screensharing
var fs = require('fs'),
    express = require('express'),
    https = require('https'),
    http = require('http');
process.on('uncaughtException', function (err) {
    logger.error('uncaughtException', err, err.stack);
});

var privateKey = fs.readFileSync('fakekeys/localhost.key').toString(),
    certificate = fs.readFileSync('fakekeys/localhost.cert').toString();


var app = express();

app.use(express.static(__dirname + '/public'));

https.createServer({key: privateKey, cert: certificate}, app).listen(8000);
http.createServer(app).listen(8001);

console.log('running on https://localhost:8000 and http://localhost:8001');

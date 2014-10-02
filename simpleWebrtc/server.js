// silly chrome wants SSL to do screensharing
var fs = require('fs'),
    express = require('express'),
    https = require('https'),
    http = require('http'),
    path = require('path');

process.on('uncaughtException', function (err) {
    console.error('uncaughtException', err, err.stack);
});

var privateKey = fs.readFileSync('fakekeys/localhost.key').toString(),
    certificate = fs.readFileSync('fakekeys/localhost.cert').toString();


var app = express();

app.use(express.errorHandler({dumbExceptions: true, showStack: true}));
// We need to allow CORS but I'm hungry
// Also you need to hit https://localhost:8000 bubbe

app.use(express.static(__dirname + '/public'));
app.use(require('less-middleware')(path.join(__dirname, '/public')));

https.createServer({key: privateKey, cert: certificate}, app).listen(8000)
    .on('listening', function() {
        console.log('now listening');
    })
    .on('connection', function() {
        console.log('connection established');
    })
    .on('error', function() {
        console.log('error occured');
    });
// http.createServer(app).listen(8001);

console.log('running on https://localhost:8000 and http://localhost:8001');

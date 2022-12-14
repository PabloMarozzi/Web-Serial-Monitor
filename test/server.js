
import http from 'http';
import fs from 'fs';

const requestListener = function (req, res) {
    console.log(req.url);
    if(req.url === '/index.js') {
        fs.readFile('./index.js', function (err,data) {
            if (err) {
              res.writeHead(404);
              res.end(JSON.stringify(err));
              return;
            }
            res.setHeader('Content-Type', 'text/javascript');
            res.writeHead(200);
            res.end(data);
        });
    } else if(req.url === '/') {
        fs.readFile('./test/index.html', function (err,data) {
            if (err) {
              res.writeHead(404);
              res.end(JSON.stringify(err));
              return;
            }
            res.writeHead(200);
            res.end(data);
        });
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
}

const server = http.createServer(requestListener);
server.listen(8080);

console.log('Server listening in port 8080');
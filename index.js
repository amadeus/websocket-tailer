const http = require('http');
const {server: WebSocketServer} = require('websocket');
const {Tail} = require('tail');

const [,, FILE, PORT = 8080] = process.argv;

if (FILE == null) {
  throw new Error('An existing file must be specified');
}

// Create basic webserver
const server = http.createServer((_, res) => res.end());
server.listen(PORT, () => console.log(`Server is listening on ${PORT}`));

// Create WebSocketServer
const wsServer = new WebSocketServer({httpServer: server});
wsServer.on('request', (request) => {
  console.log(`New Connection on ${new Date()} from ${request.origin}`);
  const connection = request.accept(null, request.origin);
  connection.on('message', () => connection.send('This server does not accept data'));
});

// Tail file for changes and send to all existing connections
const tail = new Tail(FILE);
tail.on('line', data => {
  wsServer.connections.forEach(connection => {
    connection.send(data);
  });
});
tail.watch();

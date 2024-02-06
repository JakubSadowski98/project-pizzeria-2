// Jest to plik, który po uruchomieniu będzie tworzył serwer udostępniający wszystkie dane z pliku
// dist/db/app.json w formie endpointów (standardowe zachowanie JSON-servera), a także
// serwował aplikację zbudowaną w katalogu dist (nowa rola).
import path from 'path';
import jsonServer from 'json-server';

const server = jsonServer.create();
const router = jsonServer.router(path.join('dist', 'db', 'app.json'));
const middlewares = jsonServer.defaults({
  static: 'dist',
  noCors: true
});
const port = process.env.PORT || 3131;

server.use(middlewares);
server.use(router);

server.listen(port);

export default server;
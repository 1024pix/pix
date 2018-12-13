function _createSignedUpUser(server) {

  server.create('user', {
    email: 'pro@example.net',
  });
}

function _createSessions(server) {
  server.createList('session', 6);
}

export default function(server) {
  _createSignedUpUser(server);
  _createSessions(server);
}

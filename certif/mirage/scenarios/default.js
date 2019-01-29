function _createSignedUpUser(server) {
  let user;
  let userCertificationCenter;
  let userMembership;

  user = server.create('user', {
    email: 'pro@example.net',
  });

  userCertificationCenter = server.create('certificationCenter', {
    name: 'Centre de certification du Pix'
  });

  userMembership = server.create('certification-center-membership', {
    certificationCenterId: userCertificationCenter.id,
    userId: user.id
  });

  user.certificationCenterMemberships = [userMembership];
}

function _createSessions(server) {
  server.createList('session', 6);
}

export default function(server) {
  _createSignedUpUser(server);
  _createSessions(server);
}

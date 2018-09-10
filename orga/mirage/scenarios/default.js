function _createSignedUpUser(server) {
  let user;
  let userOrganization;
  let userOrganizationAccess;

  user = server.create('user', {
    email: 'pro@example.net',
  });

  userOrganization = server.create('organization', {
    name: 'BRO & MALA Corp & Associates'
  });

  userOrganizationAccess = server.create('organization-access', {
    organizationId: userOrganization.id,
    userId: user.id
  });

  user.organizationAccesses = [userOrganizationAccess];

  server.createList('target-profile', 4);
}

function _createCampaigns(server) {
  server.createList('campaign', 6);
}

export default function(server) {
  _createSignedUpUser(server);
  _createCampaigns(server);
}

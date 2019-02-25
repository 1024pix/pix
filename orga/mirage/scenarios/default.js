function _createSignedUpUser(server) {
  let user;
  let userOrganization;
  let userMembership;

  user = server.create('user', {
    email: 'pro@example.net',
  });

  userOrganization = server.create('organization', {
    name: 'BRO & MALA Corp & Associates'
  });

  userMembership = server.create('membership', {
    organizationId: userOrganization.id,
    userId: user.id
  });

  user.memberships = [userMembership];

  server.createList('target-profile', 4);
}

function _createCampaigns(server) {
  let campaigns = server.createList('campaign', 6);
  campaigns.map(campaign => {
    let users = server.createList('user', 100);
    users.map(user => {
      server.create('campaign-participation', { user, campaign });
    })
  })
}

export default function(server) {
  _createSignedUpUser(server);
  _createCampaigns(server);
}

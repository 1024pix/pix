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
  const participationsCount = 100;
  let campaignReports = server.createList('campaign-report', 6, { participationsCount });
  let campaigns = campaignReports.map(campaignReport => {
    return server.create('campaign', { campaignReport });
  });
  campaigns.map(campaign => {
    let users = server.createList('user', participationsCount);
    users.map(user => {
      server.create('campaign-participation', { user, campaign });
    })
  })
}

export default function(server) {
  _createSignedUpUser(server);
  _createCampaigns(server);
}

function _createSignedUpUser(server) {
  const user = server.create('user', {
    email: 'pro@example.net',
  });

  const userOrganization = server.create('organization', {
    name: 'BRO & MALA Corp & Associates'
  });

  const userMembership = server.create('membership', {
    organizationId: userOrganization.id,
    userId: user.id
  });

  user.memberships = [userMembership];

  server.createList('target-profile', 4);
}

function _createCampaigns(server) {
  const participationsCount = 100;
  const campaignReports = server.createList('campaign-report', 6, { participationsCount });
  const campaigns = campaignReports.map((campaignReport) => {
    return server.create('campaign', { campaignReport });
  });
  campaigns.map((campaign) => {
    const users = server.createList('user', participationsCount);
    users.forEach((user) => {
      const campaignParticipationResult = server.create('campaign-participation-result');

      server.create('campaign-participation', { user, campaign, campaignParticipationResult });
    });
  });
}

function _createStudents(server) {
  const organizations = server.schema.organizations.where({ name: 'BRO & MALA Corp & Associates' });
  server.createList('students', 6, { organization: organizations.models[0] });
}

export default function(server) {
  _createSignedUpUser(server);
  _createCampaigns(server);
  _createStudents(server);
}

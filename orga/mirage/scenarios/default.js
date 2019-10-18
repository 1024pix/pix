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
  const organization = server.create('organization', {
    name: 'College Victor Hugo',
    type: 'SCO',
    isManagingStudents: true
  });

  const user = server.create('user', {
    email: 'sco@example.net',
  });

  const userMembership = server.create('membership', {
    organizationId: organization.id,
    userId: user.id,
    organizationRole: 'OWNER'
  });

  user.memberships = [userMembership];

  server.createList('students', 6, { organizationId: organization.id });
}

function _createOrganizationInvitations(server) {
  const organization = server.create('organization', {
    name: 'College Paul Verlaine',
    type: 'SCO',
    isManagingStudents: true,
  });

  const user = server.create('user', {
    email: 'plane@example.net',
  });

  const userMembership = server.create('membership', {
    organizationId: organization.id,
    userId: user.id,
    organizationRole: 'OWNER'
  });

  user.memberships = [userMembership];

  server.create('organization-invitation', { email: 'car@example.net', organizationId: organization.id });
  server.create('organization-invitation', { email: 'train@example.net', organizationId: organization.id });
}

export default function(server) {
  _createSignedUpUser(server);
  _createCampaigns(server);
  _createStudents(server);
  _createOrganizationInvitations(server);
}

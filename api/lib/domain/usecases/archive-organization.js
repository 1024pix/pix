const bluebird = require('bluebird');

module.exports = async function archiveOrganization({ organizationId, organizationInvitationRepository }) {
  const pendingInvitations = await organizationInvitationRepository.findPendingByOrganizationId({ organizationId });

  await bluebird.mapSeries(pendingInvitations, async (invitation) => {
    await organizationInvitationRepository.markAsCancelled({ id: invitation.id });
    await organizationInvitationRepository.updateModificationDate(invitation.id);
  });
};

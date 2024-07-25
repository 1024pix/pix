import { AlreadyExistingInvitationError, CancelledInvitationError } from '../../../shared/domain/errors.js';

/**
 * @param {Object} params
 * @param {string} params.organizationInvitationId
 * @param {string} params.organizationInvitationCode
 * @param {OrganizationRepository} params.organizationRepository
 * @param {OrganizationInvitationRepository} params.organizationInvitationRepository
 * @returns {Promise<OrganizationInvitation>}
 */
const getOrganizationInvitation = async function ({
  organizationInvitationId,
  organizationInvitationCode,
  organizationRepository,
  organizationInvitationRepository,
}) {
  const foundOrganizationInvitation = await organizationInvitationRepository.getByIdAndCode({
    id: organizationInvitationId,
    code: organizationInvitationCode,
  });

  if (foundOrganizationInvitation.isCancelled) {
    throw new CancelledInvitationError(`Invitation was cancelled`);
  }

  if (foundOrganizationInvitation.isAccepted) {
    throw new AlreadyExistingInvitationError(`Invitation already accepted with the id ${organizationInvitationId}`);
  }

  const { name: organizationName } = await organizationRepository.get(foundOrganizationInvitation.organizationId);
  foundOrganizationInvitation.organizationName = organizationName;

  return foundOrganizationInvitation;
};

export { getOrganizationInvitation };

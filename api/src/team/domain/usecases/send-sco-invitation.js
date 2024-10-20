import _ from 'lodash';

import {
  ManyOrganizationsFoundError,
  OrganizationNotFoundError,
  OrganizationWithoutEmailError,
} from '../../../shared/domain/errors.js';

/**
 *
 * @param {Object} params
 * @param {string} params.uai
 * @param {string} params.firstName
 * @param {string} params.lastName
 * @param {string} params.locale
 * @param {OrganizationInvitationRepository} organizationInvitationRepository
 * @param {OrganizationInvitationService} organizationInvitationService
 * @param {OrganizationRepository} organizationRepository
 * @returns {Promise<OrganizationInvitation>}
 */

const sendScoInvitation = async function ({
  uai,
  firstName,
  lastName,
  locale,
  organizationInvitationRepository,
  organizationInvitationService,
  organizationRepository,
}) {
  const organizationWithGivenUAI = await _getOrganizationWithGivenUAI({ uai, organizationRepository });
  _ensureOrganizationHasAnEmail({ email: organizationWithGivenUAI.email, uai });

  return await organizationInvitationService.createScoOrganizationInvitation({
    organizationId: organizationWithGivenUAI.id,
    email: organizationWithGivenUAI.email,
    firstName,
    lastName,
    locale,
    organizationRepository,
    organizationInvitationRepository,
  });
};

export { sendScoInvitation };

async function _getOrganizationWithGivenUAI({ uai, organizationRepository }) {
  const organizationsFound = await organizationRepository.findActiveScoOrganizationsByExternalId(uai.trim());
  _ensureThereIsNoMoreThanOneOrganization({ organizationCount: organizationsFound.length, uai });
  _ensureThereIsAtLeastOneOrganization({ organizationCount: organizationsFound.length, uai });
  return organizationsFound[0];
}

function _ensureThereIsAtLeastOneOrganization({ organizationCount, uai }) {
  if (organizationCount === 0) {
    const errorMessage = `L'UAI/RNE ${uai} de l'établissement n’est pas reconnu.`;
    throw new OrganizationNotFoundError(errorMessage);
  }
}

function _ensureThereIsNoMoreThanOneOrganization({ organizationCount, uai }) {
  if (organizationCount > 1) {
    const errorMessage = `Plusieurs établissements de type SCO ont été retrouvés pour L'UAI/RNE ${uai}.`;
    throw new ManyOrganizationsFoundError(errorMessage);
  }
}

function _ensureOrganizationHasAnEmail({ email, uai }) {
  if (_.isEmpty(email)) {
    const errorMessage = `Nous n’avons pas d’adresse e-mail de contact associée à l'établissement concernant l'UAI/RNE ${uai}.`;
    throw new OrganizationWithoutEmailError(errorMessage);
  }
}

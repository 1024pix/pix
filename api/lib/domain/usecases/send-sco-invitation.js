import _ from 'lodash';

import {
  OrganizationNotFoundError,
  OrganizationWithoutEmailError,
  ManyOrganizationsFoundError,
  OrganizationArchivedError,
} from '../errors';

import organizationInvitationService from '../../domain/services/organization-invitation-service';

export default async function sendScoInvitation({
  uai,
  firstName,
  lastName,
  locale,
  organizationRepository,
  organizationInvitationRepository,
}) {
  const organizationWithGivenUAI = await _getOrganizationWithGivenUAI({ uai, organizationRepository });
  _ensureOrganizationHasAnEmail({ email: organizationWithGivenUAI.email, uai });
  _ensureOrganizationIsNotArchived(organizationWithGivenUAI);

  return await organizationInvitationService.createScoOrganizationInvitation({
    organizationId: organizationWithGivenUAI.id,
    email: organizationWithGivenUAI.email,
    firstName,
    lastName,
    locale,
    organizationRepository,
    organizationInvitationRepository,
  });
}

async function _getOrganizationWithGivenUAI({ uai, organizationRepository }) {
  const organizationsFound = await organizationRepository.findScoOrganizationsByUai({ uai: uai.trim() });
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

function _ensureOrganizationIsNotArchived(organization) {
  if (organization.isArchived) {
    throw new OrganizationArchivedError();
  }
}

const _ = require('lodash');
const {
  OrganizationNotFoundError,
  OrganizationWithoutEmailError,
  ManyOrganizationsFoundError,
  OrganizationArchivedError,
} = require('../errors');
const organizationInvitationService = require('../../domain/services/organization-invitation-service');

module.exports = async function sendScoInvitation({
  uai,
  firstName,
  lastName,
  locale,
  organizationRepository,
  organizationInvitationRepository,
}) {
  const organizationForUAI = await _getOrganizationForUAI(organizationRepository, uai);
  _ensureOrganizationHasAnEmail(organizationForUAI, uai);
  _ensureOrganizationIsNotArchived(organizationForUAI);

  return await organizationInvitationService.createScoOrganizationInvitation({
    organizationId: organizationForUAI.id,
    email: organizationForUAI.email,
    firstName,
    lastName,
    locale,
    organizationRepository,
    organizationInvitationRepository,
  });
};

async function _getOrganizationForUAI(organizationRepository, uai) {
  const organizationsFound = await organizationRepository.findScoOrganizationsByUai({ uai: uai.trim() });
  _ensureThereIsNoMoreThanOneOrganization(organizationsFound, uai);
  _ensureThereIsAtLeastOneOrganization(organizationsFound, uai);
  return organizationsFound[0];
}

function _ensureThereIsAtLeastOneOrganization(organizationsFound, uai) {
  if (organizationsFound.length === 0) {
    const errorMessage = `L'UAI/RNE ${uai} de l'établissement n’est pas reconnu.`;
    throw new OrganizationNotFoundError(errorMessage);
  }
}

function _ensureThereIsNoMoreThanOneOrganization(organizationsFound, uai) {
  if (organizationsFound.length > 1) {
    const errorMessage = `Plusieurs établissements de type SCO ont été retrouvés pour L'UAI/RNE ${uai}.`;
    throw new ManyOrganizationsFoundError(errorMessage);
  }
}

function _ensureOrganizationHasAnEmail(organization, uai) {
  if (_.isEmpty(organization.email)) {
    const errorMessage = `Nous n’avons pas d’adresse e-mail de contact associée à l'établissement concernant l'UAI/RNE ${uai}.`;
    throw new OrganizationWithoutEmailError(errorMessage);
  }
}

function _ensureOrganizationIsNotArchived(organization) {
  if (organization.archivedAt) {
    throw new OrganizationArchivedError();
  }
}

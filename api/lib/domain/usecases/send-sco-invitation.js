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
  const organizationsFound = await organizationRepository.findScoOrganizationsByUai({ uai: uai.trim() });

  _checkIfManyOrganizationsFound(organizationsFound, uai);

  _checkIfOrganizationNotFound(organizationsFound, uai);

  _checkIfOrganizationWithoutEmail(organizationsFound, uai);

  _checkIfOrganizationIsArchived(organizationsFound);

  const email = organizationsFound[0].email;
  const organizationId = organizationsFound[0].id;

  return await organizationInvitationService.createScoOrganizationInvitation({
    organizationId,
    firstName,
    lastName,
    email,
    locale,
    organizationRepository,
    organizationInvitationRepository,
  });
};

function _checkIfOrganizationNotFound(organizationsFound, uai) {
  if (organizationsFound.length === 0) {
    const errorMessage = `L'UAI/RNE ${uai} de l'établissement n’est pas reconnu.`;
    throw new OrganizationNotFoundError(errorMessage);
  }
}

function _checkIfManyOrganizationsFound(organizationsFound, uai) {
  if (organizationsFound.length > 1) {
    const errorMessage = `Plusieurs établissements de type SCO ont été retrouvés pour L'UAI/RNE ${uai}.`;
    throw new ManyOrganizationsFoundError(errorMessage);
  }
}

function _checkIfOrganizationWithoutEmail(organizationsFound, uai) {
  if (organizationsFound.length === 1 && _.isEmpty(organizationsFound[0].email)) {
    const errorMessage = `Nous n’avons pas d’adresse e-mail de contact associée à l'établissement concernant l'UAI/RNE ${uai}.`;
    throw new OrganizationWithoutEmailError(errorMessage);
  }
}

function _checkIfOrganizationIsArchived(organizationsFound) {
  if (organizationsFound.length === 1 && !!organizationsFound[0].archivedAt) {
    throw new OrganizationArchivedError();
  }
}

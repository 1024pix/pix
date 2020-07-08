const _ = require('lodash');
const { OrganizationNotFoundError, OrganizationWithoutEmailError, ManyOrganizationsFoundError } = require('../errors');
const organizationInvitationService = require('../../domain/services/organization-invitation-service');
let errorMessage = null;
let organizationsFound = null;

module.exports = async function sendScoInvitation({ uai, firstName, lastName, locale, organizationRepository, organizationInvitationRepository }) {

  organizationsFound = await organizationRepository.findScoOrganizationByUai(uai);

  const nbOrganizations = _.get(organizationsFound, 'length', 0);

  _checkIfManyOrganizationsFoundError(nbOrganizations, uai);

  _checkIfOrganizationNotFoundError(nbOrganizations, uai);

  _checkIfOrganizationWithoutEmailError(nbOrganizations, uai);

  const email = organizationsFound[0].email;
  const organizationId = organizationsFound[0].id;

  const scoOrganizationInvitation = await organizationInvitationService.createScoOrganizationInvitation({
    organizationRepository, organizationInvitationRepository, organizationId, firstName, lastName, email, locale
  });

  return scoOrganizationInvitation;
};

function _checkIfOrganizationNotFoundError(nbOrganizations, uai) {
  if (nbOrganizations == 0) {
    errorMessage = `L'UAI/RNE ${uai} de l'établissement n’est pas reconnu.`;
    throw new OrganizationNotFoundError(errorMessage);
  }
}

function _checkIfManyOrganizationsFoundError(nbOrganizations, uai) {
  if (nbOrganizations > 1) {
    errorMessage = `Plusieurs établissements de type SCO ont été retrouvés pour L'UAI/RNE ${uai}.`;
    throw new ManyOrganizationsFoundError(errorMessage);
  }
}

function _checkIfOrganizationWithoutEmailError(nbOrganizations, uai) {
  if (nbOrganizations == 1 && _.isEmpty(organizationsFound[0].email)) {
    errorMessage = `Nous n’avons pas d’adresse e-mail de contact associée à l'établissement concernant l'UAI/RNE ${uai}.`;
    throw new OrganizationWithoutEmailError(errorMessage);
  }
}

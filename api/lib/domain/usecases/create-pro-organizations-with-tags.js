const { isEmpty, map, uniqBy } = require('lodash');
const bluebird = require('bluebird');
const Organization = require('../models/Organization');
const OrganizationTag = require('../models/OrganizationTag');
const { ManyOrganizationsFoundError, OrganizationAlreadyExistError, OrganizationTagNotFound, ObjectValidationError } = require('../errors');
const ORGANIZATION_TAG_SEPARATOR = '_';
const organizationInvitationService = require('../../domain/services/organization-invitation-service');

module.exports = async function createProOrganizationsWithTags({
  organizations,
  domainTransaction,
  organizationRepository,
  tagRepository,
  organizationTagRepository,
  organizationInvitationRepository,
}) {

  _checkIfOrganizationsDataAreNotEmptyAndUnique(organizations);

  await _checkIfOrganizationsAlreadyExistInDatabase(organizations, organizationRepository);

  const organizationsData = _validateAndMapOrganizationsData(organizations);

  const allTags = await tagRepository.findAll();

  let createdOrganizations = null;

  await domainTransaction.execute(async (domainTransaction) => {

    const organizationsToCreate = Array.from(organizationsData.values()).map((data) => data.organization);

    createdOrganizations = await organizationRepository.batchCreateProOrganizations(organizationsToCreate, domainTransaction);
    const organizationsTags = createdOrganizations
      .flatMap(({ id, externalId }) => {
        return organizationsData.get(externalId).tags
          .map((tagName) => {
            const foundTag = allTags.find((tagInDB) => tagInDB.name === tagName.toUpperCase());
            if (foundTag) {
              return new OrganizationTag({ organizationId: id, tagId: foundTag.id });
            } else {
              throw new OrganizationTagNotFound();
            }
          });
      });
    await organizationTagRepository.batchCreate(organizationsTags, domainTransaction);
  });

  const createdOrganizationsWithEmail = createdOrganizations.filter((organization) => !!organization.email);

  await bluebird.mapSeries(createdOrganizationsWithEmail, (organization) => {
    const locale = organizationsData.get(organization.externalId).locale;
    return organizationInvitationService.createProOrganizationInvitation({
      organizationRepository,
      organizationInvitationRepository,
      organizationId: organization.id,
      name: organization.name,
      email: organization.email,
      locale,
    });
  });
  return createdOrganizations;
};

function _checkIfOrganizationsDataAreNotEmptyAndUnique(organizations) {

  if (!organizations) {
    throw new ObjectValidationError('Les organisations ne sont pas renseignées.');
  }
  const uniqOrganizations = uniqBy(organizations, 'externalId');

  if (uniqOrganizations.length !== organizations.length) {
    throw new ManyOrganizationsFoundError('Une organisation apparaît plusieurs fois.');
  }
}

async function _checkIfOrganizationsAlreadyExistInDatabase(organizations, organizationRepository) {

  const organizationIds = await organizationRepository.findByExternalIdsFetchingIdsOnly(map(organizations, 'externalId'));
  if (!isEmpty(organizationIds)) {
    throw new OrganizationAlreadyExistError();
  }
}

function _validateAndMapOrganizationsData(organizations) {
  const mapOrganizationByExternalId = new Map();

  for (const organization of organizations) {
    if (!organization.externalId) {
      throw new ObjectValidationError('L’externalId de l’organisation n’est pas présent.');
    }
    if (!organization.name) {
      throw new ObjectValidationError('Le nom de l’organisation n’est pas présent.');
    }

    mapOrganizationByExternalId.set(organization.externalId, {
      organization: new Organization({
        ...organization,
        type: Organization.types.PRO,
      }),
      tags: organization.tags.split(ORGANIZATION_TAG_SEPARATOR),
      locale: organization.locale,
    });
  }
  return mapOrganizationByExternalId;
}

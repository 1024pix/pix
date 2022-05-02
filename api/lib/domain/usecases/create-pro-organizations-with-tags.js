const { isEmpty, map, uniqBy } = require('lodash');
const bluebird = require('bluebird');
const Organization = require('../models/Organization');
const OrganizationTag = require('../models/OrganizationTag');
const organizationValidator = require('../validators/organization-with-tags-script');

const {
  ManyOrganizationsFoundError,
  OrganizationAlreadyExistError,
  OrganizationTagNotFound,
  ObjectValidationError,
} = require('../errors');

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
  _checkIfOrganizationsDataAreNotEmpty(organizations);
  _checkIfOrganizationsDataAreUnique(organizations);

  for (const organization of organizations) {
    organizationValidator.validate(organization);
  }

  await _checkIfOrganizationsAlreadyExistInDatabase(organizations, organizationRepository);

  const organizationsData = _mapOrganizationsData(organizations);

  const allTags = await tagRepository.findAll();

  let createdOrganizations = null;

  await domainTransaction.execute(async (domainTransaction) => {
    const organizationsToCreate = Array.from(organizationsData.values()).map((data) => data.organization);

    createdOrganizations = await organizationRepository.batchCreateProOrganizations(
      organizationsToCreate,
      domainTransaction
    );

    const organizationsTags = createdOrganizations.flatMap(({ id, externalId, name }) => {
      return organizationsData.get(externalId).tags.map((tagName) => {
        const foundTag = allTags.find((tagInDB) => tagInDB.name === tagName.toUpperCase());
        if (foundTag) {
          return new OrganizationTag({ organizationId: id, tagId: foundTag.id });
        } else {
          throw new OrganizationTagNotFound(`Le tag ${tagName} de l'organisation ${name} n'existe pas.`);
        }
      });
    });

    await organizationTagRepository.batchCreate(organizationsTags, domainTransaction);
  });

  const createdOrganizationsWithEmail = createdOrganizations.filter((organization) => !!organization.email);

  await bluebird.mapSeries(createdOrganizationsWithEmail, (organization) => {
    const { locale, organizationInvitationRole } = organizationsData.get(organization.externalId);
    return organizationInvitationService.createProOrganizationInvitation({
      organizationRepository,
      organizationInvitationRepository,
      organizationId: organization.id,
      name: organization.name,
      email: organization.email,
      role: organizationInvitationRole?.toUpperCase(),
      locale,
    });
  });

  return createdOrganizations;
};

function _checkIfOrganizationsDataAreUnique(organizations) {
  const uniqOrganizations = uniqBy(organizations, 'externalId');

  if (uniqOrganizations.length !== organizations.length) {
    throw new ManyOrganizationsFoundError('Une organisation apparaît plusieurs fois.');
  }
}

async function _checkIfOrganizationsAlreadyExistInDatabase(organizations, organizationRepository) {
  const foundOrganizations = await organizationRepository.findByExternalIdsFetchingIdsOnly(
    map(organizations, 'externalId')
  );

  if (!isEmpty(foundOrganizations)) {
    const foundOrganizationIds = foundOrganizations.map((foundOrganization) => foundOrganization.externalId);
    const message = `Les organisations avec les externalIds suivants : ${foundOrganizationIds.join(
      ', '
    )} existent déjà.`;
    throw new OrganizationAlreadyExistError(message);
  }
}

function _checkIfOrganizationsDataAreNotEmpty(organizations) {
  if (isEmpty(organizations)) {
    throw new ObjectValidationError('Les organisations ne sont pas renseignées.');
  }
}
function _mapOrganizationsData(organizations) {
  const mapOrganizationByExternalId = new Map();

  for (const organization of organizations) {
    mapOrganizationByExternalId.set(organization.externalId, {
      organization: new Organization({
        ...organization,
        type: Organization.types.PRO,
      }),
      tags: organization.tags.split(ORGANIZATION_TAG_SEPARATOR),
      organizationInvitationRole: organization.organizationInvitationRole,
      locale: organization.locale,
    });
  }

  return mapOrganizationByExternalId;
}

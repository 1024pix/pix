const { isEmpty, uniqBy } = require('lodash');
const bluebird = require('bluebird');
const Organization = require('../models/Organization.js');
const OrganizationTag = require('../models/OrganizationTag.js');
const organizationValidator = require('../validators/organization-with-tags-and-target-profiles-script.js');
const DomainTransaction = require('../../infrastructure/DomainTransaction.js');

const {
  ManyOrganizationsFoundError,
  OrganizationAlreadyExistError,
  OrganizationTagNotFound,
  ObjectValidationError,
  TargetProfileInvalidError,
} = require('../errors.js');

const SEPARATOR = '_';
const organizationInvitationService = require('../../domain/services/organization-invitation-service.js');

module.exports = async function createOrganizationsWithTagsAndTargetProfiles({
  organizations,
  domainTransaction = DomainTransaction,
  organizationRepository,
  tagRepository,
  targetProfileShareRepository,
  organizationTagRepository,
  organizationInvitationRepository,
  dataProtectionOfficerRepository,
}) {
  if (isEmpty(organizations)) {
    throw new ObjectValidationError('Les organisations ne sont pas renseignées.');
  }

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

    createdOrganizations = await organizationRepository.batchCreateOrganizations(
      organizationsToCreate,
      domainTransaction
    );

    const dataProtectionOfficers = createdOrganizations
      .map(({ id, externalId }) => {
        const { dataProtectionOfficer } = organizationsData.get(externalId);
        const hasDataProtectionOfficer =
          dataProtectionOfficer.firstName || dataProtectionOfficer.lastName || dataProtectionOfficer.email;
        return hasDataProtectionOfficer ? { organizationId: id, ...dataProtectionOfficer } : undefined;
      })
      .filter(Boolean);

    await dataProtectionOfficerRepository.batchAddDataProtectionOfficerToOrganization(
      dataProtectionOfficers,
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

    const organizationsTargetProfiles = createdOrganizations.flatMap(({ id, externalId }) => {
      return organizationsData
        .get(externalId)
        .targetProfiles.map((targetProfileId) => ({ organizationId: id, targetProfileId }));
    });

    try {
      await targetProfileShareRepository.batchAddTargetProfilesToOrganization(
        organizationsTargetProfiles,
        domainTransaction
      );
    } catch (error) {
      if (error.constraint === 'target_profile_shares_targetprofileid_foreign') {
        const targetProfileId = error.detail.match(/\d+/g);
        throw new TargetProfileInvalidError(`Le profil cible ${targetProfileId} n'existe pas.`);
      }
      throw error;
    }
  });

  const createdOrganizationsWithEmail = createdOrganizations
    .map(({ id, externalId, name }) => {
      const { emailInvitations, role, locale } = organizationsData.get(externalId);
      return {
        organizationId: id,
        name,
        email: emailInvitations,
        role,
        locale,
      };
    })
    .filter((organization) => !!organization.email);

  await bluebird.mapSeries(createdOrganizationsWithEmail, (organizationWithEmail) =>
    organizationInvitationService.createProOrganizationInvitation({
      organizationRepository,
      organizationInvitationRepository,
      ...organizationWithEmail,
    })
  );

  return createdOrganizations;
};

function _checkIfOrganizationsDataAreUnique(organizations) {
  const uniqOrganizations = uniqBy(organizations, 'externalId');

  if (uniqOrganizations.length !== organizations.length) {
    throw new ManyOrganizationsFoundError(
      `Plusieurs organisations (${uniqOrganizations.length}) ont le même externalId.`
    );
  }
}

async function _checkIfOrganizationsAlreadyExistInDatabase(organizations, organizationRepository) {
  const foundOrganizations = await organizationRepository.findByExternalIdsFetchingIdsOnly(
    organizations.map((organization) => organization.externalId)
  );

  if (!isEmpty(foundOrganizations)) {
    const foundOrganizationIds = foundOrganizations.map((foundOrganization) => foundOrganization.externalId);
    const message = `Les organisations avec les externalIds suivants : ${foundOrganizationIds.join(
      ', '
    )} existent déjà.`;
    throw new OrganizationAlreadyExistError(message);
  }
}

function _mapOrganizationsData(organizations) {
  const mapOrganizationByExternalId = new Map();

  for (const organization of organizations) {
    const email = organization.type === Organization.types.SCO ? organization.emailForSCOActivation : undefined;
    mapOrganizationByExternalId.set(organization.externalId, {
      organization: new Organization({
        ...organization,
        email,
      }),
      dataProtectionOfficer: {
        firstName: organization.DPOFirstName,
        lastName: organization.DPOLastName,
        email: organization.DPOEmail,
      },
      emailInvitations: organization.emailInvitations,
      tags: organization.tags.split(SEPARATOR),
      targetProfiles: organization.targetProfiles.split(SEPARATOR).filter((targetProfile) => !!targetProfile.trim()),
      role: organization.organizationInvitationRole,
      locale: organization.locale,
    });
  }

  return mapOrganizationByExternalId;
}

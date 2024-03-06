import bluebird from 'bluebird';
import lodash from 'lodash';

import * as codeGenerator from '../../../src/shared/domain/services/code-generator.js';
import { CONCURRENCY_HEAVY_OPERATIONS } from '../../infrastructure/constants.js';
import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';
import { ObjectValidationError, OrganizationTagNotFound, TargetProfileInvalidError } from '../errors.js';
import { OrganizationForAdmin } from '../models/index.js';
import { Organization } from '../models/Organization.js';
import { OrganizationTag } from '../models/OrganizationTag.js';

const SEPARATOR = '_';

const { isEmpty } = lodash;

const createOrganizationsWithTagsAndTargetProfiles = async function ({
  // parameters
  organizations,
  domainTransaction = DomainTransaction,

  // dependencies
  dataProtectionOfficerRepository,
  organizationInvitationRepository,
  organizationRepository,
  organizationTagRepository,
  schoolRepository,
  tagRepository,
  targetProfileShareRepository,
  organizationValidator,
  organizationInvitationService,
}) {
  if (isEmpty(organizations)) {
    throw new ObjectValidationError('Les organisations ne sont pas renseignées.');
  }

  for (const organization of organizations) {
    organizationValidator.validate(organization);
  }

  let createdOrganizations = [];
  const allTags = await tagRepository.findAll();

  await domainTransaction.execute(async (domainTransaction) => {
    const transformedOrganizationsData = _transformOrganizationsCsvData(organizations);

    createdOrganizations = await organizationRepository.batchCreateOrganizations(
      transformedOrganizationsData,
      domainTransaction,
    );

    await _addDataProtectionOfficers({
      createdOrganizations,
      domainTransaction,
      dataProtectionOfficerRepository,
    });

    await _addTags({
      allTags,
      createdOrganizations,
      domainTransaction,
      organizationTagRepository,
    });

    await _updateSchoolsWithCodes({ createdOrganizations, domainTransaction, schoolRepository });

    await _addTargetProfiles({
      createdOrganizations,
      domainTransaction,
      targetProfileShareRepository,
    });
  });

  await _sendInvitationEmails({
    createdOrganizations,
    organizationInvitationRepository,
    organizationRepository,
    organizationInvitationService,
  });

  return createdOrganizations.map(({ createdOrganization }) => createdOrganization);
};

export { createOrganizationsWithTagsAndTargetProfiles };

function _transformOrganizationsCsvData(organizationsCsvData) {
  const organizations = organizationsCsvData.map((organizationCsvData) => {
    const email =
      organizationCsvData.type === Organization.types.SCO ? organizationCsvData.emailForSCOActivation : undefined;
    return {
      organization: new OrganizationForAdmin({
        ...organizationCsvData,
        email,
      }),
      dataProtectionOfficer: {
        firstName: organizationCsvData.DPOFirstName,
        lastName: organizationCsvData.DPOLastName,
        email: organizationCsvData.DPOEmail,
      },
      emailInvitations: organizationCsvData.emailInvitations,
      tags: organizationCsvData.tags.split(SEPARATOR),
      targetProfiles: isEmpty(organizationCsvData.targetProfiles)
        ? []
        : organizationCsvData.targetProfiles.split(SEPARATOR).filter((targetProfile) => !!targetProfile.trim()),
      role: organizationCsvData.organizationInvitationRole,
      locale: organizationCsvData.locale,
    };
  });
  return organizations;
}

async function _updateSchoolsWithCodes({ createdOrganizations, domainTransaction, schoolRepository }) {
  const pendingCodes = [];
  const filteredOrganizations = createdOrganizations.filter(
    ({ createdOrganization }) => createdOrganization.type === 'SCO-1D',
  );

  await bluebird.map(
    filteredOrganizations,
    async ({ createdOrganization }) => {
      const code = await codeGenerator.generate(schoolRepository, pendingCodes);
      await schoolRepository.save({ organizationId: createdOrganization.id, code, domainTransaction });
      pendingCodes.push(code);
    },
    {
      concurrency: CONCURRENCY_HEAVY_OPERATIONS,
    },
  );
}

async function _addDataProtectionOfficers({
  createdOrganizations,
  domainTransaction,
  dataProtectionOfficerRepository,
}) {
  const dataProtectionOfficers = createdOrganizations
    .map(({ createdOrganization, organizationToCreate }) => {
      const { dataProtectionOfficer } = organizationToCreate;
      const hasDataProtectionOfficer = Boolean(
        dataProtectionOfficer?.firstName || dataProtectionOfficer?.lastName || dataProtectionOfficer?.email,
      );

      return hasDataProtectionOfficer
        ? { organizationId: createdOrganization.id, ...dataProtectionOfficer }
        : undefined;
    })
    .filter(Boolean);

  await dataProtectionOfficerRepository.batchAddDataProtectionOfficerToOrganization(
    dataProtectionOfficers,
    domainTransaction,
  );
}

async function _addTags({ allTags, createdOrganizations, domainTransaction, organizationTagRepository }) {
  const organizationsTags = createdOrganizations.flatMap(({ createdOrganization, organizationToCreate }) => {
    return organizationToCreate.tags.map((tagName) => {
      const foundTag = allTags.find((tagInDB) => tagInDB.name === tagName.toUpperCase());

      if (!foundTag) {
        throw new OrganizationTagNotFound(
          `Le tag ${tagName} de l'organisation ${createdOrganization.name} n'existe pas.`,
        );
      }

      return new OrganizationTag({ organizationId: createdOrganization.id, tagId: foundTag.id });
    });
  });

  await organizationTagRepository.batchCreate(organizationsTags, domainTransaction);
}

async function _addTargetProfiles({ createdOrganizations, domainTransaction, targetProfileShareRepository }) {
  const organizationsTargetProfiles = createdOrganizations.flatMap(({ createdOrganization, organizationToCreate }) => {
    return organizationToCreate.targetProfiles.map((targetProfileId) => ({
      organizationId: createdOrganization.id,
      targetProfileId,
    }));
  });

  try {
    await targetProfileShareRepository.batchAddTargetProfilesToOrganization(
      organizationsTargetProfiles,
      domainTransaction,
    );
  } catch (error) {
    if (error.constraint === 'target_profile_shares_targetprofileid_foreign') {
      const targetProfileId = error.detail.match(/\d+/g);
      throw new TargetProfileInvalidError(`Le profil cible ${targetProfileId} n'existe pas.`);
    }

    throw error;
  }
}

async function _sendInvitationEmails({
  createdOrganizations,
  organizationInvitationRepository,
  organizationRepository,
  organizationInvitationService,
}) {
  const createdOrganizationsWithEmail = createdOrganizations
    .map(({ createdOrganization, organizationToCreate }) => {
      const { emailInvitations, role, locale } = organizationToCreate;
      const { id, name } = createdOrganization;

      return {
        organizationId: id,
        name,
        email: emailInvitations,
        role,
        locale,
      };
    })
    .filter((organization) => Boolean(organization.email));

  await bluebird.mapSeries(createdOrganizationsWithEmail, (organizationWithEmail) =>
    organizationInvitationService.createProOrganizationInvitation({
      organizationRepository,
      organizationInvitationRepository,
      ...organizationWithEmail,
    }),
  );
}

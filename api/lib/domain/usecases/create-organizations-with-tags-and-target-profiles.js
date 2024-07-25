import bluebird from 'bluebird';
import lodash from 'lodash';

import { PGSQL_FOREIGN_KEY_VIOLATION_ERROR } from '../../../db/pgsql-errors.js';
import { InvalidInputDataError } from '../../../src/shared/domain/errors.js';
import {
  DomainError,
  ObjectValidationError,
  OrganizationTagNotFound,
  TargetProfileInvalidError,
} from '../../../src/shared/domain/errors.js';
import { Organization, OrganizationForAdmin, OrganizationTag } from '../../../src/shared/domain/models/index.js';
import * as codeGenerator from '../../../src/shared/domain/services/code-generator.js';
import { CONCURRENCY_HEAVY_OPERATIONS } from '../../infrastructure/constants.js';
import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';
import { monitoringTools } from '../../infrastructure/monitoring-tools.js';

const SEPARATOR = '_';

const { isEmpty } = lodash;

const createOrganizationsWithTagsAndTargetProfiles = async function ({
  // parameters
  organizations,

  // dependencies
  dataProtectionOfficerRepository,
  organizationInvitationRepository,
  organizationRepository,
  organizationForAdminRepository,
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

  await DomainTransaction.execute(async () => {
    const transformedOrganizationsData = _transformOrganizationsCsvData(organizations);

    createdOrganizations = await _createOrganizations({
      organizationForAdminRepository,
      transformedOrganizationsData,
    });

    await _addDataProtectionOfficers({
      createdOrganizations,
      dataProtectionOfficerRepository,
    });

    await _addTags({
      allTags,
      createdOrganizations,
      organizationTagRepository,
    });

    await _updateSchoolsWithCodes({ createdOrganizations, schoolRepository });

    await _addTargetProfiles({
      createdOrganizations,
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

async function _createOrganizations({ transformedOrganizationsData, organizationForAdminRepository }) {
  return bluebird.map(transformedOrganizationsData, async (organizationToCreate) => {
    try {
      const createdOrganization = await organizationForAdminRepository.save(organizationToCreate.organization);
      return {
        createdOrganization,
        organizationToCreate,
      };
    } catch (error) {
      _monitorError(error.message, { error, event: 'create-organizations' });

      if (error.code === PGSQL_FOREIGN_KEY_VIOLATION_ERROR) {
        const createdByUserId = error.detail.match(/\d+/g);
        throw new InvalidInputDataError({ message: `User with ID "${createdByUserId}" does not exist` });
      }

      if (error instanceof DomainError) {
        throw error;
      }

      throw new DomainError(error.message);
    }
  });
}

function _transformOrganizationsCsvData(organizationsCsvData) {
  const organizations = organizationsCsvData.map((organizationCsvData) => {
    const email =
      organizationCsvData.type === Organization.types.SCO || organizationCsvData.type === Organization.types.SCO1D
        ? organizationCsvData.emailForSCOActivation
        : undefined;
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
      tags: isEmpty(organizationCsvData.tags) ? [] : organizationCsvData.tags.split(SEPARATOR),
      targetProfiles: isEmpty(organizationCsvData.targetProfiles)
        ? []
        : organizationCsvData.targetProfiles.split(SEPARATOR).filter((targetProfile) => !!targetProfile.trim()),
      role: organizationCsvData.organizationInvitationRole,
      locale: organizationCsvData.locale,
    };
  });

  return organizations;
}

async function _updateSchoolsWithCodes({ createdOrganizations, schoolRepository }) {
  try {
    const pendingCodes = [];
    const filteredOrganizations = createdOrganizations.filter(
      ({ createdOrganization }) => createdOrganization.type === 'SCO-1D',
    );

    await bluebird.map(
      filteredOrganizations,
      async ({ createdOrganization }) => {
        const code = await codeGenerator.generate(schoolRepository, pendingCodes);
        await schoolRepository.save({ organizationId: createdOrganization.id, code });
        pendingCodes.push(code);
      },
      {
        concurrency: CONCURRENCY_HEAVY_OPERATIONS,
      },
    );
  } catch (error) {
    _monitorError(error.message, { error, event: 'add-school-organizations-codes' });

    if (error instanceof DomainError) {
      throw error;
    }

    throw new DomainError(error.message);
  }
}

async function _addDataProtectionOfficers({ createdOrganizations, dataProtectionOfficerRepository }) {
  try {
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

    await dataProtectionOfficerRepository.batchAddDataProtectionOfficerToOrganization(dataProtectionOfficers);
  } catch (error) {
    _monitorError(error.message, { error, event: 'add-organizations-data-protection-officers' });

    if (error instanceof DomainError) {
      throw error;
    }

    throw new DomainError(error.message);
  }
}

async function _addTags({ allTags, createdOrganizations, organizationTagRepository }) {
  try {
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

    await organizationTagRepository.batchCreate(organizationsTags);
  } catch (error) {
    _monitorError(error.message, { error, event: 'add-organizations-tags' });

    if (error instanceof DomainError) {
      throw error;
    }

    throw new DomainError(error.message);
  }
}

async function _addTargetProfiles({ createdOrganizations, targetProfileShareRepository }) {
  try {
    const organizationsTargetProfiles = createdOrganizations.flatMap(
      ({ createdOrganization, organizationToCreate }) => {
        return organizationToCreate.targetProfiles.map((targetProfileId) => ({
          organizationId: createdOrganization.id,
          targetProfileId,
        }));
      },
    );

    await targetProfileShareRepository.batchAddTargetProfilesToOrganization(organizationsTargetProfiles);
  } catch (error) {
    _monitorError(error.message, { error, event: 'add-organizations-target-profiles' });

    if (error.constraint === 'target_profile_shares_targetprofileid_foreign') {
      const targetProfileId = error.detail.match(/\d+/g);
      throw new TargetProfileInvalidError(`Le profil cible ${targetProfileId} n'existe pas.`);
    }

    if (error instanceof DomainError) {
      throw error;
    }

    throw new DomainError(error.message);
  }
}

async function _sendInvitationEmails({
  createdOrganizations,
  organizationInvitationRepository,
  organizationRepository,
  organizationInvitationService,
}) {
  try {
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
  } catch (error) {
    _monitorError(error.message, { error, event: 'send-organizations-invitation-emails' });

    if (error instanceof DomainError) {
      throw error;
    }

    throw new DomainError(error.message);
  }
}

function _monitorError(message, { data, error, event } = {}) {
  const monitoringData = {
    message,
    context: 'create-organizations-with-tags-and-target-profiles',
    event,
    team: 'acces',
  };

  if (data) {
    monitoringData.data = data;
  }

  if (error) {
    monitoringData.error = { name: error.constructor.name };
  }

  monitoringTools.logErrorWithCorrelationIds(monitoringData);
}

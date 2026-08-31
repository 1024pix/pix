import { logger } from '../../../shared/infrastructure/utils/logger.js';
import {
  AdministrationTeamNotFound,
  CountryNotFoundError,
  OrganizationLearnerTypeNotFound,
  StructureCategoryNotFound,
} from '../errors.js';

const checkCountryExists = async (countryCode, countryRepository) => {
  try {
    await countryRepository.getByCode(countryCode);
  } catch {
    logger.error({
      event: 'Not_found_country',
      message: `Le pays avec le code ${countryCode} n'a pas été trouvé.`,
    });
    throw new CountryNotFoundError({ message: `Country not found for code ${countryCode}`, meta: { countryCode } });
  }
};

const checkOrganizationLearnerTypeExists = async (organizationLearnerTypeId, organizationLearnerTypeRepository) => {
  if (organizationLearnerTypeId) {
    try {
      return await organizationLearnerTypeRepository.getById(organizationLearnerTypeId);
    } catch {
      throw new OrganizationLearnerTypeNotFound({
        message: `Organization learner type not found for id ${organizationLearnerTypeId}`,
        meta: { organizationLearnerTypeId },
      });
    }
  }
};

async function checkAdministrationTeamExists(administrationTeamId, administrationTeamRepository) {
  const existingAdministrationTeam = await administrationTeamRepository.getById(administrationTeamId);

  if (!existingAdministrationTeam) {
    throw new AdministrationTeamNotFound({
      meta: {
        administrationTeamId: administrationTeamId,
      },
    });
  }
}

async function checkStructureCategoryExists(structureCategoryId, structureCategoryRepository) {
  const existingStructureCategory = await structureCategoryRepository.findById(structureCategoryId);

  if (!existingStructureCategory) {
    throw new StructureCategoryNotFound({
      message: `Structure category not found for id ${structureCategoryId}`,
      meta: {
        structureCategoryId,
      },
    });
  }
}

export {
  checkAdministrationTeamExists,
  checkCountryExists,
  checkOrganizationLearnerTypeExists,
  checkStructureCategoryExists,
};

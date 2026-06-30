import { createReadStream } from 'node:fs';

import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { validateEmailSyntax } from '../../../shared/domain/services/email-validation-service.js';
import { CsvParser } from '../../../shared/infrastructure/serializers/csv/csv-parser.js';
import { getDataBuffer } from '../../../shared/infrastructure/utils/buffer.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';
import { ORGANIZATIONS_UPDATE_HEADER } from '../constants.js';
import { OrganizationBatchUpdateDTO } from '../dtos/OrganizationBatchUpdateDTO.js';
import {
  AdministrationTeamNotFound,
  CountryNotFoundError,
  DpoEmailInvalid,
  OrganizationBatchUpdateError,
  OrganizationLearnerTypeNotFound,
  OrganizationNotFound,
} from '../errors.js';

/**
 * @typedef {function} updateOrganizationsInBatch
 * @param {Object} params
 * @param {string} params.filePath
 * @param {OrganizationForAdminRepository} params.organizationForAdminRepository
 * @param {AdministrationTeamRepository} params.administrationTeamRepository
 * @param {CountryRepository} params.countryRepository
 * @return {Promise<void>}
 */
export const updateOrganizationsInBatch = withTransaction(
  async ({
    filePath,
    organizationForAdminRepository,
    administrationTeamRepository,
    countryRepository,
    organizationLearnerTypeRepository,
  }) => {
    const dtos = await _getCsvData(filePath);
    if (dtos.length === 0) return;

    const organizationIds = new Set();
    const administrationTeamIds = new Set();
    const countryCodes = new Set();
    const organizationLearnerTypeIds = new Set();

    for (const dto of dtos) {
      organizationIds.add(dto.id);
      if (dto.administrationTeamId) administrationTeamIds.add(dto.administrationTeamId);
      if (dto.countryCode) countryCodes.add(dto.countryCode);
      if (dto.organizationLearnerTypeId) organizationLearnerTypeIds.add(dto.organizationLearnerTypeId);
    }

    const existingOrganizationIds = await _toExistingSet(Array.from(new Set([...organizationIds])), (ids) =>
      organizationForAdminRepository.findExistingIds({ ids }),
    );

    const existingAdministrationTeamIds = await _toExistingSet(Array.from(administrationTeamIds), (ids) =>
      administrationTeamRepository.findExistingIds({ ids }),
    );

    const existingCountryCodes = await _toExistingSet(Array.from(countryCodes), (codes) =>
      countryRepository.findExistingCodes({ codes }),
    );

    const existingOrganizationLearnerTypeIds = await _toExistingSet(Array.from(organizationLearnerTypeIds), (ids) =>
      organizationLearnerTypeRepository.findExistingIds({ ids }),
    );

    _validateAllDtos(dtos, {
      existingOrganizationIds,
      existingAdministrationTeamIds,
      existingCountryCodes,
      existingOrganizationLearnerTypeIds,
    });

    for (const dto of dtos) {
      await _updateOrganization(dto, organizationForAdminRepository);
    }
  },
);

async function _toExistingSet(values, finder) {
  if (!values || values.length === 0) return new Set();
  const existing = await finder(values);
  return new Set(existing.map(String));
}

function _validateAllDtos(
  dtos,
  { existingOrganizationIds, existingAdministrationTeamIds, existingCountryCodes, existingOrganizationLearnerTypeIds },
) {
  for (const dto of dtos) {
    if (!existingOrganizationIds.has(String(dto.id))) {
      throw new OrganizationNotFound({
        meta: { organizationId: dto.id },
      });
    }

    if (dto.dataProtectionOfficerEmail && !validateEmailSyntax(dto.dataProtectionOfficerEmail)) {
      throw new DpoEmailInvalid({
        meta: {
          organizationId: dto.id,
          value: dto.dataProtectionOfficerEmail,
        },
      });
    }

    if (dto.administrationTeamId && !existingAdministrationTeamIds.has(String(dto.administrationTeamId))) {
      throw new AdministrationTeamNotFound({
        meta: { administrationTeamId: dto.administrationTeamId },
      });
    }

    if (dto.countryCode && !existingCountryCodes.has(String(dto.countryCode))) {
      logger.error({
        event: 'Not_found_country',
        message: `Le pays avec le code ${dto.countryCode} n'a pas été trouvé.`,
      });

      throw new CountryNotFoundError({
        message: `Country not found for code ${dto.countryCode}`,
        meta: { countryCode: dto.countryCode },
      });
    }

    if (
      dto.organizationLearnerTypeId &&
      !existingOrganizationLearnerTypeIds.has(String(dto.organizationLearnerTypeId))
    ) {
      throw new OrganizationLearnerTypeNotFound({
        message: `Organization learner type not found for id ${dto.organizationLearnerTypeId}`,
        meta: { organizationLearnerTypeId: dto.organizationLearnerTypeId },
      });
    }
  }
}

async function _updateOrganization(dto, repository) {
  try {
    const organization = await repository.get({
      organizationId: dto.id,
    });

    organization.updateFromOrganizationBatchUpdateDto(dto);

    await repository.update({ organization });
  } catch {
    throw new OrganizationBatchUpdateError({
      meta: { organizationId: dto.id },
    });
  }
}

async function _getCsvData(filePath) {
  const stream = createReadStream(filePath);
  const buffer = await getDataBuffer(stream);
  const csvParser = new CsvParser(buffer, ORGANIZATIONS_UPDATE_HEADER);
  const csvData = csvParser.parse('utf8');
  return csvData.map((row) => new OrganizationBatchUpdateDTO(row));
}

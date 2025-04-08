import { createReadStream } from 'node:fs';

import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import * as emailValidationService from '../../../shared/domain/services/email-validation-service.js';
import { CsvParser } from '../../../shared/infrastructure/serializers/csv/csv-parser.js';
import { getDataBuffer } from '../../../shared/infrastructure/utils/buffer.js';
import { ORGANIZATIONS_UPDATE_HEADER } from '../constants.js';
import { OrganizationBatchUpdateDTO } from '../dtos/OrganizationBatchUpdateDTO.js';
import {
  DpoEmailInvalid,
  OrganizationBatchUpdateError,
  OrganizationNotFound,
  UnableToAttachChildOrganizationToParentOrganizationError,
} from '../errors.js';

/**
 * @typedef {function} updateOrganizationsInBatch
 * @param {Object} params
 * @param {string} params.filePath
 * @param {OrganizationForAdminRepository} params.organizationForAdminRepository
 * @return {Promise<void>}
 */
export const updateOrganizationsInBatch = async function ({ filePath, organizationForAdminRepository }) {
  const organizationBatchUpdateDtos = await _getCsvData(filePath);

  if (organizationBatchUpdateDtos.length === 0) return;

  await DomainTransaction.execute(async () => {
    await Promise.all(
      organizationBatchUpdateDtos.map(async (organizationBatchUpdateDto) => {
        await checkOrganizationUpdate(organizationBatchUpdateDto, organizationForAdminRepository);

        try {
          const organization = await organizationForAdminRepository.get(organizationBatchUpdateDto.id);
          organization.updateFromOrganizationBatchUpdateDto(organizationBatchUpdateDto);

          await organizationForAdminRepository.update(organization);
        } catch {
          throw new OrganizationBatchUpdateError({
            meta: { organizationId: organizationBatchUpdateDto.id },
          });
        }
      }),
    );
  });
};

async function checkOrganizationUpdate(organizationBatchUpdateDto, organizationForAdminRepository) {
  const organization = await organizationForAdminRepository.exist(organizationBatchUpdateDto.id);
  if (!organization) {
    throw new OrganizationNotFound({
      meta: {
        organizationId: organizationBatchUpdateDto.id,
      },
    });
  }

  if (organizationBatchUpdateDto.parentOrganizationId) {
    const parentOrganization = await organizationForAdminRepository.exist(
      organizationBatchUpdateDto.parentOrganizationId,
    );
    if (!parentOrganization) {
      throw new UnableToAttachChildOrganizationToParentOrganizationError({
        meta: {
          organizationId: organizationBatchUpdateDto.id,
          value: organizationBatchUpdateDto.parentOrganizationId,
        },
      });
    }
  }

  if (
    organizationBatchUpdateDto.dataProtectionOfficerEmail &&
    !emailValidationService.validateEmailSyntax(organizationBatchUpdateDto.dataProtectionOfficerEmail)
  ) {
    throw new DpoEmailInvalid({
      meta: {
        organizationId: organizationBatchUpdateDto.id,
        value: organizationBatchUpdateDto.dataProtectionOfficerEmail,
      },
    });
  }

  return organization;
}

async function _getCsvData(filePath) {
  const stream = createReadStream(filePath);
  const buffer = await getDataBuffer(stream);
  const csvParser = new CsvParser(buffer, ORGANIZATIONS_UPDATE_HEADER);
  const csvData = csvParser.parse('utf8');
  return csvData.map((row) => new OrganizationBatchUpdateDTO(row));
}

import { createReadStream } from 'node:fs';

import { emailIsValid } from '../../../../lib/domain/services/email-validator.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { CsvColumn } from '../../../shared/infrastructure/serializers/csv/csv-column.js';
import { CsvParser } from '../../../shared/infrastructure/serializers/csv/csv-parser.js';
import { getDataBuffer } from '../../../shared/infrastructure/utils/buffer.js';
import { OrganizationBatchUpdateDTO } from '../dtos/OrganizationBatchUpdateDTO.js';
import {
  DpoEmailInvalid,
  OrganizationBatchUpdateError,
  OrganizationNotFound,
  UnableToAttachChildOrganizationToParentOrganizationError,
} from '../errors.js';

const CSV_HEADER = {
  columns: [
    new CsvColumn({
      isRequired: true,
      name: 'Organization ID',
      property: 'id',
    }),
    new CsvColumn({
      name: 'Organization Name',
      property: 'name',
    }),
    new CsvColumn({
      name: 'Organization External ID',
      property: 'externalId',
    }),
    new CsvColumn({
      name: 'Organization Parent ID',
      property: 'parentOrganizationId',
    }),
    new CsvColumn({
      name: 'Organization Identity Provider Code',
      property: 'identityProviderForCampaigns',
    }),
    new CsvColumn({
      name: 'Organization Documentation URL',
      property: 'documentationUrl',
    }),
    new CsvColumn({
      name: 'Organization Province Code',
      property: 'provinceCode',
    }),
    new CsvColumn({
      name: 'DPO Last Name',
      property: 'dataProtectionOfficerLastName',
    }),
    new CsvColumn({
      name: 'DPO First Name',
      property: 'dataProtectionOfficerFirstName',
    }),
    new CsvColumn({
      name: 'DPO E-mail',
      property: 'dataProtectionOfficerEmail',
    }),
  ],
};

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

  await DomainTransaction.execute(async (domainTransaction) => {
    await Promise.all(
      organizationBatchUpdateDtos.map(async (organizationBatchUpdateDto) => {
        await checkOrganizationUpdate(organizationBatchUpdateDto, organizationForAdminRepository);

        try {
          const organization = await organizationForAdminRepository.get(
            organizationBatchUpdateDto.id,
            domainTransaction,
          );
          organization.updateFromOrganizationBatchUpdateDto(organizationBatchUpdateDto);

          await organizationForAdminRepository.update(organization, domainTransaction);
        } catch (error) {
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
        value: organizationBatchUpdateDto.id,
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
    !emailIsValid(organizationBatchUpdateDto.dataProtectionOfficerEmail)
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
  const csvParser = new CsvParser(buffer, CSV_HEADER);
  const csvData = csvParser.parse();
  return csvData.map((row) => new OrganizationBatchUpdateDTO(row));
}

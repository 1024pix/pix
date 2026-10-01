import isEmpty from 'lodash/isEmpty.js';

import { checkCsvHeader, parseCsvWithHeader } from '../../../../shared/infrastructure/helpers/csv.js';

export const requiredFieldNamesForOrganizationsImport = [
  'type',
  'externalId',
  'name',
  'provinceCode',
  'credit',
  'emailInvitations',
  'emailForSCOActivation',
  'identityProviderForCampaigns',
  'organizationInvitationRole',
  'locale',
  'tags',
  'createdBy',
  'documentationUrl',
  'targetProfiles',
  'isManagingStudents',
  'DPOFirstName',
  'DPOLastName',
  'DPOEmail',
  'administrationTeamId',
  'parentOrganizationId',
  'countryCode',
  'organizationLearnerTypeId',
  'categoryId',
];

export async function deserializeForOrganizationsImport(file) {
  const batchOrganizationOptionsWithHeader = {
    skipEmptyLines: true,
    header: true,
    transformHeader: (header) => header?.trim(),
    transform: (value, columnName) => {
      const trimmedValue = typeof value === 'string' ? value.trim() : value;
      if (columnName === 'isManagingStudents') {
        return trimmedValue?.toLowerCase() === 'true';
      }
      if (!isEmpty(trimmedValue)) {
        if (
          columnName === 'type' ||
          columnName === 'organizationInvitationRole' ||
          columnName === 'identityProviderForCampaigns'
        ) {
          return trimmedValue.toUpperCase();
        }
        if (
          columnName === 'createdBy' ||
          columnName === 'parentOrganizationId' ||
          columnName === 'administrationTeamId' ||
          columnName === 'countryCode' ||
          columnName === 'organizationLearnerTypeId' ||
          columnName === 'categoryId' ||
          columnName === 'credit'
        ) {
          return parseInt(trimmedValue, 10);
        }
        if (columnName === 'emailInvitations' || columnName === 'emailForSCOActivation' || columnName === 'DPOEmail') {
          return trimmedValue.replaceAll(' ', '').toLowerCase();
        }
      } else {
        if (
          columnName === 'externalId' ||
          columnName === 'identityProviderForCampaigns' ||
          columnName === 'DPOFirstName' ||
          columnName === 'DPOLastName' ||
          columnName === 'DPOEmail' ||
          columnName === 'parentOrganizationId' ||
          columnName === 'provinceCode' ||
          columnName === 'emailForSCOActivation' ||
          columnName === 'administrationTeamId' ||
          columnName === 'countryCode' ||
          columnName === 'organizationLearnerTypeId' ||
          columnName === 'credit' ||
          columnName === 'categoryId'
        ) {
          return null;
        }
        if (columnName === 'locale') {
          return 'fr-fr';
        }
      }
      return trimmedValue;
    },
  };

  await checkCsvHeader({ filePath: file, requiredFieldNames: requiredFieldNamesForOrganizationsImport });

  return await parseCsvWithHeader(file, batchOrganizationOptionsWithHeader);
}

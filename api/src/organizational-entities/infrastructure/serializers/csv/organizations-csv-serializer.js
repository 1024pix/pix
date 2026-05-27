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
];

export async function deserializeForOrganizationsImport(file) {
  const batchOrganizationOptionsWithHeader = {
    skipEmptyLines: true,
    header: true,
    transformHeader: (header) => header?.trim(),
    transform: (value, columnName) => {
      if (typeof value === 'string') {
        value = value.trim();
      }
      if (columnName === 'isManagingStudents') {
        value = value?.toLowerCase() === 'true';
      }
      if (!isEmpty(value)) {
        if (
          columnName === 'type' ||
          columnName === 'organizationInvitationRole' ||
          columnName === 'identityProviderForCampaigns'
        ) {
          value = value.toUpperCase();
        }
        if (
          columnName === 'createdBy' ||
          columnName === 'parentOrganizationId' ||
          columnName === 'administrationTeamId' ||
          columnName === 'countryCode' ||
          columnName === 'organizationLearnerTypeId' ||
          columnName === 'credit'
        ) {
          value = parseInt(value, 10);
        }
        if (columnName === 'emailInvitations' || columnName === 'emailForSCOActivation' || columnName === 'DPOEmail') {
          value = value.replaceAll(' ', '').toLowerCase();
        }
      } else {
        if (
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
          columnName === 'credit'
        ) {
          value = null;
        }
        if (columnName === 'locale') {
          value = 'fr-fr';
        }
      }
      return value;
    },
  };

  await checkCsvHeader({ filePath: file, requiredFieldNames: requiredFieldNamesForOrganizationsImport });

  return await parseCsvWithHeader(file, batchOrganizationOptionsWithHeader);
}

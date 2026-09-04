import { CsvColumn } from '../../../src/shared/infrastructure/serializers/csv/csv-column.js';

export const ORGANIZATIONS_UPDATE_HEADER = {
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
    new CsvColumn({
      name: 'Administration Team ID',
      property: 'administrationTeamId',
    }),
    new CsvColumn({
      name: 'Country Code',
      property: 'countryCode',
    }),
    new CsvColumn({
      name: 'Organization Learner Type ID',
      property: 'organizationLearnerTypeId',
    }),
    new CsvColumn({
      name: 'Category ID',
      property: 'categoryId',
    }),
  ],
};

export const ORGANIZATION_FEATURES_HEADER = {
  columns: [
    new CsvColumn({
      property: 'featureName',
      name: 'Feature Name',
      isRequired: true,
    }),
    new CsvColumn({
      property: 'organizationId',
      name: 'Organization ID',
      isRequired: true,
    }),
    new CsvColumn({
      property: 'params',
      name: 'Params',
      isRequired: false,
    }),
    new CsvColumn({
      property: 'deleteLearner',
      name: 'Delete Learner',
      isRequired: false,
    }),
  ],
};

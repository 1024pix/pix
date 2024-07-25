import { IMPORT_KEY_FIELD } from '../../../../src/prescription/learner-management/domain/constants.js';
import { IMPORT_FORMAT_GENERIC_ID, IMPORT_FORMAT_ONDE_ID, REAL_PIX_SUPER_ADMIN_ID } from './constants.js';

export const organizationLearnerImportFormat = async function ({ databaseBuilder }) {
  await databaseBuilder.factory.buildOrganizationLearnerImportFormat({
    id: IMPORT_FORMAT_ONDE_ID,
    name: 'ONDE',
    fileType: 'csv',
    config: {
      acceptedEncoding: ['iso-8859-1', 'utf8'],
      unicityColumns: ['INE'],
      validationRules: {
        formats: [
          { name: 'Nom élève', type: 'string', required: true },
          { name: 'Prénom élève', type: 'string', required: true },
          { name: 'INE', type: 'string', required: true },
          { name: 'Niveau', type: 'string', expectedValues: ['CM1', 'CM2'], required: true },
          { name: 'Libellé classe', type: 'string', required: true },
          { name: 'Date naissance', type: 'date', format: 'YYYY-MM-DD', required: true },
          { name: 'Cycle', type: 'string', expectedValues: ['CYCLE III'], required: true },
        ],
      },
      headers: [
        { name: 'Nom élève', property: 'lastName', required: true },
        { name: 'Prénom élève', property: 'firstName', required: true },
        { name: 'INE', required: true },
        { name: 'Cycle', required: true },
        { name: 'Niveau', required: true },
        { name: 'Libellé classe', required: true },
        { name: 'Date naissance', required: true },
      ],
    },
    createdAt: new Date('2024-01-01'),
    createdBy: REAL_PIX_SUPER_ADMIN_ID,
    updatedAt: new Date('2021-02-01'),
  });

  await databaseBuilder.factory.buildOrganizationLearnerImportFormat({
    id: IMPORT_FORMAT_GENERIC_ID,
    name: 'GENERIC',
    fileType: 'csv',
    config: {
      acceptedEncoding: ['utf8'],
      unicityColumns: ['Nom apprenant', 'Prénom apprenant', 'Date de naissance'],
      reconciliationMappingColumns: [
        { key: 2, fieldId: 'reconcileField2', name: IMPORT_KEY_FIELD.COMMON_FIRSTNAME, position: 2 },
        { key: 4, fieldId: 'reconcileField3', name: IMPORT_KEY_FIELD.COMMON_BIRTHDATE, position: 3 },
        { key: 1, fieldId: 'reconcileField1', name: IMPORT_KEY_FIELD.COMMON_LASTNAME, position: 1 },
      ],
      displayableColumns: [
        {
          key: 4,
          position: 2,
          name: IMPORT_KEY_FIELD.COMMON_BIRTHDATE,
        },
        {
          key: 3,
          position: 1,
          name: IMPORT_KEY_FIELD.COMMON_DIVISION,
        },
      ],
      validationRules: {
        formats: [
          { key: 1, name: 'Nom apprenant', type: 'string', required: true },
          { key: 2, name: 'Prénom apprenant', type: 'string', required: true },
          { key: 3, name: 'Classe', type: 'string', required: true },
          { key: 4, name: 'Date de naissance', type: 'date', format: 'YYYY-MM-DD', required: true },
        ],
      },
      headers: [
        { key: 1, name: 'Nom apprenant', property: 'lastName', required: true },
        { key: 2, name: 'Prénom apprenant', property: 'firstName', required: true },
        { key: 3, name: 'Classe', required: true },
        { key: 4, name: 'Date de naissance', required: true },
      ],
    },
    createdAt: new Date('2024-01-01'),
    createdBy: REAL_PIX_SUPER_ADMIN_ID,
  });
};

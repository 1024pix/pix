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
      headers: [
        {
          name: 'Nom élève',
          required: true,
          config: {
            property: 'lastName',
            validate: { type: 'string', required: true },
          },
        },
        {
          name: 'Prénom élève',
          config: {
            property: 'firstName',
            validate: { type: 'string', required: true },
          },
          required: true,
        },
        {
          name: 'INE',
          required: true,
          config: {
            validate: { type: 'string', required: true },
          },
        },
        {
          name: 'Cycle',
          required: true,
          config: {
            validate: {
              type: 'string',
              expectedValues: ['CYCLE III'],
              required: true,
            },
          },
        },
        {
          name: 'Niveau',
          required: true,
          config: {
            validate: {
              type: 'string',
              expectedValues: ['CM1', 'CM2'],
              required: true,
            },
          },
        },
        {
          name: 'Libellé classe',
          required: true,
          config: {
            validate: { type: 'string', required: true },
          },
        },
        {
          name: 'Date naissance',
          required: true,
          config: { validate: { type: 'date', format: 'YYYY-MM-DD', required: true } },
        },
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
      headers: [
        {
          name: 'Nom apprenant',
          required: true,
          config: {
            property: 'lastName',
            validate: { type: 'string', required: true },
            reconcile: { fieldId: 'reconcileField1', name: IMPORT_KEY_FIELD.COMMON_LASTNAME, position: 1 },
          },
        },
        {
          name: 'Prénom apprenant',
          required: true,
          config: {
            property: 'firstName',
            validate: { type: 'string', required: true },
            reconcile: {
              fieldId: 'reconcileField2',
              name: IMPORT_KEY_FIELD.COMMON_FIRSTNAME,
              position: 2,
            },
          },
        },
        {
          name: 'Classe',
          required: true,
          config: {
            exportable: true,
            validate: { type: 'string', required: true },
            displayable: {
              position: 1,
              name: IMPORT_KEY_FIELD.COMMON_DIVISION,
              filterable: {
                type: 'string',
              },
            },
          },
        },
        {
          name: 'Date de naissance',
          required: true,
          config: {
            reconcile: {
              fieldId: 'reconcileField3',
              name: IMPORT_KEY_FIELD.COMMON_BIRTHDATE,
              position: 3,
            },
            validate: { type: 'date', format: 'YYYY-MM-DD', required: true },
            displayable: {
              position: 2,
              name: IMPORT_KEY_FIELD.COMMON_BIRTHDATE,
            },
          },
        },
      ],
    },
    createdAt: new Date('2024-01-01'),
    createdBy: REAL_PIX_SUPER_ADMIN_ID,
  });
};

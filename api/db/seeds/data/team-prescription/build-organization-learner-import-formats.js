import { REAL_PIX_SUPER_ADMIN_ID } from '../common/common-builder.js';
import { ONDE_IMPORT_FORMAT_ID } from '../common/constants.js';

export async function buildOrganizationLearnerImportFormat(databaseBuilder) {
  await databaseBuilder.factory.buildOrganizationLearnerImportFormat({
    id: ONDE_IMPORT_FORMAT_ID,
    name: 'ONDE',
    fileType: 'csv',
    config: {
      acceptedEncoding: [],
      unicityColumns: ['identifiant'],
      validationRules: {
        formats: [
          { name: 'nom', type: 'string' },
          { name: 'prénom', type: 'string' },
          { name: 'identifiant', type: 'string' },
          { name: 'classe', type: 'string' },
          { name: 'date de naissance', type: 'date', format: 'DD/MM/YYYY' },
        ],
      },
      headers: [
        { name: 'nom', property: 'lastName', required: true },
        { name: 'prénom', property: 'firstName', required: true },
        { name: 'identifiant', required: true },
        { name: 'classe', required: true },
        { name: 'date de naissance', required: true },
      ],
    },
    createdAt: new Date('2024-01-01'),
    createdBy: REAL_PIX_SUPER_ADMIN_ID,
    updatedAt: new Date('2021-02-01'),
  });
}

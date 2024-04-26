import { REAL_PIX_SUPER_ADMIN_ID } from '../common/common-builder.js';
import { ONDE_IMPORT_FORMAT_ID } from '../common/constants.js';

export async function buildOrganizationLearnerImportFormat(databaseBuilder) {
  await databaseBuilder.factory.buildOrganizationLearnerImportFormat({
    id: ONDE_IMPORT_FORMAT_ID,
    name: 'ONDE-seed',
    fileType: 'csv',
    config: {
      acceptedEncoding: ['utf8'],
      unicityColumns: ['INE'],
      validationRules: {
        formats: [
          { name: 'Nom élève', type: 'string', required: true },
          { name: 'Prénom élève', type: 'string', required: true },
          { name: 'INE', type: 'string', required: true },
          { name: 'Niveau', type: 'string', required: true },
          { name: 'Libellé classe', type: 'string', required: true },
          { name: 'Date de naissance', type: 'date', format: 'DD/MM/YYYY', required: true },
        ],
      },
      headers: [
        { name: 'Nom élève', property: 'lastName', required: true },
        { name: 'Prénom élève', property: 'firstName', required: true },
        { name: 'INE', required: true },
        { name: 'Niveau', required: true },
        { name: 'Libellé classe', required: true },
        { name: 'Date de naissance', required: true },
      ],
    },
    createdAt: new Date('2024-01-01'),
    createdBy: REAL_PIX_SUPER_ADMIN_ID,
    updatedAt: new Date('2021-02-01'),
  });
}

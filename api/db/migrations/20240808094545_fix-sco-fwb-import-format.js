import { IMPORT_KEY_FIELD } from '../../src/prescription/learner-management/domain/constants.js';

const importFormatName = 'SCO-FWB';

const up = async function (knex) {
  await knex('organization-learner-import-formats')
    .where({ name: importFormatName })
    .update({
      config: {
        acceptedEncoding: ['utf8'],
        unicityColumns: ['Nom', 'Prénom', 'Date de naissance (jj/mm/aaaa)'],
        reconciliationMappingColumns: [
          { key: 1, fieldId: 'reconcileField1', name: IMPORT_KEY_FIELD.COMMON_LASTNAME, position: 1 },
          { key: 2, fieldId: 'reconcileField2', name: IMPORT_KEY_FIELD.COMMON_FIRSTNAME, position: 2 },
          { key: 3, fieldId: 'reconcileField3', name: IMPORT_KEY_FIELD.COMMON_BIRTHDATE, position: 3 },
        ],
        displayableColumns: [
          {
            key: 3,
            position: 1,
            name: IMPORT_KEY_FIELD.COMMON_BIRTHDATE,
          },
          {
            key: 4,
            position: 2,
            name: IMPORT_KEY_FIELD.COMMON_DIVISION,
          },
        ],
        validationRules: {
          formats: [
            { key: 1, name: 'Nom', type: 'string', required: true },
            { key: 2, name: 'Prénom', type: 'string', required: true },
            { key: 3, name: 'Date de naissance (jj/mm/aaaa)', type: 'date', format: 'DD/MM/YYYY', required: true },
            { key: 4, name: 'Classe', type: 'string', required: true },
          ],
        },
        headers: [
          { key: 1, name: 'Nom', property: 'lastName', required: true },
          { key: 2, name: 'Prénom', property: 'firstName', required: true },
          { key: 3, name: 'Date de naissance (jj/mm/aaaa)', required: true },
          { key: 4, name: 'Classe', required: true },
        ],
      },
      updatedAt: new Date(),
    });
};

const down = async function (knex) {
  await knex('organization-learner-import-formats')
    .where({ name: importFormatName })
    .update({
      config: {
        acceptedEncoding: ['utf8'],
        unicityColumns: ['Nom', 'Prénom', 'Date de naissance (jj/mm/aaaa)'],
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
            { key: 1, name: 'Nom', type: 'string', required: true },
            { key: 2, name: 'Prénom', type: 'string', required: true },
            { key: 3, name: 'Date de naissance (jj/mm/aaaa)', type: 'date', format: 'DD/MM/YYYY', required: true },
            { key: 4, name: 'Classe', type: 'string', required: true },
          ],
        },
        headers: [
          { key: 1, name: 'Nom', property: 'lastName', required: true },
          { key: 2, name: 'Prénom', property: 'firstName', required: true },
          { key: 3, name: 'Date de naissance (jj/mm/aaaa)', required: true },
          { key: 4, name: 'Classe', required: true },
        ],
      },
      updatedAt: new Date(),
    });
};

export { down, up };

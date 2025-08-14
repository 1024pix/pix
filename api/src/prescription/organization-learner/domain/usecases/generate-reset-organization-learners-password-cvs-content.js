import * as injectedWriteCsvUtils from '../../../../shared/infrastructure/utils/csv/write-csv-utils.js';
const FILE_HEADERS = [
  {
    label: 'Classe',
    value: 'division',
  },
  {
    label: 'Nom',
    value: 'lastName',
  },
  {
    label: 'Prénom',
    value: 'firstName',
  },
  {
    label: 'Identifiant',
    value: 'username',
  },
  {
    label: 'Mot de passe',
    value: 'password',
  },
];

async function generateResetOrganizationLearnersPasswordCsvContent({
  organizationLearnersPasswordResets,
  writeCsvUtils = injectedWriteCsvUtils,
} = {}) {
  const generatedCsvContent = await writeCsvUtils.getCsvContent({
    data: organizationLearnersPasswordResets,
    fileHeaders: FILE_HEADERS,
  });

  return generatedCsvContent;
}

export { generateResetOrganizationLearnersPasswordCsvContent };

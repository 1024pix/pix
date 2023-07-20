const FILE_HEADERS = [
  {
    label: 'Identifiant',
    value: 'username',
  },
  {
    label: 'Mot de passe',
    value: 'password',
  },
  {
    label: 'Classe',
    value: 'division',
  },
];

async function generateResetOrganizationLearnersPasswordCsvContent({
  organizationLearnersGeneratedPassword,
  writeCsvUtils,
}) {
  const generatedCsvContent = await writeCsvUtils.getCsvContent({
    data: organizationLearnersGeneratedPassword,
    fileHeaders: FILE_HEADERS,
  });

  return generatedCsvContent;
}

export { generateResetOrganizationLearnersPasswordCsvContent };

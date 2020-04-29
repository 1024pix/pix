/* eslint-disable no-console */
// Usage: node add-target-profile-shares-to-organizations.js path/file.csv
// To use on file with columns |externalId, targetProfileId-targetProfileId-targetProfileId|

'use strict';
require('../loadEnv');
const targetProfileShareRepository = require('../lib/infrastructure/repositories/target-profile-share-repository');
const { findOrganizationsByExternalIds, organizeOrganizationsByExternalId } = require('./helpers/organizations-by-external-id-helper');
const { parseCsv } = require('./helpers/csvHelpers');

function checkData({ csvData }) {
  return csvData.map(([externalIdLowerCase, targetProfileList]) => {

    if (!externalIdLowerCase && !targetProfileList) {
      if (require.main === module) process.stdout.write('Found empty line in input file.');
      return null;
    }
    if (!externalIdLowerCase) {
      if (require.main === module) process.stdout.write(`A line is missing an externalId for target profile ${targetProfileList}`);
      return null;
    }
    if (!targetProfileList) {
      if (require.main === module) process.stdout.write(`A line is missing a targetProfileIdList for external id ${externalIdLowerCase}`);
      return null;
    }
    const externalId = externalIdLowerCase.toUpperCase();
    const targetProfileIdList = targetProfileList.split('-').filter((targetProfile) => !!targetProfile.trim());

    return { externalId, targetProfileIdList };
  }).filter((data) => !!data);
}

async function addTargetProfileSharesToOrganizations({ organizationsByExternalId, checkedData }) {
  for (let i = 0; i < checkedData.length; i++) {
    if (require.main === module) process.stdout.write(`\n${i + 1}/${checkedData.length} `);

    const { externalId, targetProfileIdList } = checkedData[i];
    const organization = organizationsByExternalId[externalId];

    if (organization && organization.id) {
      if (require.main === module) process.stdout.write(`Adding targetProfiles: ${targetProfileIdList} to organizationId: ${organization.id} `);
      await targetProfileShareRepository.addTargetProfilesToOrganization({
        organizationId: organization.id,
        targetProfileIdList
      });
      if (require.main === module) process.stdout.write('===> ✔');
    }
  }
}

async function main() {
  console.log('Starting script add-target-profile-shares-to-organizations');

  try {
    const filePath = process.argv[2];

    console.log('Reading and parsing csv data file... ');
    const csvData = parseCsv(filePath);
    console.log('ok');

    console.log('Checking data... ');
    const checkedData = checkData({ csvData });
    console.log('ok');

    console.log('Fetching existing organizations... ');
    const organizations = await findOrganizationsByExternalIds({ checkedData });

    const organizationsByExternalId = organizeOrganizationsByExternalId(organizations);
    console.log('ok');

    console.log('Adding target profiles shares to organizations…');
    await addTargetProfileSharesToOrganizations({ organizationsByExternalId, checkedData });
    console.log('\nDone.');

  } catch (error) {
    console.error(error);

    process.exit(1);
  }
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    }
  );
}

module.exports = {
  addTargetProfileSharesToOrganizations,
  checkData,
};

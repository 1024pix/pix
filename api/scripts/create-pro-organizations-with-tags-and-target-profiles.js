// Usage: node create-pro-organizations-with-tags-and-target-profiles.js path/file.csv
// To use on file with columns |externalId, name, provinceCode, credit, email, organizationInvitationRole, locale, tags, createdBy, targetProfiles|

'use strict';
require('dotenv').config();

const { checkCsvHeader, parseCsvWithHeader } = require('./helpers/csvHelpers');

const createProOrganizationsWithTagsAndTargetProfiles = require('../lib/domain/usecases/create-pro-organizations-with-tags-and-target-profiles');
const domainTransaction = require('../lib/infrastructure/DomainTransaction');
const organizationInvitationRepository = require('../lib/infrastructure/repositories/organization-invitation-repository');
const organizationRepository = require('../lib/infrastructure/repositories/organization-repository');
const organizationTagRepository = require('../lib/infrastructure/repositories/organization-tag-repository');
const tagRepository = require('../lib/infrastructure/repositories/tag-repository');
const targetProfileShareRepository = require('../lib/infrastructure/repositories/target-profile-share-repository');
const { disconnect } = require('../db/knex-database-connection');

const REQUIRED_FIELD_NAMES = [
  'externalId',
  'name',
  'provinceCode',
  'credit',
  'email',
  'organizationInvitationRole',
  'locale',
  'tags',
  'createdBy',
  'documentationUrl',
  'targetProfiles',
];

async function createOrganizationWithTagsAndTargetProfiles(filePath) {
  await checkCsvHeader({
    filePath,
    requiredFieldNames: REQUIRED_FIELD_NAMES,
  });

  console.log('Reading and parsing csv data file... ');

  const organizations = await parseCsvWithHeader(filePath);

  console.log('Creating PRO organizations with tags and target profiles..');
  const createdOrganizations = await createProOrganizationsWithTagsAndTargetProfiles({
    organizations,
    domainTransaction,
    organizationRepository,
    tagRepository,
    targetProfileShareRepository,
    organizationTagRepository,
    organizationInvitationRepository,
  });
  console.log('\nDone.');

  createdOrganizations.forEach((createdOrganization) => {
    console.log(`${createdOrganization.id},${createdOrganization.name}`);
  });

  return 'Organizations created with success !';
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  console.log('Starting creating PRO organizations with tags and target profiles.');
  const filePath = process.argv[2];
  await createOrganizationWithTagsAndTargetProfiles(filePath);
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

module.exports = {
  createOrganizationWithTagsAndTargetProfiles,
};

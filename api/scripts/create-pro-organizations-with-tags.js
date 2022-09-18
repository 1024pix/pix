// Usage: node create-pro-organizations-with-tags.js path/file.csv
// To use on file with columns |externalId, name, provinceCode, credit, email, organizationInvitationRole, locale, tags, createdBy|

'use strict';
require('dotenv').config();

const { checkCsvHeader, parseCsv, optionsWithHeader } = require('./helpers/csvHelpers');

const createProOrganizationsWithTags = require('../lib/domain/usecases/create-pro-organizations-with-tags');
const domainTransaction = require('../lib/infrastructure/DomainTransaction');
const organizationInvitationRepository = require('../lib/infrastructure/repositories/organization-invitation-repository');
const organizationRepository = require('../lib/infrastructure/repositories/organization-repository');
const organizationTagRepository = require('../lib/infrastructure/repositories/organization-tag-repository');
const tagRepository = require('../lib/infrastructure/repositories/tag-repository');
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
];

function cleanEmailPropertyFromOrganizations(organizationsToClean) {
  return organizationsToClean.map(({ email, ...organization }) => ({
    ...organization,
    email: email?.trim().replaceAll(' ', '').toLowerCase(),
  }));
}

async function createOrganizationWithTags(filePath) {
  await checkCsvHeader({
    filePath,
    requiredFieldNames: REQUIRED_FIELD_NAMES,
  });

  console.log('Reading and parsing csv data file... ');
  const options = { ...optionsWithHeader };

  const organizationsToClean = await parseCsv(filePath, options);
  const organizations = cleanEmailPropertyFromOrganizations(organizationsToClean);

  console.log('Creating PRO organizations...');
  const createdOrganizations = await createProOrganizationsWithTags({
    organizations,
    domainTransaction,
    organizationRepository,
    tagRepository,
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
  console.log('Starting creating PRO organizations.');
  const filePath = process.argv[2];
  await createOrganizationWithTags(filePath);
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
  createOrganizationWithTags,
};

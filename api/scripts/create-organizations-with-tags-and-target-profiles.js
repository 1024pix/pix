// Usage: node create-organizations-with-tags-and-target-profiles.js path/file.csv
// To use on file with columns |externalId, name, provinceCode, credit, email, organizationInvitationRole, locale, tags, createdBy, targetProfiles|

'use strict';
require('dotenv').config();

const { checkCsvHeader, parseCsvWithHeader } = require('./helpers/csvHelpers');

const temporaryStorage = require('../lib/infrastructure/temporary-storage');
const createOrganizationsWithTagsAndTargetProfiles = require('../lib/domain/usecases/create-organizations-with-tags-and-target-profiles');
const domainTransaction = require('../lib/infrastructure/DomainTransaction');
const organizationInvitationRepository = require('../lib/infrastructure/repositories/organization-invitation-repository');
const organizationRepository = require('../lib/infrastructure/repositories/organization-repository');
const organizationTagRepository = require('../lib/infrastructure/repositories/organization-tag-repository');
const tagRepository = require('../lib/infrastructure/repositories/tag-repository');
const targetProfileShareRepository = require('../lib/infrastructure/repositories/target-profile-share-repository');
const { disconnect } = require('../db/knex-database-connection');
const { isEmpty } = require('lodash');

const REQUIRED_FIELD_NAMES = [
  'type',
  'externalId',
  'name',
  'provinceCode',
  'credit',
  'emailInvitations',
  'emailForSCOActivation',
  'identityProviderForCampaigns',
  'organizationInvitationRole',
  'locale',
  'tags',
  'createdBy',
  'documentationUrl',
  'targetProfiles',
  'isManagingStudents',
];

const batchOrganizationOptionsWithHeader = {
  skipEmptyLines: true,
  header: true,
  transform: (value, columnName) => {
    if (typeof value === 'string') {
      value = value.trim();
    }
    if (columnName === 'isManagingStudents') {
      value = Boolean(value);
    }
    if (!isEmpty(value)) {
      if (
        columnName === 'type' ||
        columnName === 'organizationInvitationRole' ||
        columnName === 'identityProviderForCampaigns'
      ) {
        value = value.toUpperCase();
      }
      if (columnName === 'createdBy') {
        value = parseInt(value, 10);
      }
      if (columnName === 'emailInvitations' || columnName === 'emailForSCOActivation') {
        value = value.replaceAll(' ', '').toLowerCase();
      }
    } else {
      if (columnName === 'credit') {
        value = 0;
      }
      if (columnName === 'identityProviderForCampaigns') {
        value = null;
      }
      if (columnName === 'locale') {
        value = 'fr-fr';
      }
    }
    return value;
  },
};

async function createOrganizationWithTagsAndTargetProfiles(filePath) {
  await checkCsvHeader({
    filePath,
    requiredFieldNames: REQUIRED_FIELD_NAMES,
  });

  console.log('Reading and parsing csv data file... ');

  const organizations = await parseCsvWithHeader(filePath, batchOrganizationOptionsWithHeader);

  console.log('Creating PRO organizations with tags and target profiles..');
  const createdOrganizations = await createOrganizationsWithTagsAndTargetProfiles({
    organizations,
    domainTransaction,
    organizationRepository,
    tagRepository,
    targetProfileShareRepository,
    organizationTagRepository,
    organizationInvitationRepository,
  });
  console.log('Done.\n');

  createdOrganizations.forEach((createdOrganization) => {
    console.log(`${createdOrganization.id},${createdOrganization.name}`);
  });
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
      console.log('\nOrganizations created with success !');
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
      // l'import de OidcIdentityProviders dans les validateurs démarre le service redis
      // il faut donc stopper le process pour que celui ci s'arrête, il suffit d'avoir l'import du storage pour y avoir accès
      temporaryStorage.quit();
    }
  }
})();

module.exports = {
  createOrganizationWithTagsAndTargetProfiles,
  batchOrganizationOptionsWithHeader,
};

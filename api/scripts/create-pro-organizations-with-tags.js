// Usage: node create-pro-organizations-with-tags.js path/file.csv
// To use on file with columns |externalId, name, provinceCode, canCollectProfiles, credit, email, organizationInvitationRole, locale, tags, createdBy|

'use strict';
require('dotenv').config();

const { checkCsvHeader, parseCsvWithHeaderAndRequiredFields } = require('./helpers/csvHelpers');

const createProOrganizationsWithTags = require('../lib/domain/usecases/create-pro-organizations-with-tags');
const domainTransaction = require('../lib/infrastructure/DomainTransaction');
const organizationInvitationRepository = require('../lib/infrastructure/repositories/organization-invitation-repository');
const organizationRepository = require('../lib/infrastructure/repositories/organization-repository');
const organizationTagRepository = require('../lib/infrastructure/repositories/organization-tag-repository');
const tagRepository = require('../lib/infrastructure/repositories/tag-repository');

const REQUIRED_FIELD_NAMES = ['createdBy'];

async function main() {
  console.log('Starting creating PRO organizations.');

  try {
    const filePath = process.argv[2];

    console.log('Reading and checking csv header file... ');
    await checkCsvHeader({
      filePath,
      requiredFieldNames: REQUIRED_FIELD_NAMES,
    });

    console.log('Reading and parsing csv data file... ');
    const organizations = await parseCsvWithHeaderAndRequiredFields({
      filePath,
      requiredFieldNames: REQUIRED_FIELD_NAMES,
    });

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

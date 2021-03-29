/* eslint-disable no-console */
// Usage: node create-pro-organizations-with-tags.js path/file.csv
// To use on file with columns |externalId, name, provinceCode, canCollectProfiles, credit, email, locale, tags|

'use strict';
require('dotenv').config();

const { parseCsvWithHeader } = require('./helpers/csvHelpers');

const createProOrganizationsWithTags = require('../lib/domain/usecases/create-pro-organizations-with-tags');
const domainTransaction = require('../lib/infrastructure/DomainTransaction');
const organizationInvitationRepository = require('../lib/infrastructure/repositories/organization-invitation-repository');
const organizationRepository = require('../lib/infrastructure/repositories/organization-repository');
const organizationTagRepository = require('../lib/infrastructure/repositories/organization-tag-repository');
const tagRepository = require('../lib/infrastructure/repositories/tag-repository');

async function main() {
  console.log('Starting creating PRO organizations.');

  try {
    const filePath = process.argv[2];

    console.log('Reading and parsing csv data file... ');
    const organizations = await parseCsvWithHeader(filePath);

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
    },
  );
}

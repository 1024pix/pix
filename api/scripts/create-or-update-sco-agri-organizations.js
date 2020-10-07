/* eslint-disable no-console */
// Usage: BASE_URL=... PIXMASTER_EMAIL=... PIXMASTER_PASSWORD=... node create-or-update-sco-agri-organizations.js path/file.csv
// To use on file with columns |externalId, name, email|

'use strict';
require('dotenv').config();

const logoUrl = require('./logo/default-sco-agri-organization-logo-base64');
const { findOrganizationsByExternalIds, organizeOrganizationsByExternalId } = require('./helpers/organizations-by-external-id-helper');
const { parseCsv } = require('./helpers/csvHelpers');
const Organization = require('../lib/domain/models/Organization');
const Tag = require('../lib/domain/models/Tag');
const OrganizationTag = require('../lib/domain/models/OrganizationTag');
const organizationRepository = require('../lib/infrastructure/repositories/organization-repository');
const tagRepository = require('../lib/infrastructure/repositories/tag-repository');
const organizationTagRepository = require('../lib/infrastructure/repositories/organization-tag-repository');

const TAG_NAME = 'AGRI';

function checkData({ csvData }) {
  return csvData.map((data) => {
    const [externalIdLowerCase, name, email] = data;

    if (!externalIdLowerCase && !name) {
      if (require.main === module) process.stdout.write('Found empty line in input file.');
      return null;
    }
    if (!externalIdLowerCase) {
      if (require.main === module) process.stdout.write(`A line is missing an externalId for name ${name}`);
      return null;
    }
    if (!name) {
      if (require.main === module) process.stdout.write(`A line is missing a name for external id ${externalIdLowerCase}`);
      return null;
    }
    if (!email) {
      if (require.main === module) process.stdout.write(`A line is missing an e-mail for external id ${externalIdLowerCase}`);
      return null;
    }
    const externalId = externalIdLowerCase.toUpperCase();

    return { externalId, name: name.trim(), email: email.trim() };
  }).filter((data) => !!data);
}

async function createOrUpdateOrganizations({ organizationsByExternalId, checkedData }) {
  const createdOrUpdatedOrganizations = [];
  for (let i = 0; i < checkedData.length; i++) {
    if (require.main === module) process.stdout.write(`\n${i + 1}/${checkedData.length} `);

    const { externalId, name, email } = checkedData[i];
    let organization = organizationsByExternalId[externalId];

    if (organization) {
      organization.name = name;
      organization.email = email;
      organization.logoUrl = logoUrl;
      createdOrUpdatedOrganizations.push(await organizationRepository.update(organization));
    } else {
      organization = new Organization({
        name,
        externalId,
        email,
        provinceCode: externalId.substring(0, 3),
        type: 'SCO',
        isManagingStudents: true,
        logoUrl,
      });
      createdOrUpdatedOrganizations.push(await organizationRepository.create(organization));
    }
  }
  return createdOrUpdatedOrganizations;
}

async function addTag(organizations) {
  let tag = await tagRepository.findByName({ name: TAG_NAME });

  if (!tag) {
    tag = await tagRepository.create(new Tag({ name: TAG_NAME }));
  }

  for (let i = 0; i < organizations.length; i++) {
    const organizationId = organizations[i].id;
    const isExisting = await organizationTagRepository.isExistingByOrganizationIdAndTagId({ organizationId, tagId: tag.id });

    if (!isExisting) {
      await organizationTagRepository.create(new OrganizationTag({ organizationId, tagId: tag.id }));
    }
  }
}

async function main() {
  console.log('Starting creating or updating SCO AGRI organizations.');

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

    console.log('Creating or updating organizations...');
    const createOrUpdatedOrganizations = await createOrUpdateOrganizations({ organizationsByExternalId, checkedData });
    console.log('ok');

    console.log('Adding AGRI tag...');
    await addTag(createOrUpdatedOrganizations);
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
    },
  );
}

module.exports = {
  addTag,
  checkData,
  createOrUpdateOrganizations,
};

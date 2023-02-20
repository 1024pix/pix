// Usage: scalingo scalingo --region osc-secnum-fr1 -a pix-api-production run --file file.csv node scripts/create-or-update-sco-agri-organizations.js /tmp/uploads/file.csv
// To use on file with columns |externalId, name, email| (email is optional)

'use strict';
require('dotenv').config();

import logoUrl from './logo/default-sco-agri-organization-logo-base64';
import {
  findOrganizationsByExternalIds,
  organizeOrganizationsByExternalId,
} from './helpers/organizations-by-external-id-helper';
import { parseCsv } from './helpers/csvHelpers';
import Organization from '../lib/domain/models/Organization';
import Tag from '../lib/domain/models/Tag';
import OrganizationTag from '../lib/domain/models/OrganizationTag';
import organizationRepository from '../lib/infrastructure/repositories/organization-repository';
import tagRepository from '../lib/infrastructure/repositories/tag-repository';
import organizationTagRepository from '../lib/infrastructure/repositories/organization-tag-repository';
import { disconnect } from '../db/knex-database-connection';

const TAG_NAME = 'AGRICULTURE';

function checkData({ csvData }) {
  return csvData
    .map((data) => {
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
        if (require.main === module)
          process.stdout.write(`A line is missing a name for external id ${externalIdLowerCase}`);
        return null;
      }

      const checkedData = {
        externalId: externalIdLowerCase.toUpperCase(),
        name: name.trim(),
      };

      if (email) {
        checkedData.email = email.trim();
      }

      return checkedData;
    })
    .filter((data) => !!data);
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
      organization.isManagingStudents = true;
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
    const isExisting = await organizationTagRepository.isExistingByOrganizationIdAndTagId({
      organizationId,
      tagId: tag.id,
    });

    if (!isExisting) {
      await organizationTagRepository.create(new OrganizationTag({ organizationId, tagId: tag.id }));
    }
  }
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  console.log('Starting creating or updating SCO AGRICULTURE organizations.');

  const filePath = process.argv[2];

  console.log('Reading and parsing csv data file... ');
  const csvData = await parseCsv(filePath);
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

  console.log('Adding AGRICULTURE tag...');
  await addTag(createOrUpdatedOrganizations);
  console.log('\nDone.');
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

export default {
  addTag,
  checkData,
  createOrUpdateOrganizations,
};

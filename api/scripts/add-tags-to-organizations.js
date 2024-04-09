// Usage: node add-tags-to-organizations.js path/file.csv
// To use on file with columns |organizationId, tagName|

import 'dotenv/config';

import lodash from 'lodash';

import { OrganizationTag } from '../lib/domain/models/OrganizationTag.js';
import * as organizationTagRepository from '../lib/infrastructure/repositories/organization-tag-repository.js';
import * as tagRepository from '../lib/infrastructure/repositories/tag-repository.js';
import { parseCsv } from './helpers/csvHelpers.js';

const { uniq } = lodash;
import * as url from 'node:url';

import { disconnect } from '../db/knex-database-connection.js';

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

function checkData({ csvData }) {
  return csvData
    .map(([organizationId, tagName]) => {
      if (!organizationId && !tagName) {
        if (isLaunchedFromCommandLine) process.stdout.write('Found empty line in input file.');
        return null;
      }
      if (!organizationId) {
        if (isLaunchedFromCommandLine) process.stdout.write(`A line is missing an organizationId for tag ${tagName}`);
        return null;
      }
      if (!tagName) {
        if (isLaunchedFromCommandLine)
          process.stdout.write(`A line is missing a tag name for organization id ${organizationId}`);
        return null;
      }
      return { organizationId, tagName };
    })
    .filter((data) => !!data);
}

async function retrieveTagsByName({ checkedData }) {
  const uniqTagNames = uniq(checkedData.map((data) => data.tagName));

  const tagByNames = new Map();
  for (let i = 0; i < uniqTagNames.length; i++) {
    const name = uniqTagNames[i];
    const tag = await tagRepository.findByName({ name });

    if (tag === null) {
      throw new Error(`The tag with name ${name} does not exist.`);
    }
    tagByNames.set(name, tag);
  }
  return tagByNames;
}

async function addTagsToOrganizations({ tagsByName, checkedData, dependencies = { organizationTagRepository } }) {
  for (let i = 0; i < checkedData.length; i++) {
    if (isLaunchedFromCommandLine) process.stdout.write(`\n${i + 1}/${checkedData.length} `);

    const { organizationId, tagName } = checkedData[i];
    const tagId = tagsByName.get(tagName).id;

    const isExisting = await dependencies.organizationTagRepository.isExistingByOrganizationIdAndTagId({
      organizationId,
      tagId,
    });

    if (!isExisting) {
      if (isLaunchedFromCommandLine) process.stdout.write(`Adding tag: ${tagName} to organization: ${organizationId} `);

      const organizationTag = new OrganizationTag({ organizationId, tagId });
      await dependencies.organizationTagRepository.create(organizationTag);

      if (isLaunchedFromCommandLine) process.stdout.write('===> ✔');
    } else {
      if (isLaunchedFromCommandLine)
        process.stdout.write(`Tag: ${tagName} already exists for organization: ${organizationId} `);
    }
  }
}

async function main() {
  console.log('Starting script add-tags-to-organizations');

  const filePath = process.argv[2];

  console.log('Reading and parsing csv data file... ');
  const csvData = await parseCsv(filePath);
  console.log('ok');

  console.log('Checking data... ');
  const checkedData = checkData({ csvData });
  console.log('ok');

  console.log('Retrieving tags by name... ');
  const tagsByName = await retrieveTagsByName({ checkedData });
  console.log('ok');

  console.log('Adding tags to organizations…');
  await addTagsToOrganizations({ tagsByName, checkedData });
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

export { addTagsToOrganizations, checkData, retrieveTagsByName };

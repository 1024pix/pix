// Usage: node add-tags-to-organizations.js path/file.csv
// To use on file with columns |organizationId, tagName|

'use strict';
const dotenv = require('dotenv');
dotenv.config();
const organizationTagRepository = require('../lib/infrastructure/repositories/organization-tag-repository');
const tagRepository = require('../lib/infrastructure/repositories/tag-repository');
const OrganizationTag = require('../lib/domain/models/OrganizationTag');
const { parseCsv } = require('./helpers/csvHelpers');
const uniq = require('lodash/uniq');
const { disconnect } = require('../db/knex-database-connection');

function checkData({ csvData }) {
  return csvData
    .map(([organizationId, tagName]) => {
      if (!organizationId && !tagName) {
        if (require.main === module) process.stdout.write('Found empty line in input file.');
        return null;
      }
      if (!organizationId) {
        if (require.main === module) process.stdout.write(`A line is missing an organizationId for tag ${tagName}`);
        return null;
      }
      if (!tagName) {
        if (require.main === module)
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

async function addTagsToOrganizations({ tagsByName, checkedData }) {
  for (let i = 0; i < checkedData.length; i++) {
    if (require.main === module) process.stdout.write(`\n${i + 1}/${checkedData.length} `);

    const { organizationId, tagName } = checkedData[i];
    const tagId = tagsByName.get(tagName).id;

    const isExisting = await organizationTagRepository.isExistingByOrganizationIdAndTagId({ organizationId, tagId });

    if (!isExisting) {
      if (require.main === module) process.stdout.write(`Adding tag: ${tagName} to organization: ${organizationId} `);

      const organizationTag = new OrganizationTag({ organizationId, tagId });
      await organizationTagRepository.create(organizationTag);

      if (require.main === module) process.stdout.write('===> ✔');
    } else {
      if (require.main === module)
        process.stdout.write(`Tag: ${tagName} already exists for organization: ${organizationId} `);
    }
  }
}

const isLaunchedFromCommandLine = require.main === module;

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

module.exports = {
  addTagsToOrganizations,
  retrieveTagsByName,
  checkData,
};

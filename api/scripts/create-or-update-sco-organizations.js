// Usage: BASE_URL=... PIXMASTER_EMAIL=... PIXMASTER_PASSWORD=... node create-or-update-sco-organizations.js path/file.csv
// To use on file with columns |externalId, name|

'use strict';
const dotenv = require('dotenv');
dotenv.config();
const request = require('request-promise-native');

const logoUrl = require('./logo/default-sco-organization-logo-base64');
const {
  findOrganizationsByExternalIds,
  organizeOrganizationsByExternalId,
} = require('./helpers/organizations-by-external-id-helper');
const { parseCsv } = require('./helpers/csvHelpers');
const { disconnect } = require('../db/knex-database-connection');

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

function checkData({ csvData }) {
  return csvData
    .map((data) => {
      const [externalIdLowerCase, name] = data;

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
      const externalId = externalIdLowerCase.toUpperCase();

      return { externalId, name: name.trim() };
    })
    .filter((data) => !!data);
}

async function createOrUpdateOrganizations({ accessToken, organizationsByExternalId, checkedData }) {
  for (let i = 0; i < checkedData.length; i++) {
    if (require.main === module) process.stdout.write(`\n${i + 1}/${checkedData.length} `);

    const { externalId, name } = checkedData[i];
    const organization = organizationsByExternalId[externalId];

    if (organization && (name !== organization.name || !organization['logo-url'])) {
      await request(_buildPatchOrganizationRequestObject(accessToken, { id: organization.id, name, logoUrl }));
    } else if (!organization) {
      await request(
        _buildPostOrganizationRequestObject(accessToken, {
          name,
          externalId,
          provinceCode: externalId.substring(0, 3),
          type: 'SCO',
        })
      );
    }
  }
}

function _buildAccessTokenRequestObject() {
  return {
    method: 'POST',
    baseUrl,
    url: '/api/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    form: {
      grant_type: 'password',
      username: process.env.PIXMASTER_EMAIL,
      password: process.env.PIXMASTER_PASSWORD,
    },
    json: true,
  };
}

function _buildPatchOrganizationRequestObject(accessToken, organization) {
  return {
    method: 'PATCH',
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    baseUrl,
    url: `/api/organizations/${organization.id}`,
    json: true,
    body: {
      data: {
        type: 'organizations',
        id: organization.id,
        attributes: {
          name: organization.name,
          'logo-url': organization.logoUrl,
        },
      },
    },
  };
}

function _buildPostOrganizationRequestObject(accessToken, organization) {
  return {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    baseUrl,
    url: '/api/organizations',
    json: true,
    body: {
      data: {
        type: 'organizations',
        attributes: {
          name: organization.name,
          type: organization.type,
          'external-id': organization.externalId,
          'province-code': organization.provinceCode,
          'logo-url': logoUrl,
        },
      },
    },
  };
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  console.log('Starting creating or updating SCO organizations.');

  const filePath = process.argv[2];

  console.log('Reading and parsing csv data file... ');
  const csvData = await parseCsv(filePath);
  console.log('ok');

  console.log('Checking data... ');
  const checkedData = checkData({ csvData });
  console.log('ok');

  console.log('Requesting API access token... ');
  const { access_token: accessToken } = await request(_buildAccessTokenRequestObject());
  console.log('ok');

  console.log('Fetching existing organizations... ');
  const organizations = await findOrganizationsByExternalIds({ checkedData });

  const organizationsByExternalId = organizeOrganizationsByExternalId(organizations);
  console.log('ok');

  console.log('Creating or updating organizations...');
  await createOrUpdateOrganizations({ accessToken, organizationsByExternalId, checkedData });
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
  checkData,
  createOrUpdateOrganizations,
};

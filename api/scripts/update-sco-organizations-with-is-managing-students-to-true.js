// Usage: BASE_URL=... PIXMASTER_EMAIL=... PIXMASTER_PASSWORD=... node update-sco-organizations-with-is-managing-students-to-true.js path/file.csv
// To use on file with columns |externalId|

import dotenv from 'dotenv';

dotenv.config();
import { disconnect } from '../db/knex-database-connection.js';
import request from 'request-promise-native';
import {
  findOrganizationsByExternalIds,
  organizeOrganizationsByExternalId,
} from './helpers/organizations-by-external-id-helper.js';
import { parseCsv } from './helpers/csvHelpers.js';
import * as url from 'url';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

function checkData({ csvData }) {
  return csvData
    .map((data) => {
      const [externalIdLowerCase] = data;

      if (!externalIdLowerCase) {
        if (isLaunchedFromCommandLine) process.stdout.write('Found empty line in input file.');
        return null;
      }
      const externalId = externalIdLowerCase.toUpperCase();

      return { externalId };
    })
    .filter((data) => !!data);
}

async function updateOrganizations({ accessToken, organizationsByExternalId, checkedData }) {
  for (let i = 0; i < checkedData.length; i++) {
    if (isLaunchedFromCommandLine) process.stdout.write(`\n${i + 1}/${checkedData.length} `);

    const { externalId } = checkedData[i];
    const organization = organizationsByExternalId[externalId];

    if (organization) {
      await request(_buildPatchOrganizationRequestObject(accessToken, { id: organization.id }));
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
          'is-managing-students': true,
        },
      },
    },
  };
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main() {
  console.log('Starting setting is-managing-students to true.');

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

  console.log('Updating organizations...');
  await updateOrganizations({ accessToken, organizationsByExternalId, checkedData });
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

export { checkData, updateOrganizations };

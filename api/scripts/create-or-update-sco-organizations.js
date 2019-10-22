/* eslint-disable no-console */
// Usage: BASE_URL=... PIXMASTER_EMAIL=... PIXMASTER_PASSWORD=... node create-or-update-sco-organizations.js path/file.csv

'use strict';
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const papa = require('papaparse');
const request = require('request-promise-native');

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

function assertFileValidity(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found ${filePath}`);
  }

  const fileExtension = path.extname(filePath);

  if (fileExtension !== '.csv') {
    throw new Error(`File extension not supported ${fileExtension}`);
  }
}

function organizeOrganizationsByExternalId(data) {
  const organizationsByExternalId = {};

  data.forEach((organization) => {
    if (organization.attributes['external-id']) {
      organizationsByExternalId[organization.attributes['external-id']] = { id: organization.id, ...organization.attributes };
    }
  });

  return organizationsByExternalId;
}

async function createOrUpdateOrganizations(accessToken, organizationsByExternalId, data, logOutput = false) {
  for (let i = 0; i < data.length; i++) {
    if (logOutput) {
      process.stdout.write(`${i + 1}/${data.length}`);
    }

    const [externalId, name] = data[i];

    if (!(externalId && name)) return;

    const existingOrganization = organizationsByExternalId[externalId];



    if (existingOrganization && name !== existingOrganization.name) {
      await request(_buildPatchOrganizationRequestObject(accessToken, { id: existingOrganization.id, name }));
    }
    else if (!existingOrganization) {
      await request(_buildPostOrganizationRequestObject(accessToken, {
        name,
        externalId,
        provinceCode: externalId.substring(0, 3),
        type: 'SCO',
        isManagingStudents: false,
      }));
    }

    if (logOutput) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
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

function _buildGetOrganizationsRequestObject(accessToken) {
  return {
    method: 'GET',
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    baseUrl,
    url: '/api/organizations?pageSize=999999999',
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
          'is-managing-students': organization.isManagingStudents,
        },
      },
    },
  };
}

async function main() {
  console.log('Starting creating or updating SCO organizations.');

  try {
    const filePath = process.argv[2];

    process.stdout.write('Testing file validity... ');
    assertFileValidity(filePath);
    console.log('ok');

    process.stdout.write('Reading and parsing data... ');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const { data } = papa.parse(rawData);
    console.log('ok');

    process.stdout.write('Requesting API access token... ');
    const response1 = await request(_buildAccessTokenRequestObject());
    const accessToken = response1.access_token;
    console.log('ok');

    process.stdout.write('Fetching existing organizations... ');
    const response2 = await request(_buildGetOrganizationsRequestObject(accessToken));
    const organizationsByExternalId = organizeOrganizationsByExternalId(response2.data);
    console.log('ok');

    console.log('Creating or updating organizations...');
    await createOrUpdateOrganizations(accessToken, organizationsByExternalId, data, true);
    console.log('\nDone.');

  } catch (error) {
    console.log();
    console.error(error);

    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  assertFileValidity,
  organizeOrganizationsByExternalId,
  createOrUpdateOrganizations,
};

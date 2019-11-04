/* eslint-disable no-console */
// Usage: BASE_URL=... PIXMASTER_EMAIL=... PIXMASTER_PASSWORD=... node update-sco-organizations-with-is-managing-students-to-true.js path/file.csv

'use strict';
require('dotenv').config();
const request = require('request-promise-native');

const { parseCsv } = require('./helpers/csvHelpers');

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

function organizeOrganizationsByExternalId(data) {
  const organizationsByExternalId = {};

  data.forEach((organization) => {
    if (organization.attributes['external-id']) {
      organization.attributes['external-id'] = organization.attributes['external-id'].toUpperCase();
      organizationsByExternalId[organization.attributes['external-id']] = { id: organization.id, ...organization.attributes };
    }
  });

  return organizationsByExternalId;
}

async function updateOrganizations({ accessToken, organizationsByExternalId, csvData }) {
  for (let i = 0; i < csvData.length; i++) {
    const [externalIdLowerCase] = csvData[i];

    if (!externalIdLowerCase) {
      return console.log('Found empty line in input file.');
    }

    if (require.main === module) {
      console.log(`${i + 1}/${csvData.length}`);
    }

    const externalId = externalIdLowerCase.toUpperCase();
    const existingOrganization = organizationsByExternalId[externalId];

    if (existingOrganization) {
      await request(_buildPatchOrganizationRequestObject(accessToken, { id: existingOrganization.id }));
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
          'is-managing-students': true,
        },
      },
    },
  };
}

async function main() {
  console.log('Starting creating or updating SCO organizations.');

  try {
    const filePath = process.argv[2];

    console.log('Reading and parsing csv data file... ');
    const csvData = parseCsv(filePath);
    console.log('ok');

    console.log('Requesting API access token... ');
    const { access_token: accessToken } = await request(_buildAccessTokenRequestObject());
    console.log('ok');

    console.log('Fetching existing organizations... ');
    const { data: organizations } = await request(_buildGetOrganizationsRequestObject(accessToken));
    const organizationsByExternalId = organizeOrganizationsByExternalId(organizations);
    console.log('ok');

    console.log('Updating organizations...');
    await updateOrganizations({ accessToken, organizationsByExternalId, csvData });
    console.log('\nDone.');

  } catch (error) {
    console.error(error);

    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  organizeOrganizationsByExternalId,
  updateOrganizations,
};

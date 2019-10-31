/* eslint-disable no-console */
// Usage: BASE_URL=... PIXMASTER_EMAIL=... PIXMASTER_PASSWORD=... node create-or-update-sco-organizations.js path/file.csv

'use strict';
require('dotenv').config();
const request = require('request-promise-native');

const logoUrl = require('./default-sco-organization-logo-base64');
const { checkCsvExtensionFile, parseCsv } = require('./helpers/csvHelpers');

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

async function createOrUpdateOrganizations({ accessToken, organizationsByExternalId, csvData }) {
  for (let i = 0; i < csvData.length; i++) {
    const [externalIdLowerCase, name] = csvData[i];

    if (!(externalIdLowerCase && name)) {
      return console.log('Found empty line in input file.');
    }
    if (!externalIdLowerCase) {
      return console.log('A line is missing an externalId.', name);
    }
    if (!name) {
      return console.log('A line is missing a name', externalIdLowerCase);
    }

    if (require.main === module) {
      console.log(`${i + 1}/${csvData.length}`);
    }

    const externalId = externalIdLowerCase.toUpperCase();
    const existingOrganization = organizationsByExternalId[externalId];

    if (existingOrganization && (name !== existingOrganization.name || !existingOrganization['logo-url'])) {
      await request(_buildPatchOrganizationRequestObject(accessToken, { id: existingOrganization.id, name, logoUrl }));
    }
    else if (!existingOrganization) {
      await request(_buildPostOrganizationRequestObject(accessToken, {
        name,
        externalId,
        provinceCode: externalId.substring(0, 3),
        type: 'SCO',
      }));
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

async function main() {
  console.log('Starting creating or updating SCO organizations.');

  try {
    const filePath = process.argv[2];

    console.log('Check csv extension file... ');
    checkCsvExtensionFile(filePath);
    console.log('ok');

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

    console.log('Creating or updating organizations...');
    await createOrUpdateOrganizations({ accessToken, organizationsByExternalId, csvData });
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
  createOrUpdateOrganizations,
};

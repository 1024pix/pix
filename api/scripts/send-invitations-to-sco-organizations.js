/* eslint-disable no-console */
// Usage: BASE_URL=... PIXMASTER_EMAIL=... PIXMASTER_PASSWORD=... node send-invitations-to-organizations.js path/file.csv
// TODO: edit tests to accept pixmaster as pre in some routes

'use strict';
require('dotenv').config();
const request = require('request-promise-native');

const { assertFileValidity, parseCsv } = require('../scripts/helpers/csvHelpers');

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

function organizeOrganizationsByExternalId(data) {
  const organizationsByExternalId = {};

  data.forEach((organization) => {
    if (organization.attributes['external-id']) {
      organizationsByExternalId[organization.attributes['external-id']] = { id: organization.id, ...organization.attributes };
    }
  });

  return organizationsByExternalId;
}

async function updateOrganizationsAndSendInvitations({ data, organizationsByExternalId, accessToken, logOutput = false }) {
  for (let i = 0; i < data.length; i++) {
    if (logOutput) console.log(i + 1);
    const [externalId,, email] = data[i];
    const organization = organizationsByExternalId[externalId];
    await Promise.all([
      request(_buildPatchOrganizationRequestObject(accessToken, organization)),
      request(_buildPostOrganizationInvitationRequestObject(accessToken, organization, email)),
    ]);
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
    url: '/api/organizations',
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
          isManagingStudents: true,
        },
      },
    },
  };
}

function _buildPostOrganizationInvitationRequestObject(accessToken, organization, email) {
  return {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    baseUrl,
    url: `/api/organizations/${organization.id}/invitations`,
    json: true,
    body: {
      data: {
        type: 'organization-invitations',
        attributes: {
          email,
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
    const data = parseCsv(filePath);
    console.log('ok');

    process.stdout.write('Requesting API access token... ');
    const response1 = await request(_buildAccessTokenRequestObject());
    const accessToken = response1.access_token;
    console.log('ok');

    process.stdout.write('Getting organizations list... ');
    const response2 = await request(_buildGetOrganizationsRequestObject(accessToken));
    const organizationsByExternalId = organizeOrganizationsByExternalId(response2.data);
    console.log('ok');

    process.stdout.write('Checking if organizations from file are in database...');
    data.forEach(([externalId, name]) => {
      if (!organizationsByExternalId[externalId]) {
        throw new Error(`Organization ${name} - ${externalId} is not in database. Aborting. No email was sent.`);
      }
    });
    console.log('ok');

    console.log('Updating organizations and creating invitations...');
    await updateOrganizationsAndSendInvitations({ data, organizationsByExternalId, accessToken });
    console.log('Done.');

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
  organizeOrganizationsByExternalId,
  updateOrganizationsAndSendInvitations
};

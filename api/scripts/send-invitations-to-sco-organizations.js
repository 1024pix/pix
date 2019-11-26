/* eslint-disable no-console */
// Usage: BASE_URL=... PIXMASTER_EMAIL=... PIXMASTER_PASSWORD=... node send-invitations-to-organizations.js path/file.csv
// To use on file with columns |externalId, email|

'use strict';
require('dotenv').config();
const request = require('request-promise-native');

const { findOrganizationsByExternalIds, organizeOrganizationsByExternalId } = require('./helpers/organizations-by-external-id-helper');
const { parseCsv } = require('../scripts/helpers/csvHelpers');

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

function checkData({ csvData }) {
  return csvData.map((data) => {
    const [externalIdLowerCase, email] = data;

    if (!externalIdLowerCase && !email) {
      if (require.main === module) process.stdout.write('Found empty line in input file.');
      return null;
    }
    if (!externalIdLowerCase) {
      if (require.main === module) process.stdout.write(`A line is missing an externalId for email ${email}`);
      return null;
    }
    if (!email) {
      if (require.main === module) process.stdout.write(`A line is missing a email for external id ${externalIdLowerCase}`);
      return null;
    }
    const externalId = externalIdLowerCase.toUpperCase();

    return { externalId, email: email.trim() };
  }).filter((data) => !!data);
}

async function sendInvitations({ accessToken, organizationsByExternalId, checkedData }) {
  for (let i = 0; i < checkedData.length; i++) {
    if (require.main === module) process.stdout.write(`\n${i + 1}/${checkedData.length} `);

    const { externalId, email } = checkedData[i];
    const organization = organizationsByExternalId[externalId];

    if (organization && organization.id && email) {
      await request(_buildPostOrganizationInvitationRequestObject(accessToken, organization, email));
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
  console.log('Starting to send invitations');

  try {
    const filePath = process.argv[2];

    console.log('Reading and parsing data... ');
    const csvData = parseCsv(filePath);
    console.log('ok');

    console.log('Checking data... ');
    const checkedData = checkData({ csvData });
    console.log('ok');

    console.log('Requesting API access token... ');
    const { access_token: accessToken } = await request(_buildAccessTokenRequestObject());
    console.log('ok');

    console.log('Getting organizations list... ');
    const organizations = await findOrganizationsByExternalIds({ checkedData });
    const organizationsByExternalId = organizeOrganizationsByExternalId(organizations);
    console.log('ok');

    console.log('Sending invitations...');
    await sendInvitations({ accessToken, organizationsByExternalId, checkedData });
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
    }
  );
}

module.exports = {
  checkData,
  sendInvitations,
};

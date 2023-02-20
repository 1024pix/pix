'use strict';
require('dotenv').config();
import path from 'path';
import fs from 'fs';
import { promises } from 'fs';

const { access: access } = promises;

import request from 'request-promise-native';
import papa from 'papaparse';
import { disconnect } from '../db/knex-database-connection';

const CSV_HEADERS = {
  ID: 'Orga_ID',
  EXTERNAL_ID: 'Code établissement (code UAI)',
};

async function assertFileValidity(filePath) {
  try {
    await access(filePath, fs.constants.F_OK);
  } catch (err) {
    const errorMessage = `File not found ${filePath}`;
    throw new Error(errorMessage);
  }
  const fileExtension = path.extname(filePath);
  if (fileExtension !== '.csv') {
    const errorMessage = `File extension not supported ${fileExtension}`;
    throw new Error(errorMessage);
  }
  return true;
}

function convertCSVDataIntoOrganizations(csvParsingResult) {
  const dataRows = csvParsingResult.data;
  return dataRows.reduce((organizations, dataRow) => {
    const externalId = dataRow[CSV_HEADERS.EXTERNAL_ID].toUpperCase();
    const organization = {
      id: parseInt(dataRow[CSV_HEADERS.ID]),
      externalId,
      provinceCode: externalId.substring(0, 3),
    };
    organizations.push(organization);
    return organizations;
  }, []);
}

function _buildRequestObject(accessToken, organization) {
  return {
    method: 'PATCH',
    headers: { authorization: `Bearer ${accessToken}` },
    baseUrl: process.env.BASE_URL,
    url: `/api/organizations/${organization.id}`,
    json: true,
    body: {
      data: {
        type: 'organizations',
        id: organization.id,
        attributes: {
          'external-id': organization.externalId,
          'province-code': organization.provinceCode,
        },
      },
    },
  };
}

function _buildTokenRequestObject() {
  return {
    method: 'POST',
    baseUrl: process.env.BASE_URL,
    url: '/api/token',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    form: {
      grant_type: 'password',
      username: process.env.PIXMASTER_EMAIL,
      password: process.env.PIXMASTER_PASSWORD,
    },
    json: true,
  };
}

/**
 * @param options
 * - accessToken: String
 * - organizations: Array[Object]
 */
function saveOrganizations(options) {
  const errorObjects = [];

  const promises = options.organizations.map((organization) => {
    const requestConfig = _buildRequestObject(options.accessToken, organization);
    return request(requestConfig).catch((err) => {
      errorObjects.push({
        errorMessage: err.message,
        organization,
      });
    });
  });
  return Promise.all(promises).then(() => {
    return errorObjects;
  });
}

function _logErrorObjects(errorObjects) {
  console.log('Mise à jour des organisations : OK');
  console.log(`\nIl y a eu ${errorObjects.length} erreurs`);
  errorObjects.forEach((errorObject) => {
    console.log(`  > id de l'organization : ${errorObject.organization.id} - erreur : ${errorObject.errorMessage}`);
  });
}

/**
 * Usage: BASE_URL='url' (...) node update-sco-organizations-with-province-code-and-external-id.js my_file.csv
 */

const isLaunchedFromCommandLine = require.main === module;
async function main() {
  console.log("Début du script de mise à jour des Organisations avec l'ID externe et le département");
  const filePath = process.argv[2];

  const response = await request(_buildTokenRequestObject());
  const accessToken = response.access_token;

  console.log('\nTest de validité du fichier...');
  assertFileValidity(filePath);
  console.log('Test de validité du fichier : OK');

  fs.readFile(filePath, 'utf8', async function (err, data) {
    console.log('\nMise à jour des organizations...');

    // We delete the BOM UTF8 at the beginning of the CSV,
    // otherwise the first element is wrongly parsed.
    const csvRawData = data.toString('utf8').replace(/^\uFEFF/, '');

    const parsedCSVData = papa.parse(csvRawData, { header: true });

    const organizations = convertCSVDataIntoOrganizations(parsedCSVData);
    const options = { accessToken, organizations };

    const errorObjects = await saveOrganizations(options);
    _logErrorObjects(errorObjects);

    console.log('\nFin du script');
  });
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export default {
  assertFileValidity,
  convertCSVDataIntoOrganizations,
  saveOrganizations,
};

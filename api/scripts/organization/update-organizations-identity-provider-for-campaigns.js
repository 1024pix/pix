import { fileURLToPath } from 'node:url';

import bluebird from 'bluebird';
import _ from 'lodash';

import { disconnect } from '../../db/knex-database-connection.js';
import { updateOrganizationIdentityProviderForCampaigns } from '../../lib/domain/usecases/update-organization-identity-provider-for-campaigns.js';
import { DomainTransaction } from '../../lib/infrastructure/DomainTransaction.js';
import { organizationForAdminRepository } from '../../src/organizational-entities/infrastructure/repositories/organization-for-admin.repository.js';
import { checkCsvHeader, parseCsvWithHeader } from '../helpers/csvHelpers.js';

const modulePath = fileURLToPath(import.meta.url);
const IS_LAUNCHED_FROM_CLI = process.argv[1] === modulePath;

async function main() {
  console.time('Organisations identityProviderForCampaigns updated');
  console.log('Starting updating organisation identityProviderForCampaigns...');

  const filePath = process.argv[2];
  await _updateOrganizationsProvinceCode(filePath);

  console.timeEnd('Organisations identityProviderForCampaigns updated');
}

async function _updateOrganizationsProvinceCode(filePath) {
  const errors = [];
  const requiredFieldNames = ['organizationId', 'identityProviderForCampaigns'];
  const csvParsingOptions = {
    skipEmptyLines: true,
    header: true,
    transform: (value, columnName) => {
      if (typeof value === 'string') {
        value = value.trim();
      }
      if (!_.isEmpty(value)) {
        if (columnName === 'organizationId') {
          value = Number(value);
        }
      } else {
        value = null;
      }

      return value;
    },
  };

  console.log('Checking CSV header...');
  await checkCsvHeader({ filePath, requiredFieldNames });
  console.log('CSV header checked');

  console.log('Parsing CSV data...');
  const organizationsDTO = await parseCsvWithHeader(filePath, csvParsingOptions);
  console.log('CSV data parsed');

  console.log('Updating data...');
  await bluebird.mapSeries(organizationsDTO, async (organizationDTO) => {
    try {
      await DomainTransaction.execute((domainTransaction) => {
        return updateOrganizationIdentityProviderForCampaigns({
          organizationId: organizationDTO.id,
          identityProviderForCampaigns: organizationDTO.identityProviderForCampaigns,
          organizationForAdminRepository,
          domainTransaction,
        });
      });
    } catch (error) {
      errors.push({ organizationDTO, error });
    }
  });

  if (errors.length === 0) {
    return;
  }

  console.log(`Errors occurs on ${errors.length} element!`);
  errors.forEach((error) => {
    console.log(JSON.stringify(error.organizationDTO));
    console.error(error.error?.message);
  });

  throw new Error('Process done with errors');
}

if (IS_LAUNCHED_FROM_CLI) {
  try {
    await main();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
}

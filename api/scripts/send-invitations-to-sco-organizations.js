import bluebird from 'bluebird';

import { NotFoundError } from '../lib/domain/errors.js';
import { parseCsvWithHeader } from '../scripts/helpers/csvHelpers.js';
import { disconnect } from '../db/knex-database-connection.js';

import * as bookshelfToDomainConverter from '../lib/infrastructure/utils/bookshelf-to-domain-converter.js';
import { BookshelfOrganization } from '../lib/infrastructure/orm-models/Organization.js';

import * as organizationInvitationService from '../lib/domain/services/organization-invitation-service.js';
import * as organizationRepository from '../lib/infrastructure/repositories/organization-repository.js';
import * as organizationInvitationRepository from '../lib/infrastructure/repositories/organization-invitation-repository.js';
import * as url from 'url';

const TAGS = ['JOIN_ORGA'];

async function getOrganizationByExternalId(externalId) {
  return BookshelfOrganization.where({ externalId })
    .fetch()
    .then((organization) => bookshelfToDomainConverter.buildDomainObject(BookshelfOrganization, organization))
    .catch((err) => {
      if (err instanceof BookshelfOrganization.NotFoundError) {
        throw new NotFoundError(`Organization not found for External ID ${externalId}`);
      }
      throw err;
    });
}

async function buildInvitation({ externalId, email }) {
  const { id: organizationId } = await getOrganizationByExternalId(externalId);
  return { organizationId, email };
}

async function prepareDataForSending(objectsFromFile) {
  return bluebird.mapSeries(objectsFromFile, ({ uai, email }) => {
    return buildInvitation({ externalId: uai, email });
  });
}

async function sendJoinOrganizationInvitations(invitations, tags) {
  return bluebird.mapSeries(invitations, ({ organizationId, email }, index) => {
    if (isLaunchedFromCommandLine) {
      process.stdout.write(`${index}/${invitations.length}\r`);
    }

    return organizationInvitationService.createOrUpdateOrganizationInvitation({
      organizationRepository,
      organizationInvitationRepository,
      organizationId,
      email,
      tags,
    });
  });
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main() {
  console.log('Start sending "join SCO organization" invitations to users.');

  const filePath = process.argv[2];
  const argTags = process.argv[3];
  const tags = argTags ? [argTags] : TAGS;

  console.log('Reading and parsing csv file... ');
  const csvData = await parseCsvWithHeader(filePath);
  console.log(`Succesfully read ${csvData.length} records.`);

  console.log('Preparing data before sending... ');
  const invitations = await prepareDataForSending(csvData);
  console.log('ok');

  console.log('Sending invitations...');
  await sendJoinOrganizationInvitations(invitations, tags);
  console.log('\nDone.');
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error('\n', error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export { getOrganizationByExternalId, buildInvitation, prepareDataForSending, sendJoinOrganizationInvitations };

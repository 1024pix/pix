import bluebird from 'bluebird';
import { NotFoundError } from '../lib/domain/errors';
import { parseCsvWithHeader } from '../scripts/helpers/csvHelpers';
import { disconnect } from '../db/knex-database-connection';
import bookshelfToDomainConverter from '../lib/infrastructure/utils/bookshelf-to-domain-converter';
import BookshelfOrganization from '../lib/infrastructure/orm-models/Organization';
import organizationInvitationService from '../lib/domain/services/organization-invitation-service';
import organizationRepository from '../lib/infrastructure/repositories/organization-repository';
import organizationInvitationRepository from '../lib/infrastructure/repositories/organization-invitation-repository';

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
    if (require.main === module) {
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

const isLaunchedFromCommandLine = require.main === module;

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

export default {
  getOrganizationByExternalId,
  buildInvitation,
  prepareDataForSending,
  sendJoinOrganizationInvitations,
};

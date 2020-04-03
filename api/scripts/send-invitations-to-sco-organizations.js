const bluebird = require('bluebird');

const { NotFoundError } = require('../lib/domain/errors');

const { parseCsvWithHeader } = require('../scripts/helpers/csvHelpers');

const bookshelfToDomainConverter = require('../lib/infrastructure/utils/bookshelf-to-domain-converter');
const BookshelfOrganization = require('../lib/infrastructure/data/organization');

const organizationInvitationService = require('../lib/domain/services/organization-invitation-service');

const organizationRepository = require('../lib/infrastructure/repositories/organization-repository');
const organizationInvitationRepository = require('../lib/infrastructure/repositories/organization-invitation-repository');

const TAGS = ['JOIN_ORGA'];

async function getOrganizationByExternalId(externalId) {
  return BookshelfOrganization
    .where({ externalId })
    .fetch({ require: true })
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

    return organizationInvitationService.createOrganizationInvitation({
      organizationRepository, organizationInvitationRepository, organizationId, email, tags
    });
  });
}

async function main() {
  console.log('Start sending "join SCO organization" invitations to users.');

  try {
    const filePath = process.argv[2];
    const argTags = process.argv[3];

    const tags = argTags ? [argTags] : TAGS;

    console.log('Reading and parsing csv file... ');
    const csvData = parseCsvWithHeader(filePath);
    console.log(`Succesfully read ${csvData.length} records.`);

    console.log('Preparing data before sending... ');
    const invitations = await prepareDataForSending(csvData);
    console.log('ok');

    console.log('Sending invitations...');
    await sendJoinOrganizationInvitations(invitations, tags);
    console.log('\nDone.');

  } catch (error) {
    console.error('\n', error);
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
  getOrganizationByExternalId,
  buildInvitation,
  prepareDataForSending,
  sendJoinOrganizationInvitations
};

const logger = require('../../infrastructure/logger');

const SNAPSHOT_CSV_PAGE_SIZE = 200;

module.exports = async function writeOrganizationSharedProfilesAsCsvToStream(
  {
    organizationId,
    writableStream,
    organizationRepository,
    competenceRepository,
    snapshotRepository,
    snapshotsCsvConverter,
  }) {

  const [organization, competences] = await Promise.all([
    organizationRepository.get(organizationId),
    competenceRepository.list(),
  ]);

  writableStream.write(snapshotsCsvConverter.generateHeader(organization, competences));

  const writeSnapshotsByPage = async (pageNumber) => {
    try {
      const paginatedSnapshots = await snapshotRepository.find({
        filter: { organizationId },
        page: {
          number: pageNumber,
          size: SNAPSHOT_CSV_PAGE_SIZE,
        },
        sort: [ '-createdAt' ],
        include: [ 'user' ],
      });

      const snapshots = paginatedSnapshots.models;

      if (snapshots.length) {
        const csvPage = snapshotsCsvConverter.convertJsonToCsv(snapshots);
        writableStream.write(csvPage);
        writeSnapshotsByPage(pageNumber + 1);
      } else {
        writableStream.end();
      }
    } catch (err) {
      logger.error(err);
      writableStream.emit('error', err);
    }
  };

  // No return/await here, we need the writing to continue in the background after this function's returned promise
  // resolves. If we await the writeSnapshotsByPage function, node will keep the snapshots in memory until
  // the end of the complete operation.
  writeSnapshotsByPage(1);
};

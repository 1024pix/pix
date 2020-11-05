const _ = require('lodash');
const { knex } = require('../db/knex-database-connection');
const { scaleDownBase64FormattedImage } = require('../lib/infrastructure/utils/image-utils');

async function _findOrganizationIdsWithLogoUrl() {
  const results = await knex('organizations')
    .select('id')
    .whereNotNull('logoUrl');

  return _.map(results, 'id');
}

async function _scaleDownOrganizationLogoUrl(organizationId) {
  const { logoUrl } = await knex('organizations')
    .select('logoUrl')
    .where({ id: organizationId })
    .first();

  const {
    scaledDownImage: scaledDownLogoUrl,
    sizeDiff,
  } = await scaleDownBase64FormattedImage({ originImage: logoUrl, height: 70, width: 70 });

  return {
    scaledDownLogoUrl,
    sizeDiff,
  };
}

function _generateQueryToUpdateLogoUrl(organizationId, scaledDownLogoUrl) {
  return knex('organizations')
    .where({ id: organizationId })
    .update({
      logoUrl: scaledDownLogoUrl,
    }).toString();
}

async function _updateOrganizations(updateQueries) {
  const chunkSize = 1000;
  let organizationsUpdatedCount = 0;
  const updateQueriesChunks = _.chunk(updateQueries, chunkSize);
  for (const updateQueriesChunk of updateQueriesChunks) {
    await knex.raw(_.join(updateQueriesChunk, ';'));
    organizationsUpdatedCount += updateQueriesChunk.length;
    console.log(`${organizationsUpdatedCount}/${updateQueries.length} organizations updated`);
  }
}

async function main() {
  try {
    const organizationIdsWithLogoUrl = await _findOrganizationIdsWithLogoUrl();
    console.log(`${organizationIdsWithLogoUrl.length} organizations with image`);

    let totalSizeDiff = 0;
    const updateQueries = [];
    for (const organizationId of organizationIdsWithLogoUrl) {
      const { scaledDownLogoUrl, sizeDiff } = await _scaleDownOrganizationLogoUrl(organizationId);
      if (sizeDiff !== -1) {
        updateQueries.push(_generateQueryToUpdateLogoUrl(organizationId, scaledDownLogoUrl));
        totalSizeDiff += sizeDiff;
      }
    }
    console.log(`Organizations to update : ${updateQueries.length}`);
    console.log(`Size diff : ${totalSizeDiff} bytes`);

    console.log('Updating organizations...');
    await _updateOrganizations(updateQueries);
    console.log('DONE');
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
    },
  );
}

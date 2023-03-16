const { knex } = require('../../db/knex-database-connection');
const DomainTransaction = require('../../lib/infrastructure/DomainTransaction');
const { disconnect } = require('../../db/knex-database-connection');

async function swapCampaignCodes(campaignId, otherCampaignId) {
  const { code: campaignCode } = await knex('campaigns').where({ id: campaignId }).first();
  const { code: otherCampaignCode } = await knex('campaigns').where({ id: otherCampaignId }).first();

  await DomainTransaction.execute(async (domainTransaction) => {
    await domainTransaction.knexTransaction('campaigns').where({ id: campaignId }).update({ code: otherCampaignCode });
    await domainTransaction.knexTransaction('campaigns').where({ id: otherCampaignId }).update({ code: campaignCode });
  });
}

const isLaunchedFromCommandLine = require.main === module;

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await swapCampaignCodes(process.argv[2], process.argv[3]);
      console.log('done');
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

module.exports = { swapCampaignCodes };

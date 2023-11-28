import { knex, disconnect } from '../../db/knex-database-connection.js';
import { generate } from '../../lib/domain/services/code-generator.js';
import { DomainTransaction } from '../../lib/infrastructure/DomainTransaction.js';
import * as campaignRepository from '../../src/prescription/campaign/infrastructure/repositories/campaign-administration-repository.js';
import * as url from 'url';

async function swapCampaignCodes(campaignId, otherCampaignId) {
  const temporaryCode = await generate(campaignRepository);
  const { code: campaignCode } = await knex('campaigns').where({ id: campaignId }).first();
  const { code: otherCampaignCode } = await knex('campaigns').where({ id: otherCampaignId }).first();

  await DomainTransaction.execute(async (domainTransaction) => {
    await domainTransaction.knexTransaction('campaigns').where({ id: otherCampaignId }).update({ code: temporaryCode });
    await domainTransaction.knexTransaction('campaigns').where({ id: campaignId }).update({ code: otherCampaignCode });
    await domainTransaction.knexTransaction('campaigns').where({ id: otherCampaignId }).update({ code: campaignCode });
  });
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

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

export { swapCampaignCodes };

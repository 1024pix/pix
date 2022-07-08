require('dotenv').config();
const { performance } = require('perf_hooks');
const logger = require('../../lib/infrastructure/logger');
const { disconnect } = require('../../db/knex-database-connection');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { knex } = require('../../db/knex-database-connection');
const CampaignParticipation = require('../../lib/domain/models/CampaignParticipation');

async function main() {
  const startTime = performance.now();
  logger.info(`Script compute badge acquisitions has started`);
  const args = _getAllArgs();

  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  logger.info(`Script has ended: took ${duration} milliseconds`);
}

function _getAllArgs() {
  return yargs(hideBin(process.argv))
    .option('idMin', {
      type: 'number',
      demand: true,
      description: 'id de la première campagne participation',
    })
    .option('idMax', {
      type: 'number',
      demand: true,
      description: 'id de la dernière campagne participation',
    })
    .option('dryRun', {
      type: 'boolean',
      description: 'permet de lancer le script sans créer les badges manquants',
    })
    .help().argv;
}

async function getCampaignParticipationsBetweenIds({ idMin, idMax }) {
  const campaignParticipations = await knex('campaign-participations').whereBetween('id', [idMin, idMax]);
  return campaignParticipations.map((campaignParticipation) => new CampaignParticipation(campaignParticipation));
}

const isLaunchedFromCommandLine = require.main === module;

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

module.exports = { getCampaignParticipationsBetweenIds };

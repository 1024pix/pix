const bluebird = require('bluebird');
const { knex } = require('../../db/knex-database-connection');
const knowledgeElementRepository = require('../../lib/infrastructure/repositories/knowledge-element-repository');
const knowledgeElementSnapshotRepository = require('../../lib/infrastructure/repositories/knowledge-element-snapshot-repository');

const DEFAULT_MAX_SNAPSHOT_COUNT = 5000;
const DEFAULT_CONCURRENCY = 3;

function _printUsage() {
  console.log(`
  node generate-knowledge-element-snapshots-for-active-campaigns.js [OPTIONS]
    --maxSnapshotCount <count>  : Nombre de snapshots max. à générer (doit être supérieur à 0, défaut: ${DEFAULT_MAX_SNAPSHOT_COUNT})
    --concurrency <count>       : Concurrence (doit être supérieur à 0, limite 10, défaut: ${DEFAULT_CONCURRENCY})
    --help ou -h                : Affiche l'aide`);
}

function _validateAndNormalizeArgs(commandLineArgs) {
  if (commandLineArgs.find((commandLineArg) => (commandLineArg === '--help' || commandLineArg === '-h'))) {
    _printUsage();
    process.exit(0);
  }
  const commandLineArgsLength = commandLineArgs.length;
  const maxSnapshotCountIndicatorIndex = commandLineArgs.findIndex((commandLineArg) => commandLineArg === '--maxSnapshotCount');
  let maxSnapshotCount;
  if (maxSnapshotCountIndicatorIndex === -1 || maxSnapshotCountIndicatorIndex + 1 >= commandLineArgsLength) {
    maxSnapshotCount = DEFAULT_MAX_SNAPSHOT_COUNT;
  } else {
    maxSnapshotCount = parseInt(commandLineArgs[maxSnapshotCountIndicatorIndex + 1]);
    if (isNaN(maxSnapshotCount)) {
      maxSnapshotCount = DEFAULT_MAX_SNAPSHOT_COUNT;
    }
    if (maxSnapshotCount <= 0) {
      throw new Error(`Nombre max de snapshots ${commandLineArgs[maxSnapshotCountIndicatorIndex + 1]} ne peut pas être inférieur à 1.`);
    }
  }
  const concurrencyIndicatorIndex = commandLineArgs.findIndex((commandLineArg) => commandLineArg === '--concurrency');
  let concurrency;
  if (concurrencyIndicatorIndex === -1 || concurrencyIndicatorIndex + 1 >= commandLineArgsLength) {
    concurrency = DEFAULT_CONCURRENCY;
  } else {
    concurrency = parseInt(commandLineArgs[concurrencyIndicatorIndex + 1]);
    if (isNaN(concurrency)) {
      concurrency = DEFAULT_CONCURRENCY;
    }
    if (concurrency <= 0 || concurrency > 10) {
      throw new Error(`Concurrent ${commandLineArgs[concurrencyIndicatorIndex + 1]} ne peut pas être inférieur à 1 ni supérieur à 10.`);
    }
  }

  return {
    maxSnapshotCount,
    concurrency,
  };
}

async function getEligibleCampaignParticipations(maxSnapshotCount) {
  return knex('campaign-participations').select('campaign-participations.userId', 'campaign-participations.sharedAt')
    .leftJoin('knowledge-element-snapshots', 'knowledge-element-snapshots.userId', 'campaign-participations.userId')
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .whereNull('campaigns.archivedAt')
    .whereNotNull('campaign-participations.sharedAt')
    .where((qb) => {
      qb.whereNull('knowledge-element-snapshots.snappedAt')
        .orWhereRaw('?? != ??', ['campaign-participations.sharedAt', 'knowledge-element-snapshots.snappedAt']);
    })
    .orderBy('campaign-participations.userId')
    .limit(maxSnapshotCount);
}

async function generateKnowledgeElementSnapshots(campaignParticipationData, concurrency) {
  return bluebird.map(campaignParticipationData, async (campaignParticipation) => {
    const { userId, sharedAt: snappedAt } = campaignParticipation;
    const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId, limitDate: snappedAt });
    return knowledgeElementSnapshotRepository.save({ userId, snappedAt, knowledgeElements });
  }, { concurrency });
}

async function main() {
  try {
    const commandLineArgs = process.argv.slice(2);
    console.log('Validation des arguments...');
    const {
      maxSnapshotCount,
      concurrency,
    } = _validateAndNormalizeArgs(commandLineArgs);

    console.log(`Génération de ${maxSnapshotCount} snapshots avec une concurrence de ${concurrency}`);
    const campaignParticipationData = await getEligibleCampaignParticipations(maxSnapshotCount);

    console.log(`${campaignParticipationData.length} participations récupérées...`);
    await generateKnowledgeElementSnapshots(campaignParticipationData, concurrency);
    console.log('FIN');
  } catch (error) {
    console.error(error);
    _printUsage();
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
  getEligibleCampaignParticipations,
  generateKnowledgeElementSnapshots,
};

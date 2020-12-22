const yargs = require('yargs');
const bluebird = require('bluebird');
const { knex } = require('../../db/knex-database-connection');
const knowledgeElementRepository = require('../../lib/infrastructure/repositories/knowledge-element-repository');
const knowledgeElementSnapshotRepository = require('../../lib/infrastructure/repositories/knowledge-element-snapshot-repository');
const { AlreadyExistingEntityError } = require('../../lib/domain/errors');

const DEFAULT_MAX_SNAPSHOT_COUNT = 5000;
const DEFAULT_CONCURRENCY = 3;

function _validateAndNormalizeMaxSnapshotCount(maxSnapshotCount) {
  if (isNaN(maxSnapshotCount)) {
    maxSnapshotCount = DEFAULT_MAX_SNAPSHOT_COUNT;
  }
  if (maxSnapshotCount <= 0 || maxSnapshotCount > 50000) {
    throw new Error(`Nombre max de snapshots ${maxSnapshotCount} ne peut pas être inférieur à 1 ni supérieur à 50000.`);
  }

  return maxSnapshotCount;
}

function _validateAndNormalizeConcurrency(concurrency) {
  if (isNaN(concurrency)) {
    concurrency = DEFAULT_CONCURRENCY;
  }
  if (concurrency <= 0 || concurrency > 10) {
    throw new Error(`Concurrent ${concurrency} ne peut pas être inférieur à 1 ni supérieur à 10.`);
  }

  return concurrency;
}

function _validateAndNormalizeArgs({
  concurrency,
  maxSnapshotCount,
}) {
  const finalMaxSnapshotCount = _validateAndNormalizeMaxSnapshotCount(maxSnapshotCount);
  const finalConcurrency = _validateAndNormalizeConcurrency(concurrency);

  return {
    maxSnapshotCount: finalMaxSnapshotCount,
    concurrency: finalConcurrency,
  };
}

async function getEligibleCampaignParticipations(maxSnapshotCount) {
  return knex('campaign-participations').select('campaign-participations.userId', 'campaign-participations.sharedAt')
    .leftJoin('knowledge-element-snapshots', function() {
      this.on('knowledge-element-snapshots.userId', 'campaign-participations.userId')
        .andOn('knowledge-element-snapshots.snappedAt', 'campaign-participations.sharedAt');
    })
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
    const { userId, sharedAt } = campaignParticipation;
    const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId, limitDate: sharedAt });
    try {
      await knowledgeElementSnapshotRepository.save({ userId, snappedAt: sharedAt, knowledgeElements });
    } catch (err) {
      if (err instanceof AlreadyExistingEntityError) {
        console.log(`Un snapshot existe déjà pour l'utilisateur ${userId} à la date ${sharedAt}. Ignoré.`);
      } else {
        throw err;
      }
    }
  }, { concurrency });
}

async function main() {
  try {
    const commandLineArgs = yargs
      .option('maxSnapshotCount', {
        description: 'Nombre de snapshots max. à générer.',
        type: 'number',
        default: DEFAULT_MAX_SNAPSHOT_COUNT,
      })
      .option('concurrency', {
        description: 'Concurrence',
        type: 'number',
        default: DEFAULT_CONCURRENCY,
      })
      .help()
      .argv;
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
    console.error('\x1b[31mErreur : %s\x1b[0m', error.message);
    yargs.showHelp();
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

module.exports = {
  getEligibleCampaignParticipations,
  generateKnowledgeElementSnapshots,
};

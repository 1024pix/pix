import * as url from 'node:url';

import { disconnect, knex } from '../../db/knex-database-connection.js';
import * as knowledgeElementSnapshotRepository from '../../src/prescription/campaign/infrastructure/repositories/knowledge-element-snapshot-repository.js';
import { KnowledgeElementCollection } from '../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { AlreadyExistingEntityError } from '../../src/shared/domain/errors.js';
import * as knowledgeElementRepository from '../../src/shared/infrastructure/repositories/knowledge-element-repository.js';
import { PromiseUtils } from '../../src/shared/infrastructure/utils/promise-utils.js';

const DEFAULT_MAX_SNAPSHOT_COUNT = 5000;
const DEFAULT_CONCURRENCY = 3;

async function getEligibleCampaignParticipations(maxSnapshotCount = DEFAULT_MAX_SNAPSHOT_COUNT) {
  return knex('campaign-participations')
    .select('campaign-participations.id', 'campaign-participations.userId', 'campaign-participations.sharedAt')
    .leftJoin(
      'knowledge-element-snapshots',
      'knowledge-element-snapshots.campaignParticipationId',
      'campaign-participations.id',
    )
    .whereNotNull('campaign-participations.sharedAt')
    .where('knowledge-element-snapshots.snapshot', '{}')
    .orderBy('campaign-participations.id')
    .limit(maxSnapshotCount);
}

async function generateKnowledgeElementSnapshots(
  campaignParticipationData,
  concurrency = DEFAULT_CONCURRENCY,
  dependencies = { knowledgeElementRepository, knowledgeElementSnapshotRepository },
) {
  return PromiseUtils.map(
    campaignParticipationData,
    async (campaignParticipation) => {
      const { userId, sharedAt, id } = campaignParticipation;
      const knowledgeElements = await dependencies.knowledgeElementRepository.findUniqByUserId({
        userId,
        limitDate: sharedAt,
      });
      try {
        await dependencies.knowledgeElementSnapshotRepository.save({
          snapshot: new KnowledgeElementCollection(knowledgeElements).toSnapshot(),
          campaignParticipationId: id,
        });
      } catch (err) {
        if (!(err instanceof AlreadyExistingEntityError)) {
          throw err;
        }
      }
    },
    { concurrency },
  );
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main() {
  const campaignParticipationData = await getEligibleCampaignParticipations();

  await generateKnowledgeElementSnapshots(campaignParticipationData);
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error('\x1b[31mErreur : %s\x1b[0m', error.message);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export { generateKnowledgeElementSnapshots, getEligibleCampaignParticipations };

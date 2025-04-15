import { knex } from '../../../db/knex-database-connection.js';
import { commaSeparatedNumberParser } from '../../shared/application/scripts/parsers.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import * as knowledgeElementRepository from '../../shared/infrastructure/repositories/knowledge-element-repository.js';
import * as campaignRepository from '../campaign/infrastructure/repositories/campaign-repository.js';
import * as knowledgeElementSnapshotRepository from '../campaign/infrastructure/repositories/knowledge-element-snapshot-repository.js';
import { KnowledgeElementCollection } from '../shared/domain/models/KnowledgeElementCollection.js';

const LOG_CONTEXT = 'add-missing-knowledge-element-snapshots';

class AddMissingKnowledgeElementSnapshots extends Script {
  constructor() {
    super({
      description: 'Script to add delete knowledge-element-snapshots from same participation',
      permanent: false,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'execute script without commit',
          demandOption: false,
          default: true,
        },
        campaignParticipationIds: {
          type: 'string',
          describe: 'a list of comma separated campaign participation ids',
          demandOption: true,
          coerce: commaSeparatedNumberParser(),
        },
      },
    });
  }

  async handle({ options, logger }) {
    logger.info(`${LOG_CONTEXT} | START`);
    logger.info(`${LOG_CONTEXT} | dryRun ${options.dryRun}`);

    const trx = await knex.transaction();
    let nbSnapshotsCreated = 0;
    for (const campaignParticipationId of options.campaignParticipationIds) {
      const campaign = await campaignRepository.getByCampaignParticipationId(campaignParticipationId);
      if (campaign === null) {
        logger.error(`${LOG_CONTEXT} | Skip campaign participation ${campaignParticipationId}, campaign not found`);
        continue;
      }
      if (campaign.isExam) {
        logger.error(`${LOG_CONTEXT} | Skip campaign participation ${campaignParticipationId}, campaign to exam`);
        continue;
      }
      const participation = await trx('campaign-participations')
        .select(['userId', 'sharedAt'])
        .where({ id: campaignParticipationId })
        .first();

      const existingSnapshots = await trx('knowledge-element-snapshots')
        .count({ count: 1 })
        .where({ campaignParticipationId })
        .first();

      if (existingSnapshots.count !== 0) {
        logger.error(
          `${LOG_CONTEXT} | We are skipping this campaignParticipation ${campaignParticipationId} because a snapshot already exists for it.`,
        );
        continue;
      }

      const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({
        userId: participation.userId,
        limitDate: participation.sharedAt,
      });
      await knowledgeElementSnapshotRepository.save({
        snapshot: new KnowledgeElementCollection(knowledgeElements).toSnapshot(),
        campaignParticipationId,
      });
      nbSnapshotsCreated++;
    }
    logger.info(
      `${LOG_CONTEXT} | Created ${nbSnapshotsCreated} snapshots. Skipped ${options.campaignParticipationIds.length - nbSnapshotsCreated} participations`,
    );

    try {
      if (options.dryRun) {
        logger.info(`${LOG_CONTEXT} | rollback | Mode dry run`);
        await trx.rollback();
      } else {
        logger.info(`${LOG_CONTEXT} | commit`);
        await trx.commit();
      }
    } catch (err) {
      logger.error(`${LOG_CONTEXT} | FAIL | Reason : ${err}`);
      await trx.rollback();
    } finally {
      logger.info(`${LOG_CONTEXT} | END`);
    }
  }
}

await ScriptRunner.execute(import.meta.url, AddMissingKnowledgeElementSnapshots);

export { AddMissingKnowledgeElementSnapshots };

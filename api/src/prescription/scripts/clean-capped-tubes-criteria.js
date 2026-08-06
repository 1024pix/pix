import { knex } from '../../../db/knex-database-connection.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';

/**
 *
 * @returns {Promise<{id: number, missingTubeIds number[], cappedTubes: {id: string, level: number}}>}
 */
async function getBadgeCriteriaWitMissingTubesIds(knexConn) {
  return await knexConn('badge-criteria')
    .select(
      'badge-criteria.id',
      knex.raw('jsonb_agg(cappedTube.value->>\'id\') as "missingTubeIds"'),
      'badge-criteria.cappedTubes',
    )
    .join('badges', 'badges.id', '=', 'badge-criteria.badgeId')
    .crossJoin(knex.raw('jsonb_array_elements("cappedTubes") AS cappedTube (value)'))
    .where('badge-criteria.scope', '=', 'CappedTubes')
    .where('isCertifiable', '=', false)
    .whereRaw(
      `cappedTube.value->>'id' NOT IN (
         SELECT "tubeId"
         FROM "target-profile_tubes"
         WHERE "targetProfileId" = badges."targetProfileId"
       )`,
    )
    .groupBy('badge-criteria.id', 'badge-criteria.cappedTubes');
}

export class CleanCappedTubesCriteriaScript extends Script {
  constructor() {
    super({
      description: "Clean badges-criteria capped tubes which are no more existing in the badge's targe-profile",
      permanent: false,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'Run the script without making any database changes',
          default: true,
        },
      },
    });
  }

  async handle({ options, logger }) {
    await DomainTransaction.execute(async () => {
      const knexConn = DomainTransaction.getConnection();
      const criteria = await getBadgeCriteriaWitMissingTubesIds(knexConn);

      logger.info(`found ${criteria.length} badge criteria referencing invalid tubeId`);

      for (const criterion of criteria) {
        const filteredCappedTubes = criterion.cappedTubes.filter(({ id }) => !criterion.missingTubeIds.includes(id));
        if (filteredCappedTubes.length === 0) {
          logger.warn(`BadgeCriterion id${criterion.id} has empty cappedTubes`);
        }
        await knexConn('badge-criteria')
          .update({ cappedTubes: JSON.stringify(filteredCappedTubes) })
          .where({ id: criterion.id });
      }

      if (options.dryRun) {
        await knexConn.rollback();
        logger.info('ROLLBACK: no changes were persisted (dry run)');
        logger.info('remove --dryRun to persist changes');
        return;
      }
      await knexConn.commit();
      logger.info('COMMIT: changes persisted');
      logger.info(`update ${criteria.length} badge criteria`);
    });
  }
}

await ScriptRunner.execute(import.meta.url, CleanCappedTubesCriteriaScript);

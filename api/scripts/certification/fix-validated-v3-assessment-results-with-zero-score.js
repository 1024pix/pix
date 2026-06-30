import { knex } from '../../db/knex-database-connection.js';
import { AutoJuryCommentKeys } from '../../src/certification/shared/domain/models/JuryComment.js';
import { Script } from '../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../src/shared/application/scripts/script-runner.js';

export class FixValidatedV3AssessmentResultsWithZeroScoreScript extends Script {
  constructor() {
    super({
      description:
        'Fix assessment-results for v3 certifications that were incorrectly set to "validated" status ' +
        'despite having a pixScore of 0. Those records should be "rejected".',
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

  async handle({ logger, options }) {
    const { dryRun } = options;
    logger.info(`Script execution started with options ${JSON.stringify(options)}`);

    const trx = await knex.transaction();

    try {
      const updatedIds = await fixValidatedResultsWithZeroScore(trx);

      if (dryRun) {
        await trx.rollback();
        logger.info(`[DRY RUN] ${updatedIds.length} assessment-results would have been updated to "rejected".`);
        return;
      }

      await trx.commit();
      logger.info(`Script finished. ${updatedIds.length} assessment-results updated from "validated" to "rejected".`);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}

async function fixValidatedResultsWithZeroScore(trx) {
  return trx('assessment-results')
    .update({ status: 'rejected', commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_ZERO_PIX_SCORE })
    .whereIn(
      'id',
      trx('assessment-results as ar')
        .select('ar.id')
        .join('assessments as ass', 'ass.id', 'ar.assessmentId')
        .join('certification-courses as cs', 'cs.id', 'ass.certificationCourseId')
        .where('ar.pixScore', 0)
        .where('ar.status', 'validated')
        .where('cs.version', 3),
    )
    .returning('id');
}

await ScriptRunner.execute(import.meta.url, FixValidatedV3AssessmentResultsWithZeroScoreScript);

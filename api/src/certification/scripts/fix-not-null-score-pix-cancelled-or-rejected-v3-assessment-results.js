import { knex } from '../../../db/knex-database-connection.js';
import { Script } from '../../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../../src/shared/application/scripts/script-runner.js';

export class FixNotNullScorePixCancelledOrRejectedV3AssessmentResultsScript extends Script {
  constructor() {
    super({
      description: 'Make pix score of v3 rejected or cancelled assessment results null.',
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
      const updatedIds = await fixResults(trx);

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

async function fixResults(trx) {
  return trx('assessment-results')
    .update({ pixScore: null })
    .whereIn(
      'id',
      trx('assessment-results as ar')
        .select('ar.id')
        .join('assessments as ass', 'ass.id', 'ar.assessmentId')
        .join('certification-courses as cs', 'cs.id', 'ass.certificationCourseId')
        .where('cs.version', 3)
        .where((builder) => {
          builder.where('ar.status', 'cancelled').orWhere((inner) => {
            inner.where('ar.status', 'rejected').whereNot('ar.pixScore', 0);
          });
        }),
    )
    .returning('id');
}

await ScriptRunner.execute(import.meta.url, FixNotNullScorePixCancelledOrRejectedV3AssessmentResultsScript);

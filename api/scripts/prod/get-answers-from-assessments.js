import { knex } from '../../db/knex-database-connection.js';
import { Script } from '../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../src/shared/application/scripts/script-runner.js';

export class GetAnswersFromAssessments extends Script {
  constructor() {
    super({
      description: 'Get answers from a list of assessments',
      permanent: true,
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

    const todayDate = new Date();
    const oneYearAgoString = new Date(todayDate.getFullYear() - 1, todayDate.getMonth(), todayDate.getDate())
      .toISOString()
      .split('T')[0];

    const targetTypes = ['DEMO', 'COMPETENCE_EVALUATION', 'PLACEMENT', 'PREVIEW', 'CAMPAIGN'];

    const answerToBeDeleted = await knex
      .select('answers.*')
      .from('assessments')
      .join('answers', 'answers.assessmentId', 'assessments.id')
      .whereIn('assessments.type', targetTypes)
      .where('assessments.state', 'completed')
      .whereRaw('DATE(assessments."updatedAt") = ?', [oneYearAgoString]);

    if (dryRun) {
      logger.info(`${answerToBeDeleted.length} would be inserted to parquet file`);
    } else {
      const answerToBeDeletedIds = answerToBeDeleted.map(({ id }) => id);
      await knex.delete().from('answers').whereIn('id', answerToBeDeletedIds);
    }
  }
}
await ScriptRunner.execute(import.meta.url, GetAnswersFromAssessments);

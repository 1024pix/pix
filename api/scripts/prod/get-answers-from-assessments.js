import { knex } from '../../db/knex-database-connection.js';
import { Script } from '../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../src/shared/application/scripts/script-runner.js';

export class GetAnswersFromAssessments extends Script {
  constructor() {
    super({
      description: 'Get answers from a list of assessments',
      permanent: true,
    });
  }

  async handle() {
    const todayDate = new Date();
    const oneYearAgoString = new Date(todayDate.getFullYear() - 1, todayDate.getMonth(), todayDate.getDate())
      .toISOString()
      .split('T')[0];

    const targetTypes = ['DEMO', 'COMPETENCE_EVALUATION', 'PLACEMENT', 'PREVIEW', 'CAMPAIGN'];

    return knex
      .select('answers.*')
      .from('answers')
      .join('assessments', 'answers.assessmentId', 'assessments.id')
      .whereIn('assessments.type', targetTypes)
      .where('assessments.state', 'completed')
      .whereRaw('DATE(assessments."updatedAt") = ?', [oneYearAgoString]);
  }
}
await ScriptRunner.execute(import.meta.url, GetAnswersFromAssessments);

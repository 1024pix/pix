import 'dotenv/config';

import { knex } from '../db/knex-database-connection.js';
import { logger } from '../src/shared/infrastructure/utils/logger.js';
import { executeScript } from './tooling/tooling.js';

async function fillInAssessmentMethod() {
  const chunkSize = 50000;
  const maxId = (await knex('assessments').max('id').first()).max;

  for (let startId = 0; startId < maxId; startId += chunkSize) {
    const rowsUpdatedCount = await knex('assessments')
      .whereBetween('id', [startId, startId + chunkSize - 1])
      .whereNull('method')
      .update({
        method: knex.raw(`
	      CASE "type"
	        WHEN 'COMPETENCE_EVALUATION' THEN 'SMART_RANDOM'
	        WHEN 'CAMPAIGN' THEN 'SMART_RANDOM'
	        WHEN 'PLACEMENT' THEN 'SMART_RANDOM'
	        WHEN 'CERTIFICATION' THEN 'CERTIFICATION_DETERMINED'
	        WHEN 'DEMO' THEN 'COURSE_DETERMINED'
	        WHEN 'PREVIEW' THEN 'CHOSEN'
	      END`),
      });

    logger.info(`Updated rows : ${rowsUpdatedCount}`);
  }

  logger.info('End fillInAssessmentMethod');
}

(async () => {
  await executeScript({ processArgvs: process.argv, scriptFn: fillInAssessmentMethod });
})();

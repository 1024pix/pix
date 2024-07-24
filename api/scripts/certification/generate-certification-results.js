import { disconnect, knex } from '../../db/knex-database-connection.js';

const ASSESSMENT_COUNT = parseInt(process.env.ASSESSMENT_COUNT) || 100;
import * as url from 'node:url';

import bluebird from 'bluebird';

import * as scoringCertificationService from '../../src/certification/shared/domain/services/scoring-certification-service.js';
import * as certificationAssessmentRepository from '../../src/certification/shared/infrastructure/repositories/certification-assessment-repository.js';

async function _retrieveLastScoredAssessmentIds() {
  const result = await knex.raw(
    `
    SELECT ass.id FROM "certification-courses" AS cc
    JOIN "assessments" AS ass ON ass."certificationCourseId" = cc."id"
    JOIN "assessment-results" AS assr ON assr."assessmentId" = ass."id"
    WHERE cc."completedAt" IS NOT NULL
    ORDER BY cc."updatedAt" DESC LIMIT ??;
  `,
    ASSESSMENT_COUNT,
  );
  return result.rows.map((row) => row.id);
}

async function _computeScore(assessmentIds) {
  const scores = await bluebird.map(
    assessmentIds,
    async (assessmentId) => {
      try {
        const certificationAssessment = await certificationAssessmentRepository.get(assessmentId);
        const certificationAssessmentScore =
          await scoringCertificationService.calculateCertificationAssessmentScore(certificationAssessment);
        return certificationAssessmentScore;
      } catch (err) {
        const message = `Erreur de génération pour l'assessment : ${assessmentId}`;
        console.error(message);
        return { message };
      }
    },
    { concurrency: ~~process.env.CONCURRENCY || 10 },
  );
  return scores;
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main() {
  console.error(`Récupération de ${ASSESSMENT_COUNT} assessments...`);
  const assessmentIds = await _retrieveLastScoredAssessmentIds();
  const scores = await _computeScore(assessmentIds);
  scores.forEach((score) => console.log(score));
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

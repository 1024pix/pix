import { knex, disconnect } from '../../db/knex-database-connection';
import _ from 'lodash';
const ASSESSMENT_COUNT = parseInt(process.env.ASSESSMENT_COUNT) || 100;
const ASSESSMENT_ID = parseInt(process.env.ASSESSMENT_ID) || null;
import bluebird from 'bluebird';
import scoringCertificationService from '../../lib/domain/services/scoring/scoring-certification-service';
import certificationAssessmentRepository from '../../lib/infrastructure/repositories/certification-assessment-repository';
async function _retrieveLastScoredAssessmentIds() {
  const result = await knex.raw(
    `
    SELECT ass.id FROM "certification-courses" AS cc
    JOIN "assessments" AS ass ON ass."certificationCourseId" = cc."id"
    JOIN "assessment-results" AS assr ON assr."assessmentId" = ass."id"
    WHERE cc."completedAt" IS NOT NULL
    ORDER BY cc."updatedAt" DESC LIMIT ??;
  `,
    ASSESSMENT_COUNT
  );

  const lastScoredAssessmentIds = _(result.rows)
    .map((row) => row.id)
    .sortBy()
    .value();

  console.log({ lastScoredAssessmentIds });

  return lastScoredAssessmentIds;
}

async function _computeScore(assessmentIds) {
  const scores = await bluebird.map(
    assessmentIds,
    async (assessmentId) => {
      try {
        const certificationAssessment = await certificationAssessmentRepository.get(assessmentId);
        const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore(
          certificationAssessment
        );
        certificationAssessmentScore.assessmentId = assessmentId;

        certificationAssessmentScore.competenceMarks.forEach((competenceMark) => {
          competenceMark.assessmentId = assessmentId;
        });

        return certificationAssessmentScore;
      } catch (err) {
        const message = `Erreur de génération pour l'assessment : ${assessmentId}`;
        console.error(message);
        return { message };
      }
    },
    { concurrency: ~~process.env.CONCURRENCY || 10 }
  );
  return scores;
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  let assessmentIds = [];
  if (ASSESSMENT_ID) {
    assessmentIds = [ASSESSMENT_ID];
  } else {
    console.error(`Récupération de ${ASSESSMENT_COUNT} assessments...`);
    assessmentIds = await _retrieveLastScoredAssessmentIds();
  }
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

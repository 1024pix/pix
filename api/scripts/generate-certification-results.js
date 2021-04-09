const { knex } = require('../db/knex-database-connection');
const ASSESSMENT_COUNT = parseInt(process.env.ASSESSMENT_COUNT) || 100;
const bluebird = require('bluebird');
const scoringCertificationService = require('../lib/domain/services/scoring/scoring-certification-service');
const certificationAssessmentRepository = require('../lib/infrastructure/repositories/certification-assessment-repository');

async function _retrieveLastScoredAssessmentIds() {
  const result = await knex.raw(`
    SELECT ass.id FROM "certification-courses" AS cc
    JOIN "assessments" AS ass ON ass."certificationCourseId" = cc."id"
    JOIN "assessment-results" AS assr ON assr."assessmentId" = ass."id"
    WHERE cc."completedAt" IS NOT NULL
    ORDER BY cc."updatedAt" DESC LIMIT ??;
  `, ASSESSMENT_COUNT);
  return result.rows.map((row) => row.id);
}

async function _computeScore(assessmentIds) {
  const scores = await bluebird.map(assessmentIds, async (assessmentId) => {
    try {
      const certificationAssessment = await certificationAssessmentRepository.get(assessmentId);
      const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore(certificationAssessment);
      return certificationAssessmentScore;
    } catch (err) {
      const message = `Erreur de génération pour l'assessment : ${assessmentId}`;
      console.error(message);
      return { message };
    }
  }, { concurrency: ~~process.env.CONCURRENCY || 10 });
  return scores;
}

async function main() {
  try {
    console.error(`Récupération de ${ASSESSMENT_COUNT} assessments...`);
    const assessmentIds = await _retrieveLastScoredAssessmentIds();
    const scores = await _computeScore(assessmentIds);
    scores.forEach((score) => console.log(score));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    },
  );
}

/* eslint-disable no-console, no-unused-vars */
require('dotenv').config();

const answerRepository = require('../../lib/infrastructure/repositories/answer-repository');
const assessmentRepository = require('../../lib/infrastructure/repositories/assessment-repository');
const assessmentResultRepository = require('../../lib/infrastructure/repositories/assessment-result-repository');
const certificationCourseRepository = require('../../lib/infrastructure/repositories/certification-course-repository');
const challengeRepository = require('../../lib/infrastructure/repositories/challenge-repository');
const competenceRepository = require('../../lib/infrastructure/repositories/competence-repository');
const competenceMarkRepository = require('../../lib/infrastructure/repositories/competence-mark-repository');
const courseRepository = require('../../lib/infrastructure/repositories/course-repository');
const skillRepository = require('../../lib/infrastructure/repositories/skill-repository');
const scoringService = require('../../lib/domain/services/scoring/scoring-service');

const recomputeCertificationCoursesV2 = require('./compute-missing-certifv2-scores');

function run() {
  return recomputeCertificationCoursesV2({
    // Repositories
    answerRepository,
    assessmentRepository,
    assessmentResultRepository,
    certificationCourseRepository,
    challengeRepository,
    competenceRepository,
    competenceMarkRepository,
    courseRepository,
    skillRepository,
    // Services
    scoringService,
    // Options
    logger: console,
  });
}

run()
  .then(() => {
    console.log('The script executed successfully');
    process.exit(0);
  })
  .catch((err) =>{
    console.error(err);
    process.exit(1);
  });


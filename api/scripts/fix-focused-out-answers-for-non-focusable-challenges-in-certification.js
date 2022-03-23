'use strict';
require('dotenv').config();
const { knex } = require('../db/knex-database-connection');
const bluebird = require('bluebird');
const _ = require('lodash');
const challengeRepository = require('../lib/infrastructure/repositories/challenge-repository');
const certificationAssessmentRepository = require('../lib/infrastructure/repositories/certification-assessment-repository');
const assessmentResultRepository = require('../lib/infrastructure/repositories/assessment-result-repository');
const competenceMarkRepository = require('../lib/infrastructure/repositories/competence-mark-repository');
const scoringCertificationService = require('../lib/domain/services/scoring/scoring-certification-service');
const certificationCourseRepository = require('../lib/infrastructure/repositories/certification-course-repository');
const handleCertificationRescoring = require('../lib/domain/events/handle-certification-rescoring');
const CertificationJuryDone = require('../lib/domain/events/CertificationJuryDone');
const events = require('../lib/domain/events');
const logger = require('../lib/infrastructure/logger');

async function main() {
  const challenges = await challengeRepository.findOperativeHavingLocale('fr-fr');
  const challengesById = _.groupBy(challenges, 'id');

  logger.info('Retrieving answers');
  const certificationAnswers = await knex('answers')
    .select('answers.id', 'answers.challengeId', 'assessments.certificationCourseId')
    .join('assessments', 'assessments.id', 'answers.assessmentId')
    .join('certification-courses', 'certification-courses.id', 'assessments.certificationCourseId')
    .where('assessments.type', 'CERTIFICATION')
    .where('answers.result', 'focusedOut')
    .where('answers.isFocusedOut', true)
    .whereBetween('certification-courses.createdAt', [
      new Date('2022-03-22T11:56:00Z'),
      new Date('2022-03-22T17:25:00Z'),
    ]);
  logger.info(`${certificationAnswers.length} answers retrieved`);

  await bluebird.mapSeries(certificationAnswers, async function (certificationAnswer) {
    const challenge = challengesById[certificationAnswer.challengeId];
    if (challenge && !challenge.focused) {
      logger.info(`Update answers ${certificationAnswer.id}`);
      await knex('answers').update({ result: 'ok', isFocusedOut: false }).where({ id: certificationAnswer.id });
    }
  });

  const certificationCourses = _.groupBy(certificationAnswers, 'certificationCourseId');
  await bluebird.mapSeries(Object.keys(certificationCourses), async function (certificationCourseId) {
    const certificationJuryDone = new CertificationJuryDone({
      certificationCourseId: parseInt(certificationCourseId),
    });
    logger.info(`Rescore certification course ${certificationCourseId}`);
    const event = await handleCertificationRescoring({
      event: certificationJuryDone,
      assessmentResultRepository,
      certificationAssessmentRepository,
      competenceMarkRepository,
      scoringCertificationService,
      certificationCourseRepository,
    });
    await events.eventDispatcher.dispatch(event);
    logger.info(`Certification course ${certificationCourseId} rescored`);
  });

  logger.info('Done !');
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    }
  );
}

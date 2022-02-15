'use strict';
require('dotenv').config({ path: `${__dirname}/../.env` });
const bluebird = require('bluebird');

const { knex } = require('../db/knex-database-connection');
const logger = require('../lib/infrastructure/logger');

const certificationAssessmentRepository = require('../lib/infrastructure/repositories/certification-assessment-repository');
const usecases = require('../lib/domain/usecases/index');
const events = require('../lib/domain/events');

const extractAnswers = async (lengthyChallengeId, exposure) => {
  const answers = await knex
    .from('answers')
    .select('assessments.certificationCourseId AS certificationCourseId', 'answers.challengeId')
    .innerJoin('assessments', 'assessments.id', 'answers.assessmentId')
    .where('answers.result', '<>', 'ok')
    .where('answers.id', '>', exposure.lastAnswerIdBeforeRegression)
    .where('answers.id', '<', exposure.firstAnswerIdAfterRegression)
    .where('answers.challengeId', '=', lengthyChallengeId);

  if (answers.length === 0) {
    throw new Error('No answers found, ending process');
  }
  logger.info(`${answers.length} answers found`);
  logger.debug(answers);
  return answers;
};

const getServiceUser = async () => {
  const AUTOMATED_DATA_CORRECTION_ACCOUNT_EMAIL = 'service+pix@pix.fr';
  const user = await knex
    .from('users')
    .select('users.id')
    .innerJoin('users_pix_roles', 'users_pix_roles.user_id', 'users.id')
    .innerJoin('pix_roles', 'pix_roles.id', 'users_pix_roles.pix_role_id')
    .where('users.email', '=', AUTOMATED_DATA_CORRECTION_ACCOUNT_EMAIL)
    .where('pix_roles.name', '=', 'PIX_MASTER')
    .first();

  if (!user) {
    throw new Error(`No user ${AUTOMATED_DATA_CORRECTION_ACCOUNT_EMAIL} found, ending process`);
  }
  return user.id;
};

const neutralizeAnswers = async function (answers, userId) {
  logger.info('Neutralization has started');
  await bluebird.mapSeries(answers, async (answer) => {
    const event = await usecases.neutralizeChallenge({
      certificationAssessmentRepository,
      certificationCourseId: answer.certificationCourseId,
      challengeRecId: answer.challengeId,
      juryId: userId,
    });
    await events.eventDispatcher.dispatch(event);
  });
  logger.info('Neutralization has ended');
};

const main = async () => {
  const lengthyChallengeId = 'receQkwO1dvjQc2S3';

  const exposure = {
    lastAnswerIdBeforeRegression: 700064555,
    firstAnswerIdAfterRegression: 701092524,
  };

  const answers = await extractAnswers(lengthyChallengeId, exposure);

  const userId = await getServiceUser();

  if (process.env.PROCEED === 'YES') {
    await neutralizeAnswers(answers, userId);
  }
};

module.exports = { neutralizeAnswers, main };

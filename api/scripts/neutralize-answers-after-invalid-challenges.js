'use strict';
require('dotenv').config({ path: `${__dirname}/../.env` });
const _ = require('lodash');
const bluebird = require('bluebird');

const { knex } = require('../db/knex-database-connection');
const logger = require('../lib/infrastructure/logger');

const challengeRepository = require('../lib/infrastructure/repositories/challenge-repository');
const certificationAssessmentRepository = require('../lib/infrastructure/repositories/certification-assessment-repository');
const usecases = require('../lib/domain/usecases/index');
const events = require('../lib/domain/events');

const extractLengthyChallenges = async () => {
  const challenges = await challengeRepository.findValidated();
  const lengthyChallenges = _.remove(challenges, function (challenge) {
    return challenge.validator.solution.value.length >= 500;
  });

  if (lengthyChallenges.length === 0) {
    throw new Error('No challenges found, ending process');
  }

  logger.info(`${lengthyChallenges.length} challenges found`);
  logger.debug(lengthyChallenges);

  return lengthyChallenges;
};

const extractAnswers = async (lengthyChallenges, exposure) => {
  const answers = await knex
    .from('sessions')
    .select('certification-courses.id AS certificationCourseId', 'answers.challengeId')
    .innerJoin('certification-courses', 'certification-courses.sessionId', 'sessions.id')
    .innerJoin('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .innerJoin('answers', 'answers.assessmentId', 'assessments.id')
    .whereRaw('"certification-courses"."createdAt"::DATE = ?', exposure.date)
    .where('answers.result', '<>', 'ok')
    .whereBetween('answers.createdAt', exposure.window)
    .whereIn('answers.challengeId', lengthyChallenges);

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
  const lengthyChallenges = await extractLengthyChallenges();

  const exposure = {
    date: '2022-02-10',
    window: ['2022-02-10 09:50:00.000000 +00:00', '2022-02-10 18:00:00.000000 +00:00'],
  };

  const answers = await extractAnswers(lengthyChallenges, exposure);

  const userId = await getServiceUser();

  if (process.env.PROCEED === 'YES') {
    await neutralizeAnswers(answers, userId);
  }
};

module.exports = { neutralizeAnswers, main };

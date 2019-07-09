#! /usr/bin/env node
/* eslint no-console: ["off"] */
const _ = require('lodash');
const findKnowledgeElementsToAdd = require('./extract-challenge-with-skills.js');
const { knex } = require('../db/knex-database-connection');
const bluebird = require('bluebird');
const logger = require('../lib/infrastructure/logger');


async function migration() {
  const start = new Date();

  const challengesWithKnowledgeElementsToAdd = await findKnowledgeElementsToAdd();

  const listOfUsers = await _findUsers();
  const result = await bluebird.map(listOfUsers,
    async (userId) => await _createKnowledgeElementsForUser( userId, challengesWithKnowledgeElementsToAdd),
    { concurrency: parseInt(process.env.MIGRATE_CONCURRENCY,10) || 4 });

  console.log(`Migration réussie : ${_.sum(result)} sur ${listOfUsers.length} utilisateurs.`);
  const end = new Date();
  console.log(`Migration en ${_.floor((end-start)/1000, 3)} secondes`);

  process.exit(1);
}

async function _findUsers() {
  const usersId = await knex('users').select('id').where('isProfileV2', false).orderBy('createdAt', 'asc').limit(process.env.MAX_USERS_MIGRATE);
  return _.map(usersId, 'id');
}

async function _createKnowledgeElementsForUser( userId, challengesWithKnowledgeElementsToAdd) {
  const logContext = {
    userId,
    action: 'migrationv1v2',
  };
  logger.trace(logContext, 'Start migration');
  let knowledgeElementsToCreate = [];
  let migrationOk = true;
  await _setProfileV2atTrue(userId);
  const assessmentsId = await _getAssessmentsForUser(userId);
  if(assessmentsId.length>0) {
    const answersForMigration = await _findAnswersForMigration(assessmentsId);
    if (answersForMigration.length > 0) {
      logger.trace(logContext, `Answers migrated : ${_.map(answersForMigration,'id')}.`);
      const knowledgeElementsForEachAnswers = _createKnowledgeElementObjects(answersForMigration, challengesWithKnowledgeElementsToAdd, userId);
      knowledgeElementsToCreate = _.compact(_.uniqBy(_.flatten(knowledgeElementsForEachAnswers), 'skillId'));
      migrationOk = await _createKnowledgeElements({ knowledgeElementsToCreate, logContext });
    }
  }
  if(migrationOk) {
    await _indicatedDateOfMigration(userId);
    logger.trace(logContext, `END FOR USER ${userId} : STATUS : OK, KE : ${knowledgeElementsToCreate.length}.`);
    return 1;
  } else {
    await _setProfileV2atFalse(userId);
    logger.trace(logContext, `END FOR USER ${userId} : STATUS : NOT MIGRATED, KE : ${knowledgeElementsToCreate.length}.`);
    return 0;
  }
}

async function _getAssessmentsForUser(userId) {
  const assessmentsFromDb = await knex.select('id', 'courseId', 'createdAt').from('assessments').where('userId', userId).andWhere('type', 'PLACEMENT').orderBy('createdAt', 'desc');
  const assessmentsGroupedByCourse = _.groupBy(assessmentsFromDb,
    (assessment) => assessment.courseId);
  const lastAssessmentsForEachCourse = _.map(assessmentsGroupedByCourse, _.head);
  return _.map(lastAssessmentsForEachCourse, 'id');
}

async function _findAnswersForMigration( assessmentsId) {
  return knex.select('id', 'result', 'assessmentId', 'createdAt', 'challengeId').from('answers').whereIn('assessmentId', assessmentsId).orderBy('createdAt', 'asc');
}

async function _createKnowledgeElements({ knowledgeElementsToCreate, logContext }) {
  return knex.transaction(function(trx) {
    return trx
      .insert(knowledgeElementsToCreate)
      .into('knowledge-elements');
  }).then(()=> {
    return true;
  }).catch(function(error) {
    logger.trace(logContext, `Error : ${error}.`);
    return false;
  });

}

function _createKnowledgeElementObject(answer, userId, status, skillInformation) {
  return {
    createdAt: answer.createdAt,
    source: skillInformation.source,
    status: status,
    earnedPix: skillInformation.earnedPix,
    answerId: answer.id,
    skillId: skillInformation.skillId,
    assessmentId: answer.assessmentId,
    userId: userId,
    competenceId: skillInformation.competenceId
  };
}

async function _setProfileV2atTrue(userId) {
  return knex('users').where('id', userId).update('isProfileV2', true);
}

async function _setProfileV2atFalse(userId) {
  return knex('users').where('id', userId).update('isProfileV2', false);
}

async function _indicatedDateOfMigration(userId) {
  return knex('users').where('id', userId).update('migratedAt', new Date());
}

function _createKnowledgeElementObjects(answersForMigration, challengesWithKnowledgeElementsToAdd, userId) {
  return _.map(answersForMigration, (answer) => {
    const challengeId = answer.challengeId;
    const status = answer.result === 'ok' ? 'validated' : 'invalidated';
    if(challengesWithKnowledgeElementsToAdd[challengeId]) {
      const listOfSkillsForKnowledgeElements = challengesWithKnowledgeElementsToAdd[challengeId][status];
      return _.map(listOfSkillsForKnowledgeElements, (skillInformation) => _createKnowledgeElementObject(answer, userId, status, skillInformation));
    }
  });
}

migration();

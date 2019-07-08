#! /usr/bin/env node
/* eslint no-console: ["off"] */
const _ = require('lodash');
const findKnowledgeElementsToAdd = require('./extract-challenge-with-skills.js');
const cron = require('node-cron');
const { knex } = require('../db/knex-database-connection');


async function migration() {
  const start = new Date();

  const challengesWithKnowledgeElementsToAdd = await findKnowledgeElementsToAdd();

  const listOfUsers = await _findUsers();
  await Promise.all(_.map(listOfUsers,
    async (userId) => await _createKnowledgeElementsForUser( userId, challengesWithKnowledgeElementsToAdd)));

  console.log(`Migration de ${listOfUsers.length} utilisateurs.`);
  const end = new Date();
  console.log(`Migration en ${Math.floor((end-start) / 1000)} secondes`);
  console.log(`Migration en ${Math.floor((end-start))} millisecondes`);

  process.exit(1);
}

async function _findUsers() {
  const usersId = await knex('users').select('id').where('isprofilv2', false).orderBy('createdAt', 'asc').limit(process.env.MAX_USERS_MIGRATE);
  return _.map(usersId, 'id');
}

async function _createKnowledgeElementsForUser( userId, challengesWithKnowledgeElementsToAdd) {
  console.log('BEGIN FOR USER ' + userId);
  let migrationOk = true;
  const assessmentsId = await _getAssessmentsForUser(userId);
  if(assessmentsId.length>0) {
    const answersForMigration = await _findAnswersForMigration(assessmentsId);
    if (answersForMigration.length > 0) {
      const knowledgeElementsForEachAnswers = _createKnowledgeElementObjects(answersForMigration, challengesWithKnowledgeElementsToAdd, userId);
      const knowledgeElementsToCreate = _.compact(_.uniqBy(_.flatten(knowledgeElementsForEachAnswers), 'skillId'));
      console.log(`Try to add ${knowledgeElementsToCreate.length} knowledge elements for user ${userId}`);
      migrationOk = await _createKnowledgeElements({ knowledgeElementsToCreate, numberOfCurrentAssessment: assessmentsId.length, numberOfCurrentAnswers: answersForMigration.length, userId });
    }
  }
  if(migrationOk) {
    await _indicateMigrationOk(userId);
  }
  console.log(`END FOR USER ${userId} : STATUS : ${migrationOk ? 'OK' : 'NOT MIGRATED'}`);
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

async function _createKnowledgeElements({ knowledgeElementsToCreate, numberOfCurrentAssessment, numberOfCurrentAnswers, userId }) {
  return knex.transaction(function(trx) {
    return trx
      .insert(knowledgeElementsToCreate)
      .into('knowledge-elements')
      .then(async function() {
        const assessments = await _getAssessmentsForUser(userId);
        const answers = await _findAnswersForMigration(assessments);
        if(assessments.length != numberOfCurrentAssessment || answers.length != numberOfCurrentAnswers) {
          throw "User still use v1";
        }
      });
    })
    .then(()=> {
      return true;
    })
    .catch(function(error) {
      console.error(error);
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

async function _indicateMigrationOk( userId) {
  return knex('users').where('id', userId).update('isprofilv2', true);
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

/*cron.schedule(process.env.MIGRATION_CRON_TIME, () => {
  console.log('Starting migration');

  return migration()
    .then((numberOfUsersMigrated) => console.log(`Migrated OK for ${numberOfUsersMigrated} users`))
    .catch(console.log);
});*/

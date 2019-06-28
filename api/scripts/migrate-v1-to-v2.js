#! /usr/bin/env node
/* eslint no-console: ["off"] */
const _ = require('lodash');
const moment = require('moment');
const PgClient = require('./PgClient');
const findKnowledgeElementsToAdd = require('./extract-challenge-with-skills.js');

async function main() {

  const client = _initialize();
  const challengesWithKnowledgeElementsToAdd = await findKnowledgeElementsToAdd();

  const listOfUsers = await _findUser(client);
  const promiseToCreateKnowledgeElements = Promise.all(_.map(listOfUsers,
    (userId) => _createKnowledgeElementsForUser(client, userId, challengesWithKnowledgeElementsToAdd)));

  return promiseToCreateKnowledgeElements
    .then(() => _terminate(client))
    .then(() => process.exit(1));

}

function _initialize() {
  return new PgClient(process.env.DATABASE_URL);
}

function _terminate(client) {
  client.end();
  console.log('END');
}

async function _findUser(client) {
  const usersId = await client.query_and_log(`SELECT id FROM USERS where "isMigratedToV2" = false ORDER BY "createdAt" ASC LIMIT 100;`);
  return _.map(usersId.rows, 'id');
}

async function _createKnowledgeElementsForUser(client, userId, challengesWithKnowledgeElementsToAdd) {
  console.log('BEGIN FOR USER ' + userId);
  const assessmentsId = await _getAssessmentsForUser(client, userId);
  if(assessmentsId.length>0) {
    const answersForMigration = await _findAnswersForMigration(client, assessmentsId);
    if (answersForMigration.length > 0) {
      const knowledgeElementsForEachAnswers = _createKnowledgeElementObjects(answersForMigration, challengesWithKnowledgeElementsToAdd, userId);
      const knowledgeElementsToCreate = _.compact(_.uniqBy(_.flatten(knowledgeElementsForEachAnswers), 'skillId'));
      await _createKnowledgeElements(client, knowledgeElementsToCreate);
    }
  }
  await _indicateMigrationOk(client, userId);

  console.log('END FOR USER ' + userId);
}

async function _getAssessmentsForUser(client, userId) {
  const assessmentsFromDb = await client.query_and_log(`SELECT * FROM ASSESSMENTS WHERE "userId" = ${userId} AND type='PLACEMENT' ORDER BY "createdAt" DESC;`);
  const assessmentsForUser =  assessmentsFromDb.rows;
  const assessmentsGroupedByCourse = _.groupBy(assessmentsForUser,
    (assessment) => assessment.courseId);
  const lastAssessmentsForEachCourse = _.map(assessmentsGroupedByCourse, _.head);
  return _.map(lastAssessmentsForEachCourse, 'id');
}

async function _getAssessmentsV2ForUser(client, userId) {
  const assessmentsFromDb = await client.query_and_log(`SELECT * FROM ASSESSMENTS WHERE "userId" = ${userId} AND type='COMPETENCE_EVALUATION' ORDER BY "createdAt" DESC;`);
  const assessmentsForUser =  assessmentsFromDb.rows;
  return _.map(assessmentsForUser, 'id');
}


async function _findAnswersForMigration(client, assessmentsId) {
  const answersFromDB = await client.query_and_log(`SELECT * FROM ANSWERS WHERE "assessmentId" IN (${assessmentsId.toString()}) ORDER BY "createdAt" ASC;`);
  const answersForMigration = answersFromDB.rows;
  return _.map(answersForMigration, (answer) => _.omit(answer, 'updatedAt', 'timeout', 'elapsedTime', 'resultDetails', 'value'));
}

async function _createKnowledgeElements(client, knowledgeElements) {
  let knowledgeElementsForDB = _.reduce(knowledgeElements, (textForDb, ke) => {
    return textForDb+`('${moment(ke.createdAt).utc()}', '${ke.source}', '${ke.status}', ${ke.earnedPix}, ${ke.answerId}, '${ke.skillId}', ${ke.assessmentId}, ${ke.userId}, '${ke.competenceId}'),`;
  }, '');
  knowledgeElementsForDB = knowledgeElementsForDB.substring(0, knowledgeElementsForDB.length-1);

  await client.query_and_log(`INSERT INTO "knowledge-elements" ("createdAt", "source", "status", "earnedPix", "answerId", "skillId", "assessmentId", "userId", "competenceId") VALUES ${knowledgeElementsForDB};`);
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

async function _indicateMigrationOk(client, userId) {
  return client.query_and_log(`UPDATE USERS SET "isMigratedToV2"=true WHERE id = ${userId}`);
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

if (require.main === module) {
  main();
}

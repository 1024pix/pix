#! /usr/bin/env node
/* eslint no-console: ["off"] */
const _ = require('lodash');
const moment = require('moment');
const PgClient = require('./PgClient');
const findChallengesWithSkills = require('./extract-challenge-with-skills.js');

function initialize() {
  return new PgClient(process.env.DATABASE_URL);
}

function terminate(client) {
  client.end();
  console.log('END');
}

async function main() {

  const client = initialize();
  const challengesWithSkills = await findChallengesWithSkills();

  const listOfUsers = await _findUser(client);
  const promiseToCreateKnowledgeElements = Promise.all(_.map(listOfUsers,
    (userId) => _createKnowledgeElementsForUser(client, userId, challengesWithSkills)));

  return promiseToCreateKnowledgeElements
    .then(() => terminate(client))
    .then(() => process.exit(1));

}

async function _createKnowledgeElementsForUser(client, userId, challengesWithSkills) {
  console.log('BEGIN FOR USER ' + userId);
  const assessmentsId = await _getAssessmentsForUser(client, userId);
  if(assessmentsId.length>0) {
    const answersForMigration = await _findAnswersForMigration(client, assessmentsId);
    if (answersForMigration.length > 0) {
      const knowledgeElementsForEachAnswers = _createKnowledgeElementObjects(answersForMigration, challengesWithSkills, userId);
      const knowledgeElementsToCreate = _.compact(_.flatten(knowledgeElementsForEachAnswers));
      await _createKnowledgeElements(client, knowledgeElementsToCreate);
    }
  }
  console.log('END FOR USER ' + userId);
}

async function _findUser(client) {
  const usersId = await client.query_and_log(`SELECT id FROM USERS LIMIT 10;`);
  return _.map(usersId.rows, 'id');
}

async function _getAssessmentsForUser(client, userId) {
  const assessmentsFromDb = await client.query_and_log(`SELECT * FROM ASSESSMENTS WHERE "userId" = ${userId} AND type='PLACEMENT' ORDER BY "createdAt" DESC;`);
  const assessmentsForUser =  assessmentsFromDb.rows;
  const assessmentsGroupedByCourse = _.groupBy(assessmentsForUser,
    (assessment) => assessment.courseId);
  const lastAssessmentsForEachCourse = _.map(assessmentsGroupedByCourse, _.head);
  return _.map(lastAssessmentsForEachCourse, 'id');
}

async function _findAnswersForMigration(client, assessmentsId) {
  const answersFromDB = await client.query_and_log(`SELECT * FROM ANSWERS WHERE "assessmentId" IN (${assessmentsId.toString()});`);
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


function _createKnowledgeElementObjects(answersForMigration, challengesWithSkills, userId) {
  return _.map(answersForMigration, (answer) => {
    const challengeId = answer.challengeId;
    const status = answer.result === 'ok' ? 'validated' : 'invalidated';
    if(challengesWithSkills[challengeId]) {
      const listOfSkillsForKnowledgeElements = challengesWithSkills[challengeId][status];
      return _.map(listOfSkillsForKnowledgeElements, (skillInformation) => _createKnowledgeElementObject(answer, userId, status, skillInformation));
    }
  });
}

if (require.main === module) {
  main();
}

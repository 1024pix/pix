"use strict";

/*
  Generate JSON for profiles to certify

  Usage examples:

    PROFILE_COUNT=10 DATABASE_URL=postgres://postgres@localhost/pix node api/scripts/generate-all-profiles-to-certify.js > v1.json

    PROFILEV2=1 PROFILE_COUNT=10 DATABASE_URL=postgres://postgres@localhost/pix node api/scripts/generate-all-profiles-to-certify.js > v2.json

  The PROFILEV2 environment variable, when set, triggers use of the V2 path, after conversion
  (see `migrateUser` below) of assessments to knowledge elements. Any previous knowledge elements
  for the user are first deleted.

  The resulting JSON contains objects with the following keys:

    {
      "userId": user id,
      "rawData": userCompetences and challengeIdsCorrectlyAnswered from the first step (_getUserCompetencesAndAnswersVx),
      "profile": userCompetences from the whole process (getProfileToCertify[v2]), including selected challenges
    }
*/
require('dotenv').config();

const _ = require('lodash');
const userService = require('../lib/domain/services/user-service');
const { knex } = require('../db/knex-database-connection');
const BookshelfUser = require('../lib/infrastructure/data/user');
const bluebird = require('bluebird');
const challengeRepository = require('../lib/infrastructure/repositories/challenge-repository');
const competenceRepository = require('../lib/infrastructure/repositories/competence-repository');
const courseRepository = require('../lib/infrastructure/repositories/course-repository');
const skillRepository = require('../lib/infrastructure/repositories/skill-repository');
const assessmentRepository = require('../lib/infrastructure/repositories/assessment-repository');
const answerRepository = require('../lib/infrastructure/repositories/answer-repository');
const knowledgeElementRepository = require('../lib/infrastructure/repositories/knowledge-element-repository');
const KnowledgeElement = require('../lib/domain/models/KnowledgeElement');
const airtable = require('../lib/infrastructure/airtable');


// HACK memoize used reference repositories : they're not going to change for
// the duration of this script, and this is much faster (~6x speedup here) than
// getting the data out of Redis repeatedly.

function makeRefDataFaster() {
  challengeRepository.list = _.memoize(challengeRepository.list);
  competenceRepository.list = _.memoize(competenceRepository.list);
  skillRepository.findByCompetenceId = _.memoize(skillRepository.findByCompetenceId);
  courseRepository.getAdaptiveCourses = _.memoize(courseRepository.getAdaptiveCourses);
  airtable.findRecords = _.memoize(airtable.findRecords);
}

makeRefDataFaster();

function log(msg) {
  process.stderr.write(msg + '\n');
}

async function getCertifiedUserIds() {
  const users = await knex('users')
    .select('id')
    .whereIn('id', knex('certification-courses').select('userId'))
    .whereNotExists(knex.raw(`SELECT 1 FROM answers WHERE
                               "assessmentId" IN (SELECT id FROM assessments WHERE "userId" = users.id)
                               AND "createdAt" <> "updatedAt"`))
    .orderBy('id', 'desc')
    .limit(~~process.env.PROFILE_COUNT || 10);
  return _.map(users, 'id');
}

async function migrateUser({ userId, limitDate, challengesById, adaptiveCourses }) {
  await knex('knowledge-elements').where({ userId }).delete();
  const userLastAssessments = await assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser(userId, limitDate);

  for (const assessment of userLastAssessments) {
    const course = _.find(adaptiveCourses, { id: assessment.courseId });
    const competenceId = course.competences[0];
    const competenceSkills = await skillRepository.findByCompetenceId(competenceId);
    const answers = await answerRepository.findByAssessment(assessment.id);

    for (const answer of answers) {
      const challenge = challengesById.get(answer.challengeId);
      const previousKnowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId });
      const assessedSkills = _.filter(competenceSkills, (skill) => _.find(previousKnowledgeElements, { skillId: skill.id }));

      const knowledgeElementsToCreate = KnowledgeElement.createKnowledgeElementsForAnswer({
        answer,
        challenge,
        previouslyFailedSkills: [],
        previouslyValidatedSkills: assessedSkills,
        targetSkills: competenceSkills,
        userId
      });

      await bluebird.map(knowledgeElementsToCreate, (knowledgeElement) => {
        return knowledgeElementRepository.save(knowledgeElement);
      });
    }
  }
  await knex.raw(`UPDATE "knowledge-elements" SET "createdAt" = answers."createdAt"
                  FROM answers
                  WHERE "knowledge-elements"."answerId" = answers.id
                    AND "knowledge-elements"."userId" = ?`, [ userId ]);
}

// Removes irrelevant data from a UserCompetence
function trimUserCompetence({ id, pixScore, estimatedLevel, challenges }) {
  return { id, pixScore, estimatedLevel, challenges: _.map(challenges, 'id') };
}

async function generateProfileForUser({ userId, limitDate, challengesById, adaptiveCourses }) {
  // log(`Processing user ${userId}`);

  const result = {
    userId
  };

  if (process.env.PROFILEV2) {
    await migrateUser({ userId, limitDate, challengesById, adaptiveCourses });

    if (process.env.DEBUGMIGRATION) {
      result.userLastAssessments = await assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser(userId, limitDate);
      const kes = await knex('knowledge-elements').where({ userId }).orderBy(['createdAt', 'skillId']);
      result.knowledgeElements = _.map(kes, (ke) => _.omit(ke, ['id']));
    }
  }

  const rawData = await userService[`_getUserCompetencesAndAnswersV${process.env.PROFILEV2 ? '2' : '1'}`]
    ({ userId, limitDate });

  result.rawData = { ...rawData, userCompetences: rawData.userCompetences.map(trimUserCompetence) };

  const userCompetences = await userService._pickChallengesForUserCompetences(rawData);

  result.profile = userCompetences.map(trimUserCompetence);

  return result;
}

async function main() {
  const limitDate = new Date('2100-01-01T00:00:00Z');
  const allUserIds = await getCertifiedUserIds();
  log(`Found ${allUserIds.length} certified non-cheating users`);

  const challengesById = new Map((await challengeRepository.list()).map((challenge) => [ challenge.id, challenge ]));
  const adaptiveCourses = await courseRepository.getAdaptiveCourses();

  await bluebird.each(_.chunk(allUserIds, 200), async (userIds) => {
    const results = await bluebird.map(userIds, async (userId) => {
      return generateProfileForUser({ userId, limitDate, challengesById, adaptiveCourses });
    }, { concurrency: ~~process.env.CONCURRENCY || 10 });

    results.forEach((result) => {
      process.stdout.write(JSON.stringify(result) + '\n');
    });
  });
}

// Make sure process.exit() does not cut output short
[process.stdout, process.stderr].forEach((s) => {
  s && s._handle && s._handle.setBlocking &&
    s._handle.setBlocking(true)
});

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  }
);

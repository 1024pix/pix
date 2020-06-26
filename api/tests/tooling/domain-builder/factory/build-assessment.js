const faker = require('faker');
const _ = require('lodash');
const Assessment = require('../../../../lib/domain/models/Assessment');

const buildAnswer = require('./build-answer');
const buildCourse = require('./build-course');
const buildKnowledgeElement = require('./build-knowledge-element');
const buildTargetProfile = require('./build-target-profile');
const buildCampaignParticipation = require('./build-campaign-participation');

function buildAssessment({
  id = faker.random.number(),
  courseId = 'courseId',
  certificationCourseId = null,
  createdAt = new Date('1992-06-12T01:02:03Z'),
  userId = faker.random.number(),
  title = 'courseId',
  type = Assessment.types.CERTIFICATION,
  state = Assessment.states.COMPLETED,
  isImproving = false,
  course = buildCourse({ id: 'courseId' }),
  answers = [buildAnswer()],
  campaignParticipation = null,
  competenceId = null,
} = {}) {
  return new Assessment({
    // attributes
    id,
    courseId,
    certificationCourseId,
    createdAt,
    userId,
    title,
    type,
    state,
    isImproving,
    competenceId,
    // relationships
    answers,
    course,
    campaignParticipation,
  });
}

buildAssessment.ofTypeCampaign = function({
  id = faker.random.number(),

  courseId = 'courseId',
  createdAt = new Date('1992-06-12T01:02:03Z'),
  userId = faker.random.number(),
  competenceId = null,
  state = Assessment.states.COMPLETED,
  isImproving = false,

  answers = [buildAnswer()],
  course = buildCourse({ id: 'courseId' }),
  targetProfile = buildTargetProfile(),
  campaignParticipation = null,
  campaignParticipationId = null,
  title = 'campaignTitle',
} = {}) {
  if (!_.isNil(campaignParticipation) && _.isNil(campaignParticipationId)) {
    campaignParticipationId = campaignParticipation.id;
  }
  if (_.isNil(campaignParticipation) && !_.isNil(campaignParticipationId)) {
    campaignParticipation = buildCampaignParticipation({ id: campaignParticipationId });
  }
  if (_.isNil(campaignParticipation) && _.isNil(campaignParticipationId)) {
    campaignParticipation = buildCampaignParticipation();
    campaignParticipationId = campaignParticipation.id;
  }

  return new Assessment({
    // attributes
    id,
    courseId,
    createdAt,
    userId,
    competenceId,
    title,
    type: Assessment.types.CAMPAIGN,
    state,
    isImproving,
    campaignParticipationId,

    // relationships
    answers,
    course,
    targetProfile,
    campaignParticipation
  });
};

buildAssessment.ofTypeCompetenceEvaluation = function({
  id = faker.random.number(),

  courseId = 'courseId',
  createdAt = new Date('1992-06-12T01:02:03Z'),
  userId = faker.random.number(),
  state = Assessment.states.COMPLETED,
  title = faker.lorem,
  isImproving = false,
  campaignParticipationId = null,

  answers = [buildAnswer()],
  course = buildCourse({ id: 'courseId' }),
  targetProfile = buildTargetProfile(),
  knowledgeElements = [buildKnowledgeElement()],
  campaignParticipation = null,
  competenceId = faker.random.number(),
} = {}) {

  return new Assessment({
    // attributes
    id,
    courseId,
    certificationCourseId: null,
    createdAt,
    userId,
    competenceId,
    campaignParticipationId,
    title,
    type: Assessment.types.COMPETENCE_EVALUATION,
    state,
    isImproving,

    // relationships
    answers,
    course,
    targetProfile,
    knowledgeElements,
    campaignParticipation
  });
};

module.exports = buildAssessment;

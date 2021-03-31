const _ = require('lodash');
const Assessment = require('../../../../lib/domain/models/Assessment');

const buildAnswer = require('./build-answer');
const buildCourse = require('./build-course');
const buildKnowledgeElement = require('./build-knowledge-element');
const buildTargetProfile = require('./build-target-profile');
const buildCampaignParticipation = require('./build-campaign-participation');

function buildAssessment({
  id = 123,
  courseId = 'courseId',
  certificationCourseId = null,
  createdAt = new Date('1992-06-12T01:02:03Z'),
  updatedAt = new Date('1992-06-12T01:02:03Z'),
  userId = 456,
  title = 'courseId',
  type = Assessment.types.CERTIFICATION,
  state = Assessment.states.COMPLETED,
  isImproving = false,
  course = buildCourse({ id: 'courseId' }),
  answers = [buildAnswer()],
  campaignParticipation = null,
  competenceId = null,
  lastQuestionDate = new Date('1992-06-12T01:02:03Z'),
} = {}) {
  return new Assessment({
    // attributes
    id,
    courseId,
    certificationCourseId,
    createdAt,
    updatedAt,
    userId,
    title,
    type,
    state,
    isImproving,
    competenceId,
    lastQuestionDate,
    // relationships
    answers,
    course,
    campaignParticipation,
  });
}

buildAssessment.ofTypeCampaign = function({
  id = 123,
  courseId = 'courseId',
  createdAt = new Date('1992-06-12T01:02:03Z'),
  updatedAt = new Date('1992-06-12T01:02:03Z'),
  userId = 456,
  competenceId = null,
  state = Assessment.states.COMPLETED,
  isImproving = false,
  lastQuestionDate = new Date(),
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
    updatedAt,
    userId,
    competenceId,
    title,
    type: Assessment.types.CAMPAIGN,
    state,
    isImproving,
    campaignParticipationId,
    lastQuestionDate,
    // relationships
    answers,
    course,
    targetProfile,
    campaignParticipation,
  });
};

buildAssessment.ofTypeCompetenceEvaluation = function({
  id = 123,
  courseId = 'courseId',
  createdAt = new Date('1992-06-12T01:02:03Z'),
  updatedAt = new Date('1992-06-12T01:02:03Z'),
  userId = 456,
  state = Assessment.states.COMPLETED,
  title = 'Titre',
  isImproving = false,
  campaignParticipationId = null,
  lastQuestionDate = new Date(),
  answers = [buildAnswer()],
  course = buildCourse({ id: 'courseId' }),
  targetProfile = buildTargetProfile(),
  knowledgeElements = [buildKnowledgeElement()],
  campaignParticipation = null,
  competenceId = 789,
} = {}) {

  return new Assessment({
    // attributes
    id,
    courseId,
    certificationCourseId: null,
    createdAt,
    updatedAt,
    userId,
    competenceId,
    campaignParticipationId,
    title,
    type: Assessment.types.COMPETENCE_EVALUATION,
    state,
    isImproving,
    lastQuestionDate,
    // relationships
    answers,
    course,
    targetProfile,
    knowledgeElements,
    campaignParticipation,
  });
};

module.exports = buildAssessment;

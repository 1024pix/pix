const faker = require('faker');
const Assessment = require('../../../../lib/domain/models/Assessment');
const SmartPlacementAssessment = require('../../../../lib/domain/models/SmartPlacementAssessment');

const buildAnswer = require('./build-answer');
const buildCourse = require('./build-course');
const buildAssessmentResult = require('./build-assessment-result');
const buildKnowledgeElement = require('./build-knowledge-element');
const buildTargetProfile = require('./build-target-profile');
const buildCampaignParticipation = require('./build-campaign-participation');

function buildAssessment({
  id = faker.random.number(),
  courseId = 'courseId',
  createdAt = new Date('1992-06-12T01:02:03Z'),
  completedAt = null,
  userId = faker.random.number(),
  title = 'courseId',
  type = Assessment.types.CERTIFICATION,
  state = Assessment.states.COMPLETED,
  course = buildCourse({ id: 'courseId' }),
  answers = [buildAnswer()],
  assessmentResults = [buildAssessmentResult()],
  campaignParticipation = null,
  competenceId = null,
} = {}) {

  return new Assessment({
    // attributes
    id,
    courseId,
    createdAt,
    completedAt,
    userId,
    title,
    type,
    state,
    competenceId,

    // relationships
    answers,
    assessmentResults,
    course,
    campaignParticipation,
  });
}

buildAssessment.ofTypeSmartPlacement = function({
  id = faker.random.number(),

  courseId = 'courseId',
  createdAt = new Date('1992-06-12T01:02:03Z'),
  userId = faker.random.number(),
  competenceId = null,
  state = Assessment.states.COMPLETED,

  answers = [buildAnswer()],
  assessmentResults = [buildAssessmentResult()],
  course = buildCourse({ id: 'courseId' }),
  targetProfile = buildTargetProfile(),
  knowledgeElements = [buildKnowledgeElement()],
  campaignParticipation = buildCampaignParticipation(),
  title = 'campaignTitle',
} = {}) {
  return new SmartPlacementAssessment({
    // attributes
    id,
    courseId,
    createdAt,
    userId,
    competenceId,
    title,
    type: Assessment.types.SMARTPLACEMENT,
    state,

    // relationships
    answers,
    assessmentResults,
    course,
    targetProfile,
    knowledgeElements,
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

  answers = [buildAnswer()],
  assessmentResults = [buildAssessmentResult()],
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
    createdAt,
    userId,
    competenceId,
    title,
    type: Assessment.types.COMPETENCE_EVALUATION,
    state,

    // relationships
    answers,
    assessmentResults,
    course,
    targetProfile,
    knowledgeElements,
    campaignParticipation
  });
};

module.exports = buildAssessment;

import _ from 'lodash';
import { Assessment } from '../../../../lib/domain/models/Assessment.js';
import { buildAnswer } from './build-answer.js';
import { buildCourse } from './build-course.js';
import { buildKnowledgeElement } from './build-knowledge-element.js';
import { buildTargetProfile } from './build-target-profile.js';
import { buildCampaignParticipation } from './build-campaign-participation.js';

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
  hasOngoingLiveAlert = false,
  course = buildCourse({ id: 'courseId' }),
  answers = [buildAnswer()],
  campaignParticipation = null,
  competenceId = null,
  lastQuestionDate = new Date('1992-06-12T01:02:03Z'),
  lastChallengeId = null,
  lastQuestionState = Assessment.statesOfLastQuestion.ASKED,
  method,
  campaignCode,
  missionId = null,
} = {}) {
  return new Assessment({
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
    hasOngoingLiveAlert,
    competenceId,
    lastQuestionDate,
    lastChallengeId,
    lastQuestionState,
    answers,
    course,
    campaignParticipation,
    method,
    campaignCode,
    missionId,
  });
}

buildAssessment.ofTypeCampaign = function ({
  id = 123,
  courseId = 'courseId',
  createdAt = new Date('1992-06-12T01:02:03Z'),
  updatedAt = new Date('1992-06-12T01:02:03Z'),
  userId = 456,
  competenceId = null,
  state = Assessment.states.COMPLETED,
  isImproving = false,
  lastQuestionDate = new Date(),
  lastChallengeId = null,
  lastQuestionState = Assessment.statesOfLastQuestion.ASKED,
  answers = [buildAnswer()],
  course = buildCourse({ id: 'courseId' }),
  targetProfile = buildTargetProfile(),
  campaignParticipation = null,
  campaignParticipationId = null,
  title = 'campaignTitle',
  method,
  campaignCode,
  missionId,
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
    lastChallengeId,
    lastQuestionState,
    answers,
    course,
    targetProfile,
    campaignParticipation,
    method,
    campaignCode,
    missionId,
  });
};

buildAssessment.ofTypeCompetenceEvaluation = function ({
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
  lastChallengeId = null,
  lastQuestionState = Assessment.statesOfLastQuestion.ASKED,
  answers = [buildAnswer()],
  course = buildCourse({ id: 'courseId' }),
  targetProfile = buildTargetProfile(),
  knowledgeElements = [buildKnowledgeElement()],
  campaignParticipation = null,
  competenceId = 789,
  missionId,
} = {}) {
  return new Assessment({
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
    lastChallengeId,
    lastQuestionState,
    answers,
    course,
    targetProfile,
    knowledgeElements,
    campaignParticipation,
    campaignCode: null,
    missionId,
  });
};

buildAssessment.ofTypeCertification = buildAssessment;

export { buildAssessment };

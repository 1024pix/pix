import _ from 'lodash';
import Assessment from '../../../../lib/domain/models/Assessment';
import buildAnswer from './build-answer';
import buildCourse from './build-course';
import buildKnowledgeElement from './build-knowledge-element';
import buildTargetProfile from './build-target-profile';
import buildCampaignParticipation from './build-campaign-participation';

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
  lastChallengeId = null,
  lastQuestionState = Assessment.statesOfLastQuestion.ASKED,
  method,
  campaignCode,
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
    competenceId,
    lastQuestionDate,
    lastChallengeId,
    lastQuestionState,
    answers,
    course,
    campaignParticipation,
    method,
    campaignCode,
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
  });
};

buildAssessment.ofTypeCertification = buildAssessment;

export default buildAssessment;

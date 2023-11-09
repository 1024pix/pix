import {
  ChallengeNotAskedError,
  CertificationEndedBySupervisorError,
  CertificationEndedByFinalizationError,
  AnswerEvaluationError,
} from '../errors.js';

import { Examiner } from '../models/Examiner.js';
import { KnowledgeElement } from '../models/KnowledgeElement.js';
import { logger } from '../../infrastructure/logger.js';
import { ForbiddenAccess } from '../../../src/shared/domain/errors.js';

const correctAnswerThenUpdateAssessment = async function ({
  answer,
  userId,
  locale,
  answerRepository,
  assessmentRepository,
  areaRepository,
  challengeRepository,
  scorecardService,
  competenceRepository,
  competenceEvaluationRepository,
  skillRepository,
  campaignRepository,
  knowledgeElementRepository,
  flashAssessmentResultRepository,
  certificationChallengeLiveAlertRepository,
  flashAlgorithmService,
  algorithmDataFetcherService,
  examiner,
  dateUtils,
} = {}) {
  const assessment = await assessmentRepository.get(answer.assessmentId);
  if (assessment.userId !== userId) {
    throw new ForbiddenAccess('User is not allowed to add an answer for this assessment.');
  }
  if (assessment.isEndedBySupervisor()) {
    throw new CertificationEndedBySupervisorError();
  }
  if (assessment.hasBeenEndedDueToFinalization()) {
    throw new CertificationEndedByFinalizationError();
  }
  if (assessment.lastChallengeId && assessment.lastChallengeId != answer.challengeId) {
    throw new ChallengeNotAskedError();
  }

  const challenge = await challengeRepository.get(answer.challengeId);

  const onGoingCertificationChallengeLiveAlert =
    await certificationChallengeLiveAlertRepository.getOngoingByChallengeIdAndAssessmentId({
      challengeId: challenge.id,
      assessmentId: assessment.id,
    });

  if (onGoingCertificationChallengeLiveAlert) {
    throw new ForbiddenAccess('An alert has been set.');
  }

  const correctedAnswer = _evaluateAnswer({ challenge, answer, assessment, examiner });
  const now = dateUtils.getNowDate();
  const lastQuestionDate = assessment.lastQuestionDate || now;
  correctedAnswer.setTimeSpentFrom({ now, lastQuestionDate });

  let scorecardBeforeAnswer = null;
  if (correctedAnswer.result.isOK() && assessment.hasKnowledgeElements()) {
    scorecardBeforeAnswer = await scorecardService.computeScorecard({
      userId,
      competenceId: challenge.competenceId,
      areaRepository,
      competenceRepository,
      competenceEvaluationRepository,
      knowledgeElementRepository,
      locale,
    });
  }

  const knowledgeElementsFromAnswer = await _getKnowledgeElements({
    assessment,
    answer: correctedAnswer,
    challenge,
    skillRepository,
    campaignRepository,
    knowledgeElementRepository,
  });

  let answerSaved = await answerRepository.saveWithKnowledgeElements(correctedAnswer, knowledgeElementsFromAnswer);

  if (assessment.hasKnowledgeElements() && knowledgeElementsFromAnswer.length === 0) {
    const context = {
      assessmentId: assessment.id,
      assessmentType: assessment.type,
      answerId: answerSaved.id,
      assessmentImproving: assessment.isImproving,
      challengeId: challenge.id,
      userId,
    };
    logger.warn(context, 'Answer saved without knowledge element');
  }

  answerSaved = await _addLevelUpInformation({
    answerSaved,
    scorecardService,
    userId,
    competenceId: challenge.competenceId,
    areaRepository,
    competenceRepository,
    competenceEvaluationRepository,
    knowledgeElementRepository,
    scorecardBeforeAnswer,
    locale,
  });

  if (assessment.isFlash()) {
    const flashData = await algorithmDataFetcherService.fetchForFlashLevelEstimation({
      assessment,
      answerRepository,
      challengeRepository,
    });

    const { estimatedLevel, errorRate } = flashAlgorithmService.getEstimatedLevelAndErrorRate(flashData);

    await flashAssessmentResultRepository.save({
      answerId: answerSaved.id,
      estimatedLevel,
      errorRate,
      assessmentId: assessment.id,
    });
  }
  return answerSaved;
};

export { correctAnswerThenUpdateAssessment };

function _evaluateAnswer({ challenge, answer, assessment, examiner: injectedExaminer }) {
  const examiner = injectedExaminer ?? new Examiner({ validator: challenge.validator });
  try {
    return examiner.evaluate({
      answer,
      challengeFormat: challenge.format,
      isFocusedChallenge: challenge.focused,
      hasLastQuestionBeenFocusedOut: assessment.hasLastQuestionBeenFocusedOut,
      isCertificationEvaluation: assessment.isCertification(),
    });
  } catch (error) {
    throw new AnswerEvaluationError(challenge);
  }
}

async function _getKnowledgeElements({
  assessment,
  answer,
  challenge,
  skillRepository,
  campaignRepository,
  knowledgeElementRepository,
}) {
  if (!assessment.hasKnowledgeElements()) {
    return [];
  }

  const knowledgeElements = await knowledgeElementRepository.findUniqByUserIdAndAssessmentId({
    userId: assessment.userId,
    assessmentId: assessment.id,
  });
  let targetSkills;
  if (assessment.isCompetenceEvaluation()) {
    targetSkills = await skillRepository.findActiveByCompetenceId(assessment.competenceId);
  }
  if (assessment.isForCampaign()) {
    targetSkills = await campaignRepository.findSkillsByCampaignParticipationId({
      campaignParticipationId: assessment.campaignParticipationId,
    });
  }
  return KnowledgeElement.createKnowledgeElementsForAnswer({
    answer,
    challenge,
    previouslyFailedSkills: _getSkillsFilteredByStatus(
      knowledgeElements,
      targetSkills,
      KnowledgeElement.StatusType.INVALIDATED,
    ),
    previouslyValidatedSkills: _getSkillsFilteredByStatus(
      knowledgeElements,
      targetSkills,
      KnowledgeElement.StatusType.VALIDATED,
    ),
    targetSkills,
    userId: assessment.userId,
  });
}

function _getSkillsFilteredByStatus(knowledgeElements, targetSkills, status) {
  return knowledgeElements
    .filter((knowledgeElement) => knowledgeElement.status === status)
    .map((knowledgeElement) => knowledgeElement.skillId)
    .map((skillId) => targetSkills.find((skill) => skill.id === skillId));
}

async function _addLevelUpInformation({
  answerSaved,
  scorecardService,
  userId,
  competenceId,
  competenceRepository,
  areaRepository,
  competenceEvaluationRepository,
  knowledgeElementRepository,
  scorecardBeforeAnswer,
  locale,
}) {
  answerSaved.levelup = {};

  if (!scorecardBeforeAnswer) {
    return answerSaved;
  }

  const scorecardAfterAnswer = await scorecardService.computeScorecard({
    userId,
    competenceId,
    competenceRepository,
    areaRepository,
    competenceEvaluationRepository,
    knowledgeElementRepository,
    locale,
  });

  if (scorecardBeforeAnswer.level < scorecardAfterAnswer.level) {
    answerSaved.levelup = {
      id: answerSaved.id,
      competenceName: scorecardAfterAnswer.name,
      level: scorecardAfterAnswer.level,
    };
  }
  return answerSaved;
}

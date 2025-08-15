import { AnswerJob } from '../../../quest/domain/models/AnwserJob.js';
import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { ChallengeAlreadyAnsweredError, ForbiddenAccess } from '../../../shared/domain/errors.js';
import { ChallengeNotAskedError } from '../../../shared/domain/errors.js';
import { KnowledgeElement } from '../../../shared/domain/models/KnowledgeElement.js';
import { EmptyAnswerError } from '../errors.js';

import * as injectedCorrectionService from '../services/correction-service.js';
import { repositories as injectedRepositories } from '../../../shared/infrastructure/repositories/index.js';
import * as injectedSkillRepository from '../../../shared/infrastructure/repositories/skill-repository.js';
import * as injectedCompetenceEvaluationRepository from '../../infrastructure/repositories/competence-evaluation-repository.js';
import * as injectedCompetenceRepository from '../../../shared/infrastructure/repositories/competence-repository.js';
import * as injectedScorecardService from '../services/scorecard-service.js';
import * as injectedChallengeRepository from '../../../shared/infrastructure/repositories/challenge-repository.js';
import * as injectedAreaRepository from '../../../shared/infrastructure/repositories/area-repository.js';
import { answerJobRepository as injectedAnswerJobRepository } from '../../infrastructure/repositories/answer-job-repository.js';
import * as injectedAnswerRepository from '../../../shared/infrastructure/repositories/answer-repository.js';

const saveAndCorrectAnswerForCompetenceEvaluation = withTransaction(async function ({
  answer,
  userId,
  assessment,
  locale,
  forceOKAnswer = false,
  answerRepository = injectedAnswerRepository,
  answerJobRepository = injectedAnswerJobRepository,
  areaRepository = injectedAreaRepository,
  challengeRepository = injectedChallengeRepository,
  scorecardService = injectedScorecardService,
  competenceRepository = injectedCompetenceRepository,
  competenceEvaluationRepository = injectedCompetenceEvaluationRepository,
  skillRepository = injectedSkillRepository,
  knowledgeElementRepository = injectedRepositories.knowledgeElementRepository,
  correctionService = injectedCorrectionService,
} = {}) {
  if (assessment.userId !== userId) {
    throw new ForbiddenAccess('User is not allowed to add an answer for this assessment.');
  }
  if (assessment.answers.some((existingAnswer) => existingAnswer.challengeId === answer.challengeId)) {
    throw new ChallengeAlreadyAnsweredError();
  }
  if (assessment.lastChallengeId && assessment.lastChallengeId !== answer.challengeId) {
    throw new ChallengeNotAskedError();
  }
  if (!answer.hasValue && !answer.hasTimedOut) {
    throw new EmptyAnswerError();
  }

  const challenge = await challengeRepository.get(answer.challengeId);
  const correctedAnswer = correctionService.evaluateAnswer({
    challenge,
    answer,
    assessment,
    accessibilityAdjustmentNeeded: false,
    forceOKAnswer,
  });
  const now = new Date();
  const lastQuestionDate = assessment.lastQuestionDate || now;
  correctedAnswer.setTimeSpentFrom({ now, lastQuestionDate });

  const targetSkills = await skillRepository.findActiveByCompetenceId(assessment.competenceId);
  const knowledgeElementsBefore = await knowledgeElementRepository.findUniqByUserId({ userId });
  const answerSaved = await answerRepository.save({ answer: correctedAnswer });
  const knowledgeElementsToAdd = computeKnowledgeElements({
    assessment,
    answer: answerSaved,
    challenge,
    targetSkills,
    knowledgeElementsBefore,
  });
  await knowledgeElementRepository.batchSave({ knowledgeElements: knowledgeElementsToAdd });
  answerSaved.levelup = await computeLevelUpInformation({
    answerSaved,
    userId,
    competenceId: challenge.competenceId,
    locale,
    knowledgeElementsBefore,
    knowledgeElementsAdded: knowledgeElementsToAdd,
    scorecardService,
    areaRepository,
    competenceRepository,
    competenceEvaluationRepository,
  });

  if (userId) {
    await answerJobRepository.performAsync(new AnswerJob({ userId }));
  }

  return answerSaved;
});

function computeKnowledgeElements({ assessment, answer, challenge, targetSkills, knowledgeElementsBefore }) {
  const knowledgeElements = knowledgeElementsBefore.filter(
    (knowledgeElement) => knowledgeElement.assessmentId === assessment.id,
  );
  return KnowledgeElement.createKnowledgeElementsForAnswer({
    answer,
    challenge,
    previouslyFailedSkills: getSkillsFilteredByStatus(
      knowledgeElements,
      targetSkills,
      KnowledgeElement.StatusType.INVALIDATED,
    ),
    previouslyValidatedSkills: getSkillsFilteredByStatus(
      knowledgeElements,
      targetSkills,
      KnowledgeElement.StatusType.VALIDATED,
    ),
    targetSkills,
    userId: assessment.userId,
  });
}

function getSkillsFilteredByStatus(knowledgeElements, targetSkills, status) {
  return knowledgeElements
    .filter((knowledgeElement) => knowledgeElement.status === status)
    .map((knowledgeElement) => knowledgeElement.skillId)
    .map((skillId) => targetSkills.find((skill) => skill.id === skillId));
}

async function computeLevelUpInformation({
  answerSaved,
  userId,
  competenceId,
  locale,
  knowledgeElementsBefore,
  knowledgeElementsAdded,
  scorecardService,
  areaRepository,
  competenceRepository,
  competenceEvaluationRepository,
}) {
  if (!answerSaved.result.isOK()) {
    return {};
  }
  const competence = await competenceRepository.get({ id: competenceId, locale });
  const area = await areaRepository.get({ id: competence.areaId, locale });
  const competenceEvaluations = await competenceEvaluationRepository.findByUserId(userId);
  const competenceEvaluationForCompetence = competenceEvaluations.find(
    (competenceEval) => competenceEval.competenceId === competenceId,
  );
  const knowledgeElementsForCompetenceBefore = knowledgeElementsBefore.filter(
    (knowledgeElement) => knowledgeElement.competenceId === competenceId,
  );
  const knowledgeElementsAddedForCompetence = knowledgeElementsAdded.filter(
    (knowledgeElement) => knowledgeElement.competenceId === competenceId,
  );
  const knowledgeElementsForCompetenceAfter = [
    ...knowledgeElementsAddedForCompetence,
    ...knowledgeElementsForCompetenceBefore,
  ];
  const uniqKnowledgeElementsForCompetenceAfter = knowledgeElementsForCompetenceAfter.filter(
    (ke, index) => knowledgeElementsForCompetenceAfter.findIndex(({ skillId }) => skillId === ke.skillId) === index,
  );
  return scorecardService.computeLevelUpInformation({
    answer: answerSaved,
    userId,
    area,
    competence,
    competenceEvaluationForCompetence,
    knowledgeElementsForCompetenceBefore,
    knowledgeElementsForCompetenceAfter: uniqKnowledgeElementsForCompetenceAfter,
  });
}

export { saveAndCorrectAnswerForCompetenceEvaluation };

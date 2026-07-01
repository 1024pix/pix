import { AnswerJob } from '../../../quest/domain/models/quests/events/AnwserJob.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { ChallengeAlreadyAnsweredError, EmptyAnswerError, ForbiddenAccess } from '../../../shared/domain/errors.js';
import { ChallengeNotAskedError } from '../../../shared/domain/errors.js';
import { KnowledgeElement } from '../../../shared/domain/models/KnowledgeElement.js';

export async function saveAndCorrectAnswerForCompetenceEvaluation({
  answer,
  userId,
  assessment,
  locale,
  forceOKAnswer = false,
  answerRepository,
  answerJobRepository,
  areaRepository,
  challengeRepository,
  scorecardService,
  competenceRepository,
  competenceEvaluationRepository,
  skillRepository,
  knowledgeElementRepository,
  correctionService,
}) {
  if (assessment.userId !== userId) {
    throw new ForbiddenAccess('User is not allowed to add an answer for this assessment.');
  }
  if (assessment.answers.some((existingAnswer) => existingAnswer.challengeId === answer.challengeId)) {
    throw new ChallengeAlreadyAnsweredError();
  }
  if (assessment.lastChallengeId && assessment.lastChallengeId !== answer.challengeId) {
    throw new ChallengeNotAskedError();
  }
  if (answer.isEmpty) {
    throw new EmptyAnswerError();
  }

  const challenge = await challengeRepository.get(answer.challengeId);
  const correctedAnswer = correctionService.evaluateAnswer({
    challenge,
    answer,
    challengeSubmittedAt: assessment.lastQuestionDate,
    hasChallengeBeenFocusedOut: assessment.hasLastQuestionBeenFocusedOut,
    isCertificationEvaluation: false,
    accessibilityAdjustmentNeeded: false,
    forceOKAnswer,
  });

  const targetSkills = await skillRepository.findActiveByCompetenceId(assessment.competenceId);
  const knowledgeElementsBefore = await knowledgeElementRepository.findUniqByUserId({ userId });
  const savedAnswer = await DomainTransaction.execute(async () => {
    const answerToBeSaved = await answerRepository.save({ answer: correctedAnswer });
    const knowledgeElementsToAdd = computeKnowledgeElements({
      assessment,
      answer: answerToBeSaved,
      challenge,
      targetSkills,
      knowledgeElementsBefore,
    });
    await knowledgeElementRepository.batchSave({ knowledgeElements: knowledgeElementsToAdd });
    answerToBeSaved.levelup = await computeLevelUpInformation({
      answerSaved: answerToBeSaved,
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
    return answerToBeSaved;
  });

  if (userId) {
    await answerJobRepository.performAsync(new AnswerJob({ userId }));
  }

  return savedAnswer;
}

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

import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { ChallengeAlreadyAnsweredError, EmptyAnswerError, ForbiddenAccess } from '../../../shared/domain/errors.js';
import { ChallengeNotAskedError } from '../../../shared/domain/errors.js';
import { tubeIdOf } from '../../../shared/domain/models/KnowledgeState.js';
import { AssessmentAlreadyEndedError } from '../errors.js';

export async function saveAndCorrectAnswerForCompetenceEvaluation({
  answer,
  userId,
  assessment,
  locale,
  forceOKAnswer = false,
  answerRepository,
  areaRepository,
  challengeRepository,
  scorecardService,
  competenceRepository,
  competenceEvaluationRepository,
  skillRepository,
  knowledgeStateRepository,
  correctionService,
}) {
  if (assessment.userId !== userId) {
    throw new ForbiddenAccess('User is not allowed to add an answer for this assessment.');
  }
  if (!assessment.isStarted()) {
    throw new AssessmentAlreadyEndedError();
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
  const knowledgeStateBefore = await knowledgeStateRepository.findByUserId({ userId });
  const savedAnswer = await DomainTransaction.execute(async () => {
    const answerToBeSaved = await answerRepository.save({ answer: correctedAnswer });
    // Une réponse ne fait bouger qu'une ligne : le tube de l'acquis posé.
    const { knowledgeState, touchedTubeIds } = stateWithAnswer({
      knowledgeStateBefore,
      challenge,
      targetSkills,
      answer: answerToBeSaved,
    });
    if (touchedTubeIds.length > 0) {
      await knowledgeStateRepository.save({ userId, knowledgeState, tubeIds: touchedTubeIds });
    }
    answerToBeSaved.levelup = await computeLevelUpInformation({
      answerSaved: answerToBeSaved,
      userId,
      competenceId: challenge.competenceId,
      locale,
      knowledgeStateBefore,
      knowledgeStateAfter: knowledgeState,
      scorecardService,
      areaRepository,
      competenceRepository,
      competenceEvaluationRepository,
    });
    return answerToBeSaved;
  });

  return savedAnswer;
}

function stateWithAnswer({ knowledgeStateBefore, challenge, targetSkills, answer }) {
  const answeredSkill = targetSkills.find((skill) => skill.id === challenge.skill.id);
  if (!answeredSkill) {
    return { knowledgeState: knowledgeStateBefore, touchedTubeIds: [] };
  }

  const tubeSkills = targetSkills.filter((skill) => tubeIdOf(skill) === tubeIdOf(answeredSkill));
  return {
    knowledgeState: knowledgeStateBefore.withAnswer({
      skill: answeredSkill,
      isOk: answer.result.isOK(),
      tubeSkills,
    }),
    touchedTubeIds: [tubeIdOf(answeredSkill)],
  };
}

async function computeLevelUpInformation({
  answerSaved,
  userId,
  competenceId,
  locale,
  knowledgeStateBefore,
  knowledgeStateAfter,
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
  return scorecardService.computeLevelUpInformation({
    answer: answerSaved,
    userId,
    area,
    competence,
    competenceEvaluationForCompetence,
    knowledgeStateForCompetenceBefore: knowledgeStateBefore.restrictedToCompetence(competenceId),
    knowledgeStateForCompetenceAfter: knowledgeStateAfter.restrictedToCompetence(competenceId),
  });
}

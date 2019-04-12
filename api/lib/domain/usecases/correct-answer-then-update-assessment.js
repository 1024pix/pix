const { ChallengeAlreadyAnsweredError } = require('../errors');
const Examiner = require('../models/Examiner');
const KnowledgeElement = require('../models/SmartPlacementKnowledgeElement');

module.exports = async function correctAnswerThenUpdateAssessment(
  {
    answer,
    answerRepository,
    assessmentRepository,
    challengeRepository,
    competenceEvaluationRepository,
    skillRepository,
    smartPlacementAssessmentRepository,
    smartPlacementKnowledgeElementRepository,
  } = {}) {

  const answersFind = await answerRepository.findByChallengeAndAssessment({
    assessmentId: answer.assessmentId,
    challengeId: answer.challengeId,
  });
  if (answersFind) {
    throw new ChallengeAlreadyAnsweredError();
  }

  const challenge = await challengeRepository.get(answer.challengeId);
  const correctedAnswer = evaluateAnswer(challenge, answer);

  const answerSaved = await answerRepository.save(correctedAnswer);

  const assessment = await assessmentRepository.get(answer.assessmentId);
  if (assessment.isCompetenceEvaluation()) {
    await saveKnowledgeElementsForCompetenceEvaluation({
      assessment,
      answer: answerSaved,
      challenge,
      competenceEvaluationRepository,
      skillRepository,
      smartPlacementKnowledgeElementRepository
    });
  }

  if (assessment.isSmartPlacement()) {
    await saveKnowledgeElementsForSmartPlacement({
      answer: answerSaved,
      challenge,
      smartPlacementAssessmentRepository,
      smartPlacementKnowledgeElementRepository,
    });
  }

  return answerSaved;
};

function evaluateAnswer(challenge, answer) {
  const examiner = new Examiner({ validator: challenge.validator });
  return examiner.evaluate(answer);
}

async function saveKnowledgeElementsForSmartPlacement({ answer, challenge, smartPlacementAssessmentRepository, smartPlacementKnowledgeElementRepository }) {

  const smartPlacementAssessment = await smartPlacementAssessmentRepository.get(answer.assessmentId);

  return saveKnowledgeElements({
    userId: smartPlacementAssessment.userId,
    targetSkills: smartPlacementAssessment.targetProfile.skills,
    knowledgeElements: smartPlacementAssessment.knowledgeElements,
    answer,
    challenge,
    smartPlacementKnowledgeElementRepository,
  });
}

async function saveKnowledgeElementsForCompetenceEvaluation({ assessment, answer, challenge, competenceEvaluationRepository, skillRepository, smartPlacementKnowledgeElementRepository }) {

  const competenceEvaluation = await competenceEvaluationRepository.getByAssessmentId(assessment.id);
  const [targetSkills, knowledgeElements] = await Promise.all([
    skillRepository.findByCompetenceId(competenceEvaluation.competenceId),
    smartPlacementKnowledgeElementRepository.findUniqByUserId(assessment.userId)]
  );

  return saveKnowledgeElements({
    userId: assessment.userId,
    targetSkills,
    knowledgeElements,
    answer,
    challenge,
    smartPlacementKnowledgeElementRepository,
  });
}

function saveKnowledgeElements({ userId, targetSkills, knowledgeElements, answer, challenge, smartPlacementKnowledgeElementRepository }) {

  const knowledgeElementsToCreate = KnowledgeElement.createKnowledgeElementsForAnswer({
    answer,
    challenge,
    previouslyFailedSkills: _getSkillsFilteredByStatus(knowledgeElements, targetSkills, KnowledgeElement.StatusType.INVALIDATED),
    previouslyValidatedSkills: _getSkillsFilteredByStatus(knowledgeElements, targetSkills, KnowledgeElement.StatusType.VALIDATED),
    targetSkills,
    userId
  });

  return knowledgeElementsToCreate.map((knowledgeElement) =>
    smartPlacementKnowledgeElementRepository.save(knowledgeElement));
}

function _getSkillsFilteredByStatus(knowledgeElements, targetSkills, status) {
  return knowledgeElements
    .filter((knowledgeElement) => knowledgeElement.status === status)
    .map((knowledgeElement) => knowledgeElement.skillId)
    .map((skillId) => targetSkills.find((skill) => skill.id === skillId));
}

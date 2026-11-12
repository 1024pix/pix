import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { ChallengeAlreadyAnsweredError, EmptyAnswerError, ForbiddenAccess } from '../../../shared/domain/errors.js';
import { ChallengeNotAskedError } from '../../../shared/domain/errors.js';
import { KnowledgeElement } from '../../../shared/domain/models/KnowledgeElement.js';
import { AssessmentAlreadyEndedError } from '../errors.js';

export async function saveAndCorrectAnswerForCampaign({
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
  knowledgeElementForParticipationService,
  correctionService,
  campaignRepository,
}) {
  if (assessment.userId !== userId) {
    throw new ForbiddenAccess('User is not allowed to add an answer for this assessment.');
  }
  if (!assessment.isStarted()) {
    throw new AssessmentAlreadyEndedError();
  }
  if (!assessment.isCampaignParticipationAvailable() || !assessment?.campaign.isAccessible) {
    throw new ForbiddenAccess('Campaign does not accept any answer.');
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

  let savedAnswer;
  if (assessment.isSmartRandom()) {
    const knowledgeElementsBefore =
      await knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId({
        userId,
        campaignParticipationId: assessment.campaignParticipationId,
      });

    const targetSkills = await campaignRepository.findSkillsByCampaignParticipationId({
      campaignParticipationId: assessment.campaignParticipationId,
    });
    const campaignId = await campaignRepository.getCampaignIdByCampaignParticipationId(
      assessment.campaignParticipationId,
    );
    const campaign = await campaignRepository.get(campaignId);
    savedAnswer = await DomainTransaction.execute(async () => {
      const answerToBeSaved = await answerRepository.save({ answer: correctedAnswer });
      const knowledgeElementsToAdd = computeKnowledgeElements({
        campaign,
        assessment,
        answer: answerToBeSaved,
        challenge,
        targetSkills,
        knowledgeElementsBefore,
      });
      await knowledgeElementForParticipationService.save({
        knowledgeElements: knowledgeElementsToAdd,
        campaignParticipationId: assessment.campaignParticipationId,
      });
      answerToBeSaved.levelup = {};
      if (!campaign.isExam) {
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
      }
      return answerToBeSaved;
    });
  }

  return savedAnswer;
}

function computeKnowledgeElements({ campaign, assessment, answer, challenge, targetSkills, knowledgeElementsBefore }) {
  let knowledgeElements;

  if (campaign.isExam) {
    knowledgeElements = knowledgeElementsBefore;
  } else {
    knowledgeElements = knowledgeElementsBefore.filter(
      (knowledgeElement) => knowledgeElement.assessmentId === assessment.id,
    );
  }

  const targetSkillsById = new Map(targetSkills.map((skill) => [skill.id, skill]));

  return KnowledgeElement.createKnowledgeElementsForAnswer({
    answer,
    challenge,
    previouslyFailedSkills: getSkillsFilteredByStatus(
      knowledgeElements,
      targetSkillsById,
      KnowledgeElement.StatusType.INVALIDATED,
    ),
    previouslyValidatedSkills: getSkillsFilteredByStatus(
      knowledgeElements,
      targetSkillsById,
      KnowledgeElement.StatusType.VALIDATED,
    ),
    targetSkills,
    userId: assessment.userId,
  });
}

function getSkillsFilteredByStatus(knowledgeElements, targetSkillsById, status) {
  return knowledgeElements
    .filter((knowledgeElement) => knowledgeElement.status === status)
    .map((knowledgeElement) => targetSkillsById.get(knowledgeElement.skillId));
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
  const knowledgeElementsBySkillId = Map.groupBy(knowledgeElementsForCompetenceAfter, ({ skillId }) => skillId);
  const uniqKnowledgeElementsForCompetenceAfter = [...knowledgeElementsBySkillId.values()].map(
    ([firstKnowledgeElement]) => firstKnowledgeElement,
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

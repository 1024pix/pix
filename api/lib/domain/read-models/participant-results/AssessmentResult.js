import { BadgeResult } from './BadgeResult.js';
import { CompetenceResult } from './CompetenceResult.js';
import {
  MAX_MASTERY_RATE,
  MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING,
  MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING,
} from '../../constants.js';
import dayjs from 'dayjs';
import { getNewAcquiredStages } from '../../../../src/evaluation/domain/services/stages/get-new-acquired-stages-service.js';

class AssessmentResult {
  constructor({
    participationResults,
    isCampaignMultipleSendings,
    isOrganizationLearnerActive,
    isTargetProfileResetAllowed,
    isCampaignArchived,
    competences,
    reachedStage,
    badgeResultsDTO,
    stages,
    flashScoringResults,
  }) {
    const { knowledgeElements, sharedAt, assessmentCreatedAt } = participationResults;

    this.id = participationResults.campaignParticipationId;
    this.isCompleted = participationResults.isCompleted;
    this.isShared = Boolean(participationResults.sharedAt);
    this.participantExternalId = participationResults.participantExternalId;
    this.totalSkillsCount = competences.flatMap(({ targetedSkillIds }) => targetedSkillIds).length;
    this.testedSkillsCount = knowledgeElements.length;
    this.validatedSkillsCount = knowledgeElements.filter(({ isValidated }) => isValidated).length;
    this.masteryRate = this._computeMasteryRate(
      participationResults.masteryRate,
      this.isShared,
      this.totalSkillsCount,
      this.validatedSkillsCount,
    );

    this.competenceResults = competences.map(({ competence, area, targetedSkillIds }) => {
      const competenceKnowledgeElements = knowledgeElements.filter(({ skillId }) => targetedSkillIds.includes(skillId));
      const validatedSkillsCountForCompetence = competenceKnowledgeElements.filter(
        ({ isValidated }) => isValidated,
      ).length;
      const masteryPercentage = Math.round((validatedSkillsCountForCompetence / targetedSkillIds.length) * 100);
      let reachedStage;
      if (stages && stages.length > 0) {
        const acquiredStages = getNewAcquiredStages(stages, validatedSkillsCountForCompetence, masteryPercentage);
        reachedStage = acquiredStages.length;
      }

      return _buildCompetenceResult({
        competence,
        area,
        targetedSkillIds,
        competenceKnowledgeElements,
        reachedStage,
        masteryPercentage,
      });
    });

    this.badgeResults = badgeResultsDTO.map((badge) => new BadgeResult(badge, participationResults.acquiredBadgeIds));
    this.reachedStage = reachedStage;
    this.canImprove = this._computeCanImprove(knowledgeElements, assessmentCreatedAt, this.isShared);
    this.isDisabled = this._computeIsDisabled(isCampaignArchived, participationResults.isDeleted);
    this.canRetry = this._computeCanRetry(
      isCampaignMultipleSendings,
      sharedAt,
      isOrganizationLearnerActive,
      this.masteryRate,
      this.isDisabled,
    );
    this.canReset = this._computeCanReset({
      isTargetProfileResetAllowed,
      isCampaignMultipleSendings,
      isOrganizationLearnerActive,
      isDisabled: this.isDisabled,
      sharedAt,
    });

    if (flashScoringResults) {
      this.estimatedFlashLevel = flashScoringResults.estimatedLevel;
      this.flashPixScore = flashScoringResults.pixScore;
      this.competenceResults = flashScoringResults.competencesWithPixScore.map(
        ({ competence, area, pixScore }) =>
          new CompetenceResult({
            competence,
            area,
            totalSkillsCount: competence.skillIds.length,
            knowledgeElements: [],
            flashPixScore: pixScore,
          }),
      );
    }
  }

  _computeMasteryRate(masteryRate, isShared, totalSkillsCount, validatedSkillsCount) {
    if (isShared) {
      return masteryRate;
    } else if (totalSkillsCount > 0) {
      const rate = (validatedSkillsCount / totalSkillsCount).toPrecision(2);
      return parseFloat(rate);
    } else {
      return 0;
    }
  }

  _computeCanImprove(knowledgeElements, assessmentCreatedAt, isShared) {
    const isImprovementPossible =
      knowledgeElements.filter((knowledgeElement) => {
        const isOldEnoughToBeImproved =
          dayjs(assessmentCreatedAt).diff(knowledgeElement.createdAt, 'days', true) >=
          MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING;
        return knowledgeElement.isInvalidated && isOldEnoughToBeImproved;
      }).length > 0;
    return isImprovementPossible && !isShared;
  }

  _computeCanRetry(isCampaignMultipleSendings, sharedAt, isOrganizationLearnerActive, masteryRate, isDisabled) {
    return (
      isCampaignMultipleSendings &&
      this._timeBeforeRetryingPassed(sharedAt) &&
      masteryRate < MAX_MASTERY_RATE &&
      isOrganizationLearnerActive &&
      !isDisabled
    );
  }

  _computeCanReset({
    isTargetProfileResetAllowed,
    isOrganizationLearnerActive,
    isCampaignMultipleSendings,
    isDisabled,
    sharedAt,
  }) {
    return (
      isTargetProfileResetAllowed &&
      isOrganizationLearnerActive &&
      isCampaignMultipleSendings &&
      !isDisabled &&
      this._timeBeforeRetryingPassed(sharedAt)
    );
  }

  _computeIsDisabled(isCampaignArchived, isParticipationDeleted) {
    return isCampaignArchived || isParticipationDeleted;
  }

  _timeBeforeRetryingPassed(sharedAt) {
    const isShared = Boolean(sharedAt);
    if (!isShared) return false;
    return sharedAt && dayjs().diff(sharedAt, 'days', true) >= MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING;
  }
}

function _buildCompetenceResult({
  competence,
  area,
  targetedSkillIds,
  competenceKnowledgeElements,
  reachedStage,
  masteryPercentage,
}) {
  return new CompetenceResult({
    competence,
    area,
    totalSkillsCount: targetedSkillIds.length,
    knowledgeElements: competenceKnowledgeElements,
    reachedStage,
    masteryPercentage,
  });
}

export { AssessmentResult };

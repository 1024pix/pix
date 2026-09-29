import { CampaignParticipationStatuses, CampaignTypes, MaxMasteryRate } from '../../../shared/domain/constants.ts';
import { getNewAcquiredStages } from '../../../stages/domain/services/get-new-acquired-stages-service.js';
import { BadgeResult } from './BadgeResult.js';
import { CompetenceResult } from './CompetenceResult.js';

class AssessmentResult {
  constructor({
    participationResults,
    isCampaignMultipleSendings,
    isOrganizationLearnerActive,
    isTargetProfileResetAllowed,
    isCampaignArchived,
    isCampaignDeleted,
    campaignType,
    competences,
    reachedStage,
    badgeResultsDTO,
    stages,
  }) {
    const { assessedSkillIds, validatedSkillIds, sharedAt } = participationResults;

    this.id = participationResults.campaignParticipationId;
    this.isCompleted = participationResults.isCompleted;
    this.isShared = participationResults.status === CampaignParticipationStatuses.SHARED;
    this.participantExternalId = participationResults.participantExternalId;
    this.totalSkillsCount = competences.flatMap(({ targetedSkillIds }) => targetedSkillIds).length;
    this.testedSkillsCount = assessedSkillIds.length;
    this.validatedSkillsCount = validatedSkillIds.length;
    this.masteryRate = this._computeMasteryRate(this.totalSkillsCount, this.validatedSkillsCount);

    this.competenceResults = competences.map(({ competence, area, targetedSkillIds }) => {
      const testedSkillsCountForCompetence = assessedSkillIds.filter((skillId) =>
        targetedSkillIds.includes(skillId),
      ).length;
      const validatedSkillsCountForCompetence = validatedSkillIds.filter((skillId) =>
        targetedSkillIds.includes(skillId),
      ).length;
      const masteryPercentage = Math.round((validatedSkillsCountForCompetence / targetedSkillIds.length) * 100);
      let reachedStage;
      if (stages && stages.length > 0) {
        const acquiredStages = getNewAcquiredStages(stages, validatedSkillsCountForCompetence, masteryPercentage);
        reachedStage = acquiredStages.length;
      }

      return new CompetenceResult({
        competence,
        area,
        totalSkillsCount: targetedSkillIds.length,
        testedSkillsCount: testedSkillsCountForCompetence,
        validatedSkillsCount: validatedSkillsCountForCompetence,
        reachedStage,
        masteryPercentage,
      });
    });

    this.badgeResults = badgeResultsDTO.map((badge) => new BadgeResult(badge, participationResults.acquiredBadgeIds));
    this.reachedStage = reachedStage;
    this.isDisabled = this._computeIsDisabled(isCampaignArchived, isCampaignDeleted, participationResults.isDeleted);
    this.canRetry = this.#computeCanRetry({
      isCampaignMultipleSendings,
      isOrganizationLearnerActive,
      campaignType,
    });
    this.canReset = this._computeCanReset({
      isTargetProfileResetAllowed,
      isCampaignMultipleSendings,
      isOrganizationLearnerActive,
      isDisabled: this.isDisabled,
      isShared: this.isShared,
      campaignType,
    });
    this.sharedAt = sharedAt;
  }

  _computeMasteryRate(totalSkillsCount, validatedSkillsCount) {
    if (totalSkillsCount > 0) {
      const rate = (validatedSkillsCount / totalSkillsCount).toPrecision(2);
      return parseFloat(rate);
    } else {
      return 0;
    }
  }

  #computeCanRetry({ isCampaignMultipleSendings, isOrganizationLearnerActive, campaignType }) {
    return (
      isOrganizationLearnerActive &&
      !this.isDisabled &&
      isCampaignMultipleSendings &&
      this.isShared &&
      (this.masteryRate < MaxMasteryRate.MAX_MASTERY_RATE || campaignType === CampaignTypes.EXAM)
    );
  }

  _computeCanReset({
    campaignType,
    isTargetProfileResetAllowed,
    isOrganizationLearnerActive,
    isCampaignMultipleSendings,
    isDisabled,
    isShared,
  }) {
    if (campaignType !== CampaignTypes.ASSESSMENT) {
      return false;
    }

    return (
      isShared &&
      isTargetProfileResetAllowed &&
      isOrganizationLearnerActive &&
      isCampaignMultipleSendings &&
      !isDisabled
    );
  }

  _computeIsDisabled(isCampaignArchived, isCampaignDeleted, isParticipationDeleted) {
    return isCampaignArchived || isCampaignDeleted || isParticipationDeleted;
  }
}

export { AssessmentResult };

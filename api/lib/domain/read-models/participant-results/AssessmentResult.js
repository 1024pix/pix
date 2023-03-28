const BadgeResult = require('./BadgeResult.js');
const CompetenceResult = require('./CompetenceResult.js');
const constants = require('../../constants.js');
const moment = require('moment');

class AssessmentResult {
  constructor({
    participationResults,
    isCampaignMultipleSendings,
    isOrganizationLearnerActive,
    isCampaignArchived,
    competences,
    badgeResultsDTO,
    stageCollection,
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
      this.validatedSkillsCount
    );

    this.competenceResults = competences.map(({ competence, area, targetedSkillIds }) => {
      const competenceKnowledgeElements = knowledgeElements.filter(({ skillId }) => targetedSkillIds.includes(skillId));
      let reachedStage;

      if (stageCollection.totalStages > 0) {
        const validatedSkillsCountForCompetence = knowledgeElements.filter(({ isValidated }) => isValidated).length;

        reachedStage = stageCollection.getReachedStageIndex(validatedSkillsCountForCompetence, this.masteryRate * 100);
      }

      return _buildCompetenceResult({
        competence,
        area,
        targetedSkillIds,
        competenceKnowledgeElements,
        reachedStage,
      });
    });

    this.badgeResults = badgeResultsDTO.map((badge) => new BadgeResult(badge, participationResults));

    if (stageCollection.totalStages > 0) {
      this.reachedStage = stageCollection.getReachedStage(this.validatedSkillsCount, this.masteryRate * 100);
    }
    this.canImprove = this._computeCanImprove(knowledgeElements, assessmentCreatedAt, this.isShared);
    this.isDisabled = this._computeIsDisabled(isCampaignArchived, participationResults.isDeleted);
    this.canRetry = this._computeCanRetry(
      isCampaignMultipleSendings,
      sharedAt,
      isOrganizationLearnerActive,
      this.masteryRate,
      this.isDisabled
    );

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
          })
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
          moment(assessmentCreatedAt).diff(knowledgeElement.createdAt, 'days', true) >=
          constants.MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING;
        return knowledgeElement.isInvalidated && isOldEnoughToBeImproved;
      }).length > 0;
    return isImprovementPossible && !isShared;
  }

  _computeCanRetry(isCampaignMultipleSendings, sharedAt, isOrganizationLearnerActive, masteryRate, isDisabled) {
    return (
      isCampaignMultipleSendings &&
      this._timeBeforeRetryingPassed(sharedAt) &&
      masteryRate < constants.MAX_MASTERY_RATE &&
      isOrganizationLearnerActive &&
      !isDisabled
    );
  }

  _computeIsDisabled(isCampaignArchived, isParticipationDeleted) {
    return isCampaignArchived || isParticipationDeleted;
  }

  _timeBeforeRetryingPassed(sharedAt) {
    const isShared = Boolean(sharedAt);
    if (!isShared) return false;
    return sharedAt && moment().diff(sharedAt, 'days', true) >= constants.MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING;
  }
}

function _buildCompetenceResult({ competence, area, targetedSkillIds, competenceKnowledgeElements, reachedStage }) {
  return new CompetenceResult({
    competence,
    area,
    totalSkillsCount: targetedSkillIds.length,
    knowledgeElements: competenceKnowledgeElements,
    reachedStage,
  });
}

module.exports = AssessmentResult;

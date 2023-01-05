const BadgeResult = require('./BadgeResult');
const ReachedStage = require('./ReachedStage');
const CompetenceResult = require('./CompetenceResult');
const constants = require('../../constants');
const moment = require('moment');

class AssessmentResult {
  constructor({
    participationResults,
    isCampaignMultipleSendings,
    isOrganizationLearnerActive,
    isCampaignArchived,
    competences,
    badgeResultsDTO,
    stages,
  }) {
    const { knowledgeElements, sharedAt, assessmentCreatedAt } = participationResults;

    this.id = participationResults.campaignParticipationId;
    this.isCompleted = participationResults.isCompleted;
    this.isShared = Boolean(participationResults.sharedAt);
    this.participantExternalId = participationResults.participantExternalId;
    this.estimatedFlashLevel = participationResults.estimatedFlashLevel;
    this.flashPixScore = participationResults.flashPixScore;

    this.totalSkillsCount = competences.flatMap(({ skillIds }) => skillIds).length;
    this.testedSkillsCount = knowledgeElements.length;
    this.validatedSkillsCount = knowledgeElements.filter(({ isValidated }) => isValidated).length;
    this.masteryRate = this._computeMasteryRate(
      participationResults.masteryRate,
      this.isShared,
      this.totalSkillsCount,
      this.validatedSkillsCount
    );

    this.competenceResults = competences.map((competence) => _buildCompetenceResults(competence, knowledgeElements));
    this.badgeResults = badgeResultsDTO.map((badge) => new BadgeResult(badge, participationResults));

    this.stageCount = stages.length;
    if (stages.length > 0) {
      this.reachedStage = new ReachedStage(this.masteryRate, stages);
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

function _buildCompetenceResults(competence, knowledgeElements) {
  const competenceKnowledgeElements = knowledgeElements.filter(({ skillId }) => competence.skillIds.includes(skillId));
  return new CompetenceResult(competence, competenceKnowledgeElements);
}

module.exports = AssessmentResult;

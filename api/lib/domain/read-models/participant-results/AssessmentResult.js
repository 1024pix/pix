const BadgeResult = require('./BadgeResult');
const ReachedStage = require('./ReachedStage');
const CompetenceResult = require('./CompetenceResult');
const constants = require('../../constants');
const moment = require('moment');

class AssessmentResult {
  constructor(participationResults, targetProfile, isCampaignMultipleSendings, isRegistrationActive) {
    const { knowledgeElements, sharedAt, assessmentCreatedAt } = participationResults;
    const { competences } = targetProfile;

    this.id = participationResults.campaignParticipationId;
    this.isCompleted = participationResults.isCompleted;
    this.isShared = Boolean(participationResults.sharedAt);
    this.participantExternalId = participationResults.participantExternalId;
    this.estimatedFlashLevel = participationResults.estimatedFlashLevel;

    this.totalSkillsCount = competences.flatMap(({ skillIds }) => skillIds).length;
    this.testedSkillsCount = knowledgeElements.length;
    this.validatedSkillsCount = knowledgeElements.filter(({ isValidated }) => isValidated).length;
    this.masteryRate = this._computeMasteryRate(participationResults.masteryRate);

    this.competenceResults = competences.map((competence) => _buildCompetenceResults(competence, knowledgeElements));
    this.badgeResults = targetProfile.badges.map((badge) => new BadgeResult(badge, participationResults));

    this.stageCount = targetProfile.stages.length;
    if (targetProfile.stages.length > 0) {
      this.reachedStage = new ReachedStage(this.masteryRate, targetProfile.stages);
    }
    this.canImprove = this._computeCanImprove(knowledgeElements, assessmentCreatedAt);
    this.canRetry = this._computeCanRetry(isCampaignMultipleSendings, sharedAt, isRegistrationActive);
  }

  _computeMasteryRate(masteryRate) {
    if (this.isShared) {
      return masteryRate;
    } else if (this.totalSkillsCount > 0) {
      const rate = (this.validatedSkillsCount / this.totalSkillsCount).toPrecision(2);
      return parseFloat(rate);
    } else {
      return 0;
    }
  }

  _computeCanImprove(knowledgeElements, assessmentCreatedAt) {
    const isImprovementPossible =
      knowledgeElements.filter((knowledgeElement) => {
        const isOldEnoughToBeImproved =
          moment(assessmentCreatedAt).diff(knowledgeElement.createdAt, 'days', true) >=
          constants.MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING;
        return knowledgeElement.isInvalidated && isOldEnoughToBeImproved;
      }).length > 0;
    return isImprovementPossible && !this.isShared;
  }

  _computeCanRetry(isCampaignMultipleSendings, sharedAt, isRegistrationActive) {
    return (
      isCampaignMultipleSendings &&
      this._timeBeforeRetryingPassed(sharedAt) &&
      this.masteryRate < constants.MAX_MASTERY_RATE &&
      isRegistrationActive
    );
  }

  _timeBeforeRetryingPassed(sharedAt) {
    if (!this.isShared) return false;
    return sharedAt && moment().diff(sharedAt, 'days', true) >= constants.MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING;
  }
}

function _buildCompetenceResults(competence, knowledgeElements) {
  const competenceKnowledgeElements = knowledgeElements.filter(({ skillId }) => competence.skillIds.includes(skillId));
  return new CompetenceResult(competence, competenceKnowledgeElements);
}

module.exports = AssessmentResult;

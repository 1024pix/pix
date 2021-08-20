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

    this.totalSkillsCount = competences.flatMap(({ skillIds }) => skillIds).length;
    this.testedSkillsCount = knowledgeElements.length;
    this.validatedSkillsCount = knowledgeElements.filter(({ isValidated }) => isValidated).length;
    this.masteryPercentage = this._computeMasteryPercentage();

    this.competenceResults = competences.map((competence) => _buildCompetenceResults(competence, knowledgeElements));
    this.badgeResults = targetProfile.badges.map((badge) => new BadgeResult(badge, participationResults));

    this.stageCount = targetProfile.stages.length;
    if (targetProfile.stages.length > 0) {
      this.reachedStage = new ReachedStage(this.masteryPercentage, targetProfile.stages);
    }
    this.canImprove = this._computeCanImprove(knowledgeElements, assessmentCreatedAt);
    this.canRetry = this._computeCanRetry(isCampaignMultipleSendings, sharedAt, isRegistrationActive);
  }

  _computeMasteryPercentage() {
    if (this.totalSkillsCount !== 0) {
      return Math.round(this.validatedSkillsCount * 100 / this.totalSkillsCount);
    } else {
      return 0;
    }
  }

  _computeCanImprove(knowledgeElements, assessmentCreatedAt) {
    return knowledgeElements.filter((knowledgeElement) => {
      const isOldEnoughToBeImproved = moment(assessmentCreatedAt)
        .diff(knowledgeElement.createdAt, 'days', true) >= constants.MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING;
      return knowledgeElement.isInvalidated && isOldEnoughToBeImproved;
    }).length > 0;
  }

  _computeCanRetry(isCampaignMultipleSendings, sharedAt, isRegistrationActive) {
    return isCampaignMultipleSendings
      && this._timeBeforeRetryingPassed(sharedAt)
      && this.masteryPercentage < constants.MAX_MASTERY_POURCENTAGE
      && isRegistrationActive;
  }

  _timeBeforeRetryingPassed(sharedAt) {
    if (!this.isShared) return false;
    return sharedAt && moment().diff(sharedAt, 'days') >= constants.MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING;
  }
}

function _buildCompetenceResults(competence, knowledgeElements) {
  const competenceKnowledgeElements = knowledgeElements.filter(({ skillId }) => competence.skillIds.includes(skillId));
  return new CompetenceResult(competence, competenceKnowledgeElements);
}

module.exports = AssessmentResult;

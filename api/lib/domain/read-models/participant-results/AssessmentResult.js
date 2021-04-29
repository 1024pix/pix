const BadgeResult = require('./BadgeResult');
const ReachedStage = require('./ReachedStage');
const CompetenceResult = require('./CompetenceResult');
const constants = require('../../constants');
const moment = require('moment');

class AssessmentResult {

  constructor(participationResults, targetProfile, isCampaignMultipleSendings) {
    const { knowledgeElements, sharedAt } = participationResults;
    const { competences } = targetProfile;

    this.id = participationResults.campaignParticipationId;
    this.isCompleted = participationResults.isCompleted;

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
    this.canRetry = this._computeCanRetry(isCampaignMultipleSendings, sharedAt);
  }

  _computeMasteryPercentage() {
    if (this.totalSkillsCount !== 0) {
      return Math.round(this.validatedSkillsCount * 100 / this.totalSkillsCount);
    } else {
      return 0;
    }
  }

  _computeCanRetry(isCampaignMultipleSendings, sharedAt) {
    return isCampaignMultipleSendings
      && this._isSharedLongTimeAgo(sharedAt)
      && this.masteryPercentage < constants.MAX_MASTERY_POURCENTAGE;
  }

  _isSharedLongTimeAgo(sharedAt) {
    return sharedAt && moment().diff(sharedAt, 'days') >= constants.MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING;
  }
}

function _buildCompetenceResults(competence, knowledgeElements) {
  const competenceKnowledgeElements = knowledgeElements.filter(({ skillId }) => competence.skillIds.includes(skillId));
  return new CompetenceResult(competence, competenceKnowledgeElements);
}

module.exports = AssessmentResult;

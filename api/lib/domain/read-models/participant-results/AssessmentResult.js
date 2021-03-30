const BadgeResult = require('./BadgeResult');
const ReachedStage = require('./ReachedStage');
const CompetenceResult = require('./CompetenceResult');

class AssessmentResult {

  constructor(participationResults, targetProfile) {
    const { knowledgeElements } = participationResults;
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
  }

  _computeMasteryPercentage() {
    if (this.totalSkillsCount !== 0) {
      return Math.round(this.validatedSkillsCount * 100 / this.totalSkillsCount);
    } else {
      return 0;
    }
  }
}

function _buildCompetenceResults(competence, knowledgeElements) {
  const competenceKnowledgeElements = knowledgeElements.filter(({ skillId }) => competence.skillIds.includes(skillId));
  return new CompetenceResult(competence, competenceKnowledgeElements);
}

module.exports = AssessmentResult;

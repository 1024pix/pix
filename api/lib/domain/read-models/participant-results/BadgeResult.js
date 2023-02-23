const SkillSetResult = require('./SkillSetResult.js');

class BadgeResult {
  constructor(badge, participationResults) {
    const { acquiredBadgeIds, knowledgeElements } = participationResults;
    this.id = badge.id;
    this.title = badge.title;
    this.message = badge.message;
    this.altMessage = badge.altMessage;
    this.key = badge.key;
    this.imageUrl = badge.imageUrl;
    this.isAcquired = acquiredBadgeIds.includes(badge.id);
    this.isAlwaysVisible = badge.isAlwaysVisible;
    this.isCertifiable = badge.isCertifiable;
    this.isValid = badge.isValid;

    this.skillSetResults = badge.badgeCompetences.map((badgeCompetence) =>
      _buildSkillSetResult(badgeCompetence, knowledgeElements)
    );
  }
}

function _buildSkillSetResult(badgeCompetence, knowledgeElements) {
  const skillIds = badgeCompetence.skillIds;
  const competenceKnowledgeElements = knowledgeElements.filter(({ skillId }) => skillIds.includes(skillId));

  return new SkillSetResult(badgeCompetence, competenceKnowledgeElements);
}

module.exports = BadgeResult;

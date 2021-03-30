const PartnerCompetenceResult = require('./PartnerCompetenceResult');

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

    this.partnerCompetenceResults = badge.badgeCompetences.map((competence) => _buildCompetenceResults(competence, knowledgeElements));
  }
}

function _buildCompetenceResults(badgeCompetence, knowledgeElements) {
  const skillIds = badgeCompetence.skillIds;
  const competenceKnowledgeElements = knowledgeElements.filter(({ skillId }) => skillIds.includes(skillId));

  return new PartnerCompetenceResult(badgeCompetence, competenceKnowledgeElements);
}

module.exports = BadgeResult;

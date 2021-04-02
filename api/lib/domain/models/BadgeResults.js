const _ = require('lodash');

class BadgeResults {
  constructor(badges, skills, knowledgeElements) {
    this.masteryPercentage = _computeMasteryPercentage(skills, knowledgeElements);

    this.campaignParticipationBadges = badges.map(({ id, badgePartnerCompetences }) => {
      return {
        id,
        partnerCompetenceResults: _buildPartnerCompetenceResults(badgePartnerCompetences, knowledgeElements),
      };
    });
  }

  static build(badges, skills, knowledgeElements) {
    return new BadgeResults(badges, skills, knowledgeElements);
  }
}

function _computeMasteryPercentage(skills, knowledgeElement) {
  const validatedSkillsCount = _.filter(knowledgeElement, 'isValidated').length;

  return Math.round(validatedSkillsCount * 100 / skills.length);
}

function _buildPartnerCompetenceResults(partnerCompetences, knowledgeElements) {
  return partnerCompetences.map((partnerCompetence) => {
    const competenceKnowledgeElements = _findKnowledgeElementsFrom(partnerCompetence, knowledgeElements);
    return {
      id: partnerCompetence.id,
      masteryPercentage: _computeMasteryPercentage(partnerCompetence.skillIds, competenceKnowledgeElements),
    };
  });
}
function _findKnowledgeElementsFrom(partnerCompetence, knowledgeElements) {
  return knowledgeElements.filter(({ skillId }) => partnerCompetence.skillIds.includes(skillId));
}

module.exports = BadgeResults;

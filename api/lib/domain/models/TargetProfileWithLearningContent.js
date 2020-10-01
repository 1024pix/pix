class TargetProfileWithLearningContent {
  constructor({
    id,
    name,
    skills = [],
    tubes = [],
    competences = [],
    areas = [],
  } = {}) {
    this.id = id;
    this.name = name;
    this.skills = skills;
    this.tubes = tubes;
    this.competences = competences;
    this.areas = areas;
  }

  get skillNames() {
    return this.skills.map((skill) => skill.name);
  }

  get skillIds() {
    return this.skills.map((skill) => skill.id);
  }

  get competenceIds() {
    return this.competences.map((competences) => competences.id);
  }

  hasSkill(skillId) {
    return this.skills.some((skill) => skill.id === skillId);
  }

  getCompetenceIdOfSkill(skillId) {
    const skillTube = this.tubes.find((tube) => tube.hasSkill(skillId));

    return skillTube ? skillTube.competenceId : null;
  }

  getAreaOfCompetence(competenceId) {
    const area = this.areas.find((area) => area.hasCompetence(competenceId));

    return area || null;
  }

  groupKnowledgeElementsByCompetence(knowledgeElements) {
    const knowledgeElementsGroupedByCompetence = {};
    for (const competenceId of this.competenceIds) {
      knowledgeElementsGroupedByCompetence[competenceId] = [];
    }
    for (const knowledgeElement of knowledgeElements) {
      const competenceId = this.getCompetenceIdOfSkill(knowledgeElement.skillId);
      if (competenceId) {
        knowledgeElementsGroupedByCompetence[competenceId].push(knowledgeElement);
      }
    }

    return knowledgeElementsGroupedByCompetence;
  }
}

module.exports = TargetProfileWithLearningContent;

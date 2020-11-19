const _ = require('lodash');

class TargetProfileWithLearningContent {
  constructor({
    id,
    name,
    skills = [],
    tubes = [],
    competences = [],
    areas = [],
    badges = [],
  } = {}) {
    this.id = id;
    this.name = name;
    this.skills = skills;
    this.tubes = tubes;
    this.competences = competences;
    this.areas = areas;
    this.badges = badges;
  }

  get skillNames() {
    return this.skills.map((skill) => skill.name);
  }

  get skillIds() {
    return this.skills.map((skill) => skill.id);
  }

  get tubeIds() {
    return this.tubes.map((tube) => tube.id);
  }

  get competenceIds() {
    return this.competences.map((competence) => competence.id);
  }

  hasSkill(skillId) {
    return this.skills.some((skill) => skill.id === skillId);
  }

  getTubeIdOfSkill(skillId) {
    const skillTube = this.tubes.find((tube) => tube.hasSkill(skillId));

    return skillTube ? skillTube.id : null;
  }

  getCompetenceIdOfSkill(skillId) {
    const skillTube = this.tubes.find((tube) => tube.hasSkill(skillId));

    return skillTube ? skillTube.competenceId : null;
  }

  getCompetence(competenceId) {
    const foundCompetence = _.find(this.competences, (competence) => competence.id === competenceId);
    return foundCompetence || null;
  }

  getArea(areaId) {
    const foundArea = _.find(this.areas, (area) => area.id === areaId);
    return foundArea || null;
  }

  getAreaOfCompetence(competenceId) {
    const area = this.areas.find((area) => area.hasCompetence(competenceId));

    return area || null;
  }

  getKnowledgeElementsGroupedByCompetence(knowledgeElements) {
    return this._filterTargetedKnowledgeElementAndGroupByCompetence(knowledgeElements);
  }

  getValidatedKnowledgeElementsGroupedByTube(knowledgeElements) {
    return this._filterTargetedKnowledgeElementAndGroupByTube(knowledgeElements, (knowledgeElement) => knowledgeElement.isValidated);
  }

  _filterTargetedKnowledgeElementAndGroupByCompetence(knowledgeElements, knowledgeElementFilter = () => true) {
    const knowledgeElementsGroupedByCompetence = {};
    for (const competenceId of this.competenceIds) {
      knowledgeElementsGroupedByCompetence[competenceId] = [];
    }
    for (const knowledgeElement of knowledgeElements) {
      const competenceId = this.getCompetenceIdOfSkill(knowledgeElement.skillId);
      if (competenceId && knowledgeElementFilter(knowledgeElement)) {
        knowledgeElementsGroupedByCompetence[competenceId].push(knowledgeElement);
      }
    }

    return knowledgeElementsGroupedByCompetence;
  }

  _filterTargetedKnowledgeElementAndGroupByTube(knowledgeElements, knowledgeElementFilter = () => true) {
    const knowledgeElementsGroupedByTube = {};
    for (const tubeId of this.tubeIds) {
      knowledgeElementsGroupedByTube[tubeId] = [];
    }
    for (const knowledgeElement of knowledgeElements) {
      const tubeId = this.getTubeIdOfSkill(knowledgeElement.skillId);
      if (tubeId && knowledgeElementFilter(knowledgeElement)) {
        knowledgeElementsGroupedByTube[tubeId].push(knowledgeElement);
      }
    }

    return knowledgeElementsGroupedByTube;
  }

  countValidatedTargetedKnowledgeElementsByCompetence(knowledgeElements) {
    const validatedGroupedByCompetence = this._filterTargetedKnowledgeElementAndGroupByCompetence(knowledgeElements, (knowledgeElement) => knowledgeElement.isValidated);
    return _.mapValues(validatedGroupedByCompetence, 'length');
  }

  get maxSkillDifficulty() {
    const skillMaxDifficulty = _.maxBy(this.skills, 'difficulty');
    return skillMaxDifficulty ? skillMaxDifficulty.difficulty : null;
  }
}

module.exports = TargetProfileWithLearningContent;

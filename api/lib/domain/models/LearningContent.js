const _ = require('lodash');

module.exports = class LearningContent {
  constructor(areas) {
    this.areas = areas;
  }

  get competences() {
    return this.areas.flatMap((area) => area.competences);
  }

  get tubes() {
    return this.competences.flatMap((competence) => competence.tubes);
  }

  get skills() {
    return this.tubes.flatMap((tube) => tube.skills);
  }

  get maxSkillDifficulty() {
    const skillMaxDifficulty = _.maxBy(this.skills, 'difficulty');
    return skillMaxDifficulty ? skillMaxDifficulty.difficulty : null;
  }

  get tubeIds() {
    return this.tubes.map((tube) => tube.id);
  }

  getCompetence(competenceId) {
    const foundCompetence = _.find(this.competences, (competence) => competence.id === competenceId);
    return foundCompetence || null;
  }

  getValidatedKnowledgeElementsGroupedByTube(knowledgeElements) {
    return this._filterTargetedKnowledgeElementAndGroupByTube(
      knowledgeElements,
      (knowledgeElement) => knowledgeElement.isValidated
    );
  }

  _getTubeIdOfSkill(skillId) {
    const skillTube = this.tubes.find((tube) => tube.hasSkill(skillId));

    return skillTube ? skillTube.id : null;
  }

  _filterTargetedKnowledgeElementAndGroupByTube(knowledgeElements, knowledgeElementFilter = () => true) {
    const knowledgeElementsGroupedByTube = {};
    for (const tubeId of this.tubeIds) {
      knowledgeElementsGroupedByTube[tubeId] = [];
    }
    for (const knowledgeElement of knowledgeElements) {
      const tubeId = this._getTubeIdOfSkill(knowledgeElement.skillId);
      if (tubeId && knowledgeElementFilter(knowledgeElement)) {
        knowledgeElementsGroupedByTube[tubeId].push(knowledgeElement);
      }
    }

    return knowledgeElementsGroupedByTube;
  }
};

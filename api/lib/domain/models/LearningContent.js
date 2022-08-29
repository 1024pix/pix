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

  findSkill(skillId) {
    return this.skills.find((skill) => skill.id === skillId) ?? null;
  }

  findTube(tubeId) {
    return this.tubes.find((tube) => tube.id === tubeId) ?? null;
  }

  findCompetence(competenceId) {
    return this.competences.find((competence) => competence.id === competenceId) ?? null;
  }

  findArea(areaId) {
    return this.areas.find((area) => area.id === areaId) ?? null;
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

  countValidatedTargetedKnowledgeElementsByCompetence(knowledgeElements) {
    const validatedGroupedByCompetence = this._filterTargetedKnowledgeElementAndGroupByCompetence(
      knowledgeElements,
      (knowledgeElement) => knowledgeElement.isValidated
    );
    return _.mapValues(validatedGroupedByCompetence, 'length');
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

  _filterTargetedKnowledgeElementAndGroupByCompetence(knowledgeElements, knowledgeElementFilter = () => true) {
    const knowledgeElementsGroupedByCompetence = {};
    for (const competence of this.competences) {
      knowledgeElementsGroupedByCompetence[competence.id] = [];
    }
    for (const knowledgeElement of knowledgeElements) {
      const competenceId = this.findCompetenceIdOfSkill(knowledgeElement.skillId);
      if (competenceId && knowledgeElementFilter(knowledgeElement)) {
        knowledgeElementsGroupedByCompetence[competenceId].push(knowledgeElement);
      }
    }

    return knowledgeElementsGroupedByCompetence;
  }

  findCompetenceIdOfSkill(skillId) {
    const skillCompetence = this.competences.find((competence) => competence.hasSkill(skillId));

    return skillCompetence ? skillCompetence.id : null;
  }
};

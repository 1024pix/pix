import _ from 'lodash';

export default class CampaignLearningContent {
  constructor(learningContent) {
    this._learningContent = learningContent;
  }

  get skills() {
    return this._learningContent.skills;
  }

  get tubes() {
    return this._learningContent.tubes;
  }

  get competences() {
    return this._learningContent.competences;
  }

  get areas() {
    return this._learningContent.areas;
  }

  findSkill(skillId) {
    return this._learningContent.findSkill(skillId);
  }

  findTube(tubeId) {
    return this._learningContent.findTube(tubeId);
  }

  findCompetence(competenceId) {
    return this._learningContent.findCompetence(competenceId);
  }

  findArea(areaId) {
    return this._learningContent.findArea(areaId);
  }

  get maxSkillDifficulty() {
    const skillMaxDifficulty = _.maxBy(this.skills, 'difficulty');
    return skillMaxDifficulty ? skillMaxDifficulty.difficulty : null;
  }

  get tubeIds() {
    return this.tubes.map((tube) => tube.id);
  }

  /** @deprecated use findCompetence */
  getCompetence(competenceId) {
    return this.findCompetence(competenceId);
  }

  getValidatedKnowledgeElementsGroupedByTube(knowledgeElements) {
    return this._filterTargetedKnowledgeElementAndGroupByTube(
      knowledgeElements,
      (knowledgeElement) => knowledgeElement.isValidated
    );
  }

  getKnowledgeElementsGroupedByCompetence(knowledgeElements) {
    return this._filterTargetedKnowledgeElementAndGroupByCompetence(knowledgeElements);
  }

  countValidatedTargetedKnowledgeElementsByCompetence(knowledgeElements) {
    const validatedGroupedByCompetence = this._filterTargetedKnowledgeElementAndGroupByCompetence(
      knowledgeElements,
      (knowledgeElement) => knowledgeElement.isValidated
    );
    return _.mapValues(validatedGroupedByCompetence, 'length');
  }

  get skillNames() {
    return this.skills.map((skill) => skill.name);
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
    const tubeId = this.findSkill(skillId)?.tubeId;
    if (!tubeId) return null;
    return this.findTube(tubeId).competenceId;
  }

  findAreaOfCompetence(competence) {
    const area = this.findArea(competence.areaId);
    return area || null;
  }
}

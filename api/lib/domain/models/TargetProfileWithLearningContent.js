const _ = require('lodash');

class TargetProfileWithLearningContent {
  constructor({
    id,
    name,
    outdated,
    isPublic,
    createdAt,
    ownerOrganizationId,
    skills = [],
    tubes = [],
    competences = [],
    areas = [],
    badges = [],
    stages = [],
    imageUrl,
  } = {}) {
    this.id = id;
    this.name = name;
    this.outdated = outdated;
    this.isPublic = isPublic;
    this.createdAt = createdAt;
    this.ownerOrganizationId = ownerOrganizationId;
    this.skills = skills;
    this.tubes = tubes;
    this.competences = competences;
    this.areas = areas;
    this.badges = badges;
    this.stages = _.sortBy(stages, 'threshold');
    this.imageUrl = imageUrl;
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

  get reachableStages() {
    return _(this.stages)
      .filter(({ threshold }) => threshold > 0)
      .value();
  }

  hasSkill(skillId) {
    return this.skills.some((skill) => skill.id === skillId);
  }

  hasBadges() {
    return this.badges.length > 0;
  }

  hasReachableStages() {
    return this.reachableStages.length > 0;
  }

  getTubeIdOfSkill(skillId) {
    const skillTube = this.tubes.find((tube) => tube.hasSkill(skillId));

    return skillTube ? skillTube.id : null;
  }

  getCompetenceIdOfSkill(skillId) {
    const skillTube = this.tubes.find((tube) => tube.hasSkill(skillId));

    return skillTube ? skillTube.competenceId : null;
  }

  findSkill(skillId) {
    const foundSkill = _.find(this.skills, (skill) => skill.id === skillId);
    return foundSkill || null;
  }

  findTube(tubeId) {
    const foundTube = _.find(this.tubes, (tube) => tube.id === tubeId);
    return foundTube || null;
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

  getSkillsCountBoundariesFromStages(stageIds) {
    if (!stageIds || stageIds.length === 0) return null;

    const totalSkills = this.skills.length;

    return stageIds.map((stageId) => {
      const boundary = {};
      const stageIndex = this.stages.findIndex((stage) => stage.id == stageId);
      boundary.from = this.stages[stageIndex].getMinSkillsCountToReachStage(totalSkills);
      if (stageIndex !== this.stages.length - 1) {
        boundary.to = this.stages[stageIndex + 1].getMinSkillsCountToReachStage(totalSkills) - 1;
      } else {
        boundary.to = totalSkills;
      }
      return boundary;
    });
  }
}

module.exports = TargetProfileWithLearningContent;

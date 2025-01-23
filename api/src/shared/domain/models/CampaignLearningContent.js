import _ from 'lodash';

import { LearningContent } from './LearningContent.js';

class CampaignLearningContent extends LearningContent {
  constructor(learningContent) {
    super(learningContent);
  }

  get areas() {
    return super.areas.sort((a, b) => a.code.localeCompare(b.code));
  }

  get competences() {
    return super.competences.sort((a, b) => a.index.localeCompare(b.index));
  }

  get maxSkillDifficulty() {
    const skillMaxDifficulty = _.maxBy(this.skills, 'difficulty');
    return skillMaxDifficulty ? skillMaxDifficulty.difficulty : null;
  }

  get tubeIds() {
    return this.tubes.map((tube) => tube.id);
  }

  getValidatedKnowledgeElementsGroupedByTube(knowledgeElements) {
    return this._filterTargetedKnowledgeElementAndGroupByTube(
      knowledgeElements,
      (knowledgeElement) => knowledgeElement.isValidated,
    );
  }

  getKnowledgeElementsGroupedByCompetence(knowledgeElements) {
    return this._filterTargetedKnowledgeElementAndGroupByCompetence(knowledgeElements);
  }

  countValidatedTargetedKnowledgeElementsByCompetence(knowledgeElements) {
    const validatedGroupedByCompetence = this._filterTargetedKnowledgeElementAndGroupByCompetence(
      knowledgeElements,
      (knowledgeElement) => knowledgeElement.isValidated,
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

  findAreaOfCompetence(competence) {
    const area = this.findArea(competence.areaId);
    return area || null;
  }
}

export { CampaignLearningContent };

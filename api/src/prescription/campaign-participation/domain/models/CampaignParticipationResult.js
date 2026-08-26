import _ from 'lodash';

import * as campaignParticipationService from '../../../campaign/domain/services/campaign-participation-service.js';
import { CompetenceResult } from './CompetenceResult.js';

class CampaignParticipationResult {
  constructor({
    id,
    isCompleted,
    totalSkillsCount,
    testedSkillsCount,
    validatedSkillsCount,
    assessedSkillsCount,
    // relationships
    competenceResults = [],
  } = {}) {
    this.id = id;
    this.isCompleted = isCompleted;
    this.totalSkillsCount = totalSkillsCount;
    this.testedSkillsCount = testedSkillsCount;
    this.validatedSkillsCount = validatedSkillsCount;
    this.assessedSkillsCount = assessedSkillsCount;
    // relationships
    this.competenceResults = competenceResults;
  }

  /**
   * @param {KnowledgeState} knowledgeState
   */
  static buildFrom({ campaignParticipationId, assessment, competences, skillIds, knowledgeState, allAreas }) {
    const targetedAssessedSkillIds = _targetedSkillIds(knowledgeState.assessedSkills(), skillIds);
    const targetedValidatedSkillIds = _targetedSkillIds(knowledgeState.validatedSkills(), skillIds);

    const targetedCompetenceResults = _computeCompetenceResults(
      competences,
      skillIds,
      targetedAssessedSkillIds,
      targetedValidatedSkillIds,
      allAreas,
    );

    const validatedSkillsCount = _.sumBy(targetedCompetenceResults, 'validatedSkillsCount');
    const totalSkillsCount = _.sumBy(targetedCompetenceResults, 'totalSkillsCount');
    const testedSkillsCount = _.sumBy(targetedCompetenceResults, 'testedSkillsCount');

    return new CampaignParticipationResult({
      id: campaignParticipationId,
      totalSkillsCount,
      testedSkillsCount,
      validatedSkillsCount,
      assessedSkillsCount: targetedAssessedSkillIds.length,
      isCompleted: assessment.isCompleted(),
      competenceResults: targetedCompetenceResults,
    });
  }

  get masteryPercentage() {
    return _computeMasteryPercentage({
      totalSkillsCount: this.totalSkillsCount,
      validatedSkillsCount: this.validatedSkillsCount,
    });
  }

  get progress() {
    return campaignParticipationService.progress(this.isCompleted, this.assessedSkillsCount, this.totalSkillsCount);
  }
}

function _computeMasteryPercentage({ totalSkillsCount, validatedSkillsCount }) {
  if (totalSkillsCount !== 0) {
    return Math.round((validatedSkillsCount * 100) / totalSkillsCount);
  } else {
    return 0;
  }
}

function _targetedSkillIds(skills, skillIds) {
  return skills.map(({ id }) => id).filter((id) => skillIds.includes(id));
}

function _computeCompetenceResults(
  competences,
  skillIds,
  targetedAssessedSkillIds,
  targetedValidatedSkillIds,
  allAreas,
) {
  let targetedCompetences = _removeUntargetedSkillIdsFromCompetences(competences, skillIds);
  targetedCompetences = _removeCompetencesWithoutAnyTargetedSkillsLeft(targetedCompetences);
  const targetedCompetenceResults = _.map(targetedCompetences, (competence) => {
    const area = allAreas.find((area) => area.id === competence.areaId);
    return _getTestedCompetenceResults(competence, area, targetedAssessedSkillIds, targetedValidatedSkillIds);
  });
  return targetedCompetenceResults;
}

function _removeUntargetedSkillIdsFromCompetences(competences, skillIds) {
  return _.map(competences, (competence) => {
    competence.skillIds = _.intersection(competence.skillIds, skillIds);
    return competence;
  });
}

function _removeCompetencesWithoutAnyTargetedSkillsLeft(competences) {
  return _.filter(competences, (competence) => !_.isEmpty(competence.skillIds));
}

function _getTestedCompetenceResults(competence, area, targetedAssessedSkillIds, targetedValidatedSkillIds) {
  const testedSkillsCount = _.intersection(targetedAssessedSkillIds, competence.skillIds).length;
  const validatedSkillsCount = _.intersection(targetedValidatedSkillIds, competence.skillIds).length;
  const totalSkillsCount = competence.skillIds.length;

  return new CompetenceResult({
    id: competence.id,
    name: competence.name,
    index: competence.index,
    areaColor: area.color,
    areaName: area.name,
    totalSkillsCount,
    testedSkillsCount,
    validatedSkillsCount,
    badgeId: competence.badgeId,
  });
}

export { CampaignParticipationResult };

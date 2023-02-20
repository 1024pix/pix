import campaignParticipationService from '../services/campaign-participation-service';
import CompetenceResult from './CompetenceResult';
import _ from 'lodash';

class CampaignParticipationResult {
  constructor({
    id,
    isCompleted,
    totalSkillsCount,
    testedSkillsCount,
    validatedSkillsCount,
    knowledgeElementsCount,
    // relationships
    competenceResults = [],
    reachedStage,
    stageCount,
  } = {}) {
    this.id = id;
    this.isCompleted = isCompleted;
    this.totalSkillsCount = totalSkillsCount;
    this.testedSkillsCount = testedSkillsCount;
    this.validatedSkillsCount = validatedSkillsCount;
    this.knowledgeElementsCount = knowledgeElementsCount;
    // relationships
    this.competenceResults = competenceResults;
    this.reachedStage = reachedStage;
    this.stageCount = stageCount;
  }

  static buildFrom({
    campaignParticipationId,
    assessment,
    competences,
    stages,
    skillIds,
    knowledgeElements,
    allAreas,
  }) {
    const targetedKnowledgeElements = _removeUntargetedKnowledgeElements(knowledgeElements, skillIds);

    const targetedCompetenceResults = _computeCompetenceResults(
      competences,
      skillIds,
      targetedKnowledgeElements,
      allAreas
    );

    const validatedSkillsCount = _.sumBy(targetedCompetenceResults, 'validatedSkillsCount');
    const totalSkillsCount = _.sumBy(targetedCompetenceResults, 'totalSkillsCount');
    const testedSkillsCount = _.sumBy(targetedCompetenceResults, 'testedSkillsCount');

    return new CampaignParticipationResult({
      id: campaignParticipationId,
      totalSkillsCount,
      testedSkillsCount,
      validatedSkillsCount,
      knowledgeElementsCount: targetedKnowledgeElements.length,
      isCompleted: assessment.isCompleted(),
      competenceResults: targetedCompetenceResults,
      reachedStage: _computeReachedStage({ stages, totalSkillsCount, validatedSkillsCount }),
      stageCount: stages && stages.length,
    });
  }

  get masteryPercentage() {
    return _computeMasteryPercentage({
      totalSkillsCount: this.totalSkillsCount,
      validatedSkillsCount: this.validatedSkillsCount,
    });
  }

  get progress() {
    return campaignParticipationService.progress(this.isCompleted, this.knowledgeElementsCount, this.totalSkillsCount);
  }
}

function _computeReachedStage({ stages, totalSkillsCount, validatedSkillsCount }) {
  if (!stages) {
    return null;
  }
  const masteryPercentage = _computeMasteryPercentage({ totalSkillsCount, validatedSkillsCount });
  const reachedStages = stages.filter((stage) => masteryPercentage >= stage.threshold);
  return {
    ..._.last(reachedStages),
    starCount: reachedStages.length,
  };
}

function _computeMasteryPercentage({ totalSkillsCount, validatedSkillsCount }) {
  if (totalSkillsCount !== 0) {
    return Math.round((validatedSkillsCount * 100) / totalSkillsCount);
  } else {
    return 0;
  }
}

function _removeUntargetedKnowledgeElements(knowledgeElements, skillIds) {
  return _.filter(knowledgeElements, (ke) => skillIds.some((skillId) => skillId === ke.skillId));
}

function _computeCompetenceResults(competences, skillIds, targetedKnowledgeElements, allAreas) {
  let targetedCompetences = _removeUntargetedSkillIdsFromCompetences(competences, skillIds);
  targetedCompetences = _removeCompetencesWithoutAnyTargetedSkillsLeft(targetedCompetences);
  const targetedCompetenceResults = _.map(targetedCompetences, (competence) => {
    const area = allAreas.find((area) => area.id === competence.areaId);
    return _getTestedCompetenceResults(competence, area, targetedKnowledgeElements);
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

function _getTestedCompetenceResults(competence, area, targetedKnowledgeElements) {
  const targetedKnowledgeElementsForCompetence = _.filter(targetedKnowledgeElements, (ke) =>
    _.includes(competence.skillIds, ke.skillId)
  );
  const validatedKnowledgeElementsForCompetence = _.filter(targetedKnowledgeElementsForCompetence, 'isValidated');

  const testedSkillsCount = targetedKnowledgeElementsForCompetence.length;
  const validatedSkillsCount = validatedKnowledgeElementsForCompetence.length;
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

export default CampaignParticipationResult;

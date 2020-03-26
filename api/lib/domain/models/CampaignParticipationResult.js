const campaignParticipationService = require('../services/campaign-participation-service');
const CompetenceResult = require('./CompetenceResult');

const _ = require('lodash');

class CampaignParticipationResult {
  constructor({
    id,
    // attributes
    areBadgeCriteriaFulfilled,
    isCompleted,
    totalSkillsCount,
    testedSkillsCount,
    validatedSkillsCount,
    knowledgeElementsCount,
    // relationships
    badge,
    badgePartnerCompetenceResults = [],
    competenceResults = [],
  } = {}) {
    this.id = id;
    // attributes
    this.areBadgeCriteriaFulfilled = areBadgeCriteriaFulfilled;
    this.isCompleted = isCompleted;
    this.totalSkillsCount = totalSkillsCount;
    this.testedSkillsCount = testedSkillsCount;
    this.validatedSkillsCount = validatedSkillsCount;
    this.knowledgeElementsCount = knowledgeElementsCount,
    // relationships
    this.badge = badge;
    this.badgePartnerCompetenceResults = badgePartnerCompetenceResults;
    this.competenceResults = competenceResults;
  }

  static buildFrom({ campaignParticipationId, assessment, competences, targetProfile, knowledgeElements, badge }) {
    const targetProfileSkillsIds = _.map(targetProfile.skills, 'id');
    const targetedKnowledgeElements = _removeUntargetedKnowledgeElements(knowledgeElements, targetProfileSkillsIds);

    const targetedCompetenceResults = _computeCompetenceResults(competences, targetProfileSkillsIds, targetedKnowledgeElements);
    const targetedBadgePartnerCompetenceResults = _computeBadgePartnerCompetenceResults(badge, targetProfileSkillsIds, targetedKnowledgeElements);

    const validatedSkillsCount = _.sumBy(targetedCompetenceResults, 'validatedSkillsCount');
    const totalSkillsCount = _.sumBy(targetedCompetenceResults, 'totalSkillsCount');
    const testedSkillsCount = _.sumBy(targetedCompetenceResults, 'testedSkillsCount');

    return new CampaignParticipationResult({
      id: campaignParticipationId,
      totalSkillsCount,
      testedSkillsCount,
      validatedSkillsCount,
      knowledgeElementsCount: targetedKnowledgeElements.length,
      areBadgeCriteriaFulfilled: false,
      isCompleted: assessment.isCompleted(),
      competenceResults: targetedCompetenceResults,
      badgePartnerCompetenceResults: targetedBadgePartnerCompetenceResults,
      badge,
    });
  }

  get masteryPercentage() {
    if (this.totalSkillsCount !== 0) {
      return Math.round(this.validatedSkillsCount * 100 / this.totalSkillsCount);
    } else {
      return 0;
    }
  }

  get progress() {
    return campaignParticipationService.progress(this.isCompleted, this.knowledgeElementsCount, this.totalSkillsCount);
  }
}

function _removeUntargetedKnowledgeElements(knowledgeElements, targetProfileSkillsIds) {
  return _.filter(knowledgeElements, (ke) => targetProfileSkillsIds.some((skillId) => skillId === ke.skillId));
}

function _computeCompetenceResults(competences, targetProfileSkillsIds, targetedKnowledgeElements) {
  let targetedCompetences = _removeUntargetedSkillIdsFromCompetences(competences, targetProfileSkillsIds);
  targetedCompetences = _removeCompetencesWithoutAnyTargetedSkillsLeft(targetedCompetences);
  const targetedCompetenceResults = _.map(targetedCompetences, (competence) => _getTestedCompetenceResults(competence, targetedKnowledgeElements));
  return targetedCompetenceResults;
}

function _computeBadgePartnerCompetenceResults(badge, targetProfileSkillsIds, targetedKnowledgeElements) {
  if (_.isEmpty(badge) || _.isEmpty(badge.badgePartnerCompetences)) {
    return [];
  }

  return _computeCompetenceResults(badge.badgePartnerCompetences, targetProfileSkillsIds, targetedKnowledgeElements);
}

function _removeUntargetedSkillIdsFromCompetences(competences, targetProfileSkillsIds) {
  return _.map(competences, (competence) => {
    competence.skillIds = _.intersection(competence.skillIds, targetProfileSkillsIds);
    return competence;
  });
}

function _removeCompetencesWithoutAnyTargetedSkillsLeft(competences) {
  return _.filter(competences, (competence) => !_.isEmpty(competence.skillIds));
}

function _getTestedCompetenceResults(competence, targetedKnowledgeElements) {
  const targetedKnowledgeElementsForCompetence = _.filter(targetedKnowledgeElements, (ke) => _.includes(competence.skillIds, ke.skillId));
  const validatedKnowledgeElementsForCompetence = _.filter(targetedKnowledgeElementsForCompetence, 'isValidated');

  const testedSkillsCount = targetedKnowledgeElementsForCompetence.length;
  const validatedSkillsCount = validatedKnowledgeElementsForCompetence.length;
  const totalSkillsCount = competence.skillIds.length;
  const areaColor = _getCompetenceColor(competence);

  return new CompetenceResult({
    id: competence.id,
    name: competence.name,
    index: competence.index,
    areaColor,
    totalSkillsCount,
    testedSkillsCount,
    validatedSkillsCount,
  });
}

function _getCompetenceColor(competence) {
  let areaColor;
  const isBadgePartnerCompetenceColorAvailable = !_.isEmpty(competence.color);

  if (isBadgePartnerCompetenceColorAvailable) {
    areaColor = competence.color;
  } else {
    areaColor = competence.area.color;
  }
  return areaColor;
}

module.exports = CampaignParticipationResult;

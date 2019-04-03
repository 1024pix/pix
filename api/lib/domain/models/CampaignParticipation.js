const CampaignParticipationResult = require('./CampaignParticipationResult');
const CompetenceResult = require('./CompetenceResult');
const _ = require('lodash');

class CampaignParticipation {

  constructor({
    id,
    // attributes
    createdAt,
    isShared,
    participantExternalId,
    sharedAt,
    // includes
    assessment,
    campaign,
    campaignParticipationResult,
    user,
    // references
    assessmentId,
    campaignId,
    userId,
  } = {}) {
    this.id = id;
    this.createdAt = createdAt;
    this.isShared = isShared;
    this.participantExternalId = participantExternalId;
    this.sharedAt = sharedAt;
    this.assessment = assessment;
    this.campaign = campaign;
    this.campaignParticipationResult = campaignParticipationResult;
    this.user = user;
    this.assessmentId = assessmentId;
    this.campaignId = campaignId;
    this.userId = userId;
  }

  isAboutCampaignCode(code) {
    return this.campaign.code === code;
  }

  getTargetProfileId() {
    return _.get(this, 'campaign.targetProfileId', null);
  }

  addCampaignParticipationResult({ assessment, competences, targetProfile, knowledgeElements }) {
    const targetProfileSkillsIds = _.map(targetProfile.skills, 'id');
    let targetedCompetences = _removeUntargetedSkillsFromCompetences(competences, targetProfileSkillsIds);
    targetedCompetences = _removeCompetencesWithoutAnyTargetedSkillsLeft(targetedCompetences);
    const targetedKnowledgeElements = _removeUntargetedKnowledgeElements(knowledgeElements, targetProfileSkillsIds);
    const targetedCompetenceResults = _.flatMap(targetedCompetences, (competence) => _getTestedCompetenceResults(competence, targetedKnowledgeElements));

    return this.campaignParticipationResult = new CampaignParticipationResult({
      id: this.id,
      totalSkillsCount: _.sumBy(targetedCompetenceResults, 'totalSkillsCount'),
      testedSkillsCount: _.sumBy(targetedCompetenceResults, 'testedSkillsCount'),
      validatedSkillsCount: _.sumBy(targetedCompetenceResults, 'validatedSkillsCount'),
      isCompleted: assessment.isCompleted(),
      competenceResults: targetedCompetenceResults,
    });
  }

}

function _removeUntargetedKnowledgeElements(knowledgeElements, targetProfileSkillsIds) {
  return _.filter(knowledgeElements, (ke) => targetProfileSkillsIds.some((skillId) => skillId === ke.skillId));
}

function _removeUntargetedSkillsFromCompetences(competences, targetProfileSkillsIds) {
  return _.map(competences, (competence) => {
    competence.skills = _.intersection(competence.skills, targetProfileSkillsIds);
    return competence;
  });
}

function _removeCompetencesWithoutAnyTargetedSkillsLeft(competences) {
  return _.filter(competences, (competence) => !_.isEmpty(competence.skills));
}

function _getTestedCompetenceResults(competence, targetedKnowledgeElements) {
  const targetedKnowledgeElementsForCompetence = _.filter(targetedKnowledgeElements, (ke) => _.includes(competence.skills, ke.skillId));
  const validatedKnowledgeElementsForCompetence = _.filter(targetedKnowledgeElementsForCompetence, 'isValidated');

  return new CompetenceResult({
    id: competence.id,
    name: competence.name,
    index: competence.index,
    totalSkillsCount: competence.skills.length,
    testedSkillsCount: targetedKnowledgeElementsForCompetence.length,
    validatedSkillsCount: validatedKnowledgeElementsForCompetence.length,
  });
}

module.exports = CampaignParticipation;

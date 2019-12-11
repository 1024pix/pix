const moment = require('moment');
const { assign: addProperties } = require('lodash/fp');
const _ = require('lodash');

class CampaignIndividualResult {

  constructor({
    // attributes
    organizationName,
    campaignId,
    campaignName,
    targetProfileName,
    userFirstName,
    userLastName,
    targeted,
  } = {}) {

    this.organizationName = organizationName;
    this.campaignId = campaignId;
    this.campaignName = campaignName;
    this.targetProfileName = targetProfileName;
    this.userFirstName = userFirstName;
    this.userLastName = userLastName;
    this.targeted = targeted;

    // Added after fetching individual informations
    this.campaignLabel = null;
    this.progression = null;
    this.startedAt = null;
    this.isShared = null;

    // Added after fetching individual informations and campaign shared
    this.sharedAt = null;
    this.knowledgeElementsValidatedPercentage = null;
  }

  addIndividualStatistics({ assessment, campaignParticipation, allKnowledgeElements }) {
    this.startedAt = moment.utc(assessment.createdAt).format('YYYY-MM-DD'),
    this.progression = assessment.isCompleted ? 1 : this.targeted.getProgression(allKnowledgeElements),
    this.campaignLabel = campaignParticipation.participantExternalId,
    this.isShared = campaignParticipation.isShared ? 'Oui' : 'Non';

    this.targeted.knowledgeElements = allKnowledgeElements.filter(_knowledgeElementRelatedTo(this.targeted.skills));
    _rescopeTargetProfileCompetencesAndAreas(this.targeted);
  }

  addIndividualStatisticsWhenShared({ assessment, campaignParticipation, allKnowledgeElements }) {
    this.addIndividualStatistics({ assessment, campaignParticipation, allKnowledgeElements });
    this.sharedAt = moment.utc(campaignParticipation.sharedAt).format('YYYY-MM-DD');
    this.knowledgeElementsValidatedPercentage = this.targeted.getKnowledgeElementsValidatedPercentage(this.targeted.knowledgeElements);
  }

  static buildFrom({ campaign, user, targetProfile, competences, organization }) {

    // Represents all the competences, areas and skills that were targeted by this campaign
    const targeted = _rescopeTargetProfile(targetProfile, competences);

    return new CampaignIndividualResult({
      organizationName: organization.name,
      campaignId: campaign.id,
      campaignName: campaign.name,
      targetProfileName: targetProfile.name,
      userFirstName: user.firstName,
      userLastName: user.lastName,
      targeted,
    });
  }
}

function _knowledgeElementRelatedTo(skills) {
  return (knowledgeElement) => _(skills).map('id').includes(knowledgeElement.skillId);
}

function _rescopeTargetProfile(targetProfile, competences) {
  const targeted = _.assign(targetProfile, {
    skillNames: _.map(targetProfile.skills, 'name'),
    skillIds: _.map(targetProfile.skills, 'id'),
  });
  targeted.competences = competences.filter(_competenceRelatedTo(targeted.skillIds));
  targeted.areas = _(targeted.competences).map('area').map(addProperties({ numberSkillsValidated: 0, numberSkillsTested: 0 })).value();
  return targeted;
}

function _competenceRelatedTo(skillIds) {
  return (competence) => skillIds.some((skillId) => competence.skills.includes(skillId));
}

function _rescopeTargetProfileCompetencesAndAreas(targeted) {
  return _.each(targeted.competences, (competence) => {
    const skillsForThisCompetence = targeted.getSkillsInCompetence(competence);
    const numberOfSkillsValidatedForThisCompetence = _getValidatedSkillsForCompetence(skillsForThisCompetence, targeted.knowledgeElements);

    competence.skillsForThisCompetence = targeted.getSkillsInCompetence(competence);
    competence.numberOfSkillsValidatedForThisCompetence = numberOfSkillsValidatedForThisCompetence;
    competence.percentage = _.round(competence.numberOfSkillsValidatedForThisCompetence / skillsForThisCompetence.length, 2);

    const areaForThisCompetence = targeted.areas.find((area) => area.title === competence.area.title);
    areaForThisCompetence.numberSkillsValidated += numberOfSkillsValidatedForThisCompetence;
    areaForThisCompetence.numberSkillsTested = areaForThisCompetence.numberSkillsTested + skillsForThisCompetence.length;
  });
}

function _getValidatedSkillsForCompetence(competenceSkills, knowledgeElements) {
  return _(knowledgeElements)
    .filter('isValidated')
    .filter(_knowledgeElementRelatedTo(competenceSkills))
    .size();
}

module.exports = CampaignIndividualResult;

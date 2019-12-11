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
    enhancedTargetProfile,
  } = {}) {

    this.organizationName = organizationName;
    this.campaignId = campaignId;
    this.campaignName = campaignName;
    this.targetProfileName = targetProfileName;
    this.userFirstName = userFirstName;
    this.userLastName = userLastName;
    this.enhancedTargetProfile = enhancedTargetProfile;

    // Added after fetching individual informations
    this.campaignLabel = null;
    this.progression = null;
    this.startedAt = null;
    this.isShared = null;

    // Added after fetching individual informations and campaign shared
    this.sharedAt = null;
    this.knowledgeElementsValidatedPercentage = null;
  }

  getRawData() {
    return this;
  }

  addIndividualStatistics({ assessment, campaignParticipation, allKnowledgeElements }) {
    this.startedAt = moment.utc(assessment.createdAt).format('YYYY-MM-DD'),
    this.progression = assessment.isCompleted ? 1 : this.enhancedTargetProfile.getProgression(allKnowledgeElements),
    this.campaignLabel = campaignParticipation.participantExternalId,
    this.isShared = campaignParticipation.isShared ? 'Oui' : 'Non';

    this.enhancedTargetProfile.knowledgeElements = allKnowledgeElements.filter(_knowledgeElementRelatedTo(this.enhancedTargetProfile.skills));
    enhanceTargetProfileCompetencesAndAreas(this.enhancedTargetProfile);
  }

  addIndividualStatisticsWhenShared({ assessment, campaignParticipation, allKnowledgeElements }) {
    this.addIndividualStatistics({ assessment, campaignParticipation, allKnowledgeElements });
    this.sharedAt = moment.utc(campaignParticipation.sharedAt).format('YYYY-MM-DD');
    this.knowledgeElementsValidatedPercentage = this.enhancedTargetProfile.getKnowledgeElementsValidatedPercentage(this.enhancedTargetProfile.knowledgeElements);
  }

  static buildFrom({ campaign, user, targetProfile, competences, organization }) {

    // make enhanced targetProfile
    const enhancedTargetProfile = enhanceTargetProfile(targetProfile, competences);

    // return object
    return new CampaignIndividualResult({
      organizationName: organization.name,
      campaignId: campaign.id,
      campaignName: campaign.name,
      targetProfileName: targetProfile.name,
      userFirstName: user.firstName,
      userLastName: user.lastName,
      enhancedTargetProfile,
    });
  }
}

function _knowledgeElementRelatedTo(skills) {
  return (knowledgeElement) => _(skills).map('id').includes(knowledgeElement.skillId);
}

function enhanceTargetProfile(targetProfile, competences) {
  const enhancedTargetProfile = _.assign(targetProfile, {
    skillNames: _.map(targetProfile.skills, 'name'),
    skillIds: _.map(targetProfile.skills, 'id'),
  });
  enhancedTargetProfile.competences = competences.filter(_competenceRelatedTo(enhancedTargetProfile.skillIds));
  enhancedTargetProfile.areas = _(enhancedTargetProfile.competences).map('area').map(addProperties({ numberSkillsValidated: 0, numberSkillsTested: 0 })).value();
  return enhancedTargetProfile;
}

function _competenceRelatedTo(skillIds) {
  return (competence) => skillIds.some((skillId) => competence.skills.includes(skillId));
}

function enhanceTargetProfileCompetencesAndAreas(enhancedTargetProfile) {
  return _.each(enhancedTargetProfile.competences, (competence) => {
    const skillsForThisCompetence = enhancedTargetProfile.getSkillsInCompetence(competence);
    const numberOfSkillsValidatedForThisCompetence = _getValidatedSkillsForCompetence(skillsForThisCompetence, enhancedTargetProfile.knowledgeElements);

    competence.skillsForThisCompetence = enhancedTargetProfile.getSkillsInCompetence(competence);
    competence.numberOfSkillsValidatedForThisCompetence = numberOfSkillsValidatedForThisCompetence;
    competence.percentage = _.round(competence.numberOfSkillsValidatedForThisCompetence / skillsForThisCompetence.length, 2);

    const areaForThisCompetence = enhancedTargetProfile.areas.find((area) => area.title === competence.area.title);
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

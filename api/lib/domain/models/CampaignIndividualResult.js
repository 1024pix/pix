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
  }

  getRawData() {
    return this;
  }

  addIndividualStatistics({ assessment, campaignParticipation, enhancedTargetProfile, allKnowledgeElements }) {
    this.startedAt = moment.utc(assessment.createdAt).format('YYYY-MM-DD'),
    this.progression = assessment.isCompleted ? 1 : enhancedTargetProfile.getProgression(allKnowledgeElements),
    this.campaignLabel = campaignParticipation.participantExternalId,
    this.isShared = campaignParticipation.isShared ? 'Oui' : 'Non';
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

module.exports = CampaignIndividualResult;

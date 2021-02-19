const buildAssessment = require('./build-assessment');
const buildCampaign = require('./build-campaign');
const buildCampaignParticipation = require('./build-campaign-participation');
const buildTargetProfileSkill = require('./build-target-profile-skill');
const buildTargetProfile = require('./build-target-profile');
const Assessment = require('../../../lib/domain/models/Assessment');

module.exports = {
  build({
    userId,
    createdAt,
    sharedAt,
    assessmentCreatedAt,
    assessmentState,
    campaignId,
    id,
  } = {}) {

    const campaignParticipation = buildCampaignParticipation({
      userId,
      campaignId,
      createdAt: createdAt,
      sharedAt: sharedAt,
      isShared: sharedAt ? true : false,
    });

    buildAssessment({
      id,
      userId,
      campaignParticipationId: campaignParticipation.id,
      state: assessmentState,
      createdAt: assessmentCreatedAt,
    });

    return campaignParticipation;
  },

  buildOnGoing({
    userId,
    createdAt,
    assessmentCreatedAt,
    targetProfileSkills,
  } = {}) {
    const targetProfile = buildTargetProfile();
    targetProfileSkills.forEach((skill) => buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: skill }));
    const campaign = buildCampaign({ targetProfileId: targetProfile.id });

    const campaignParticipation = buildCampaignParticipation({
      userId,
      createdAt: createdAt,
      sharedAt: null,
      isShared: false,
      campaignId: campaign.id,
    });

    buildAssessment({
      userId,
      campaignParticipationId: campaignParticipation.id,
      state: Assessment.states.STARTED,
      createdAt: assessmentCreatedAt,
    });

    return campaignParticipation;
  },

  buildToShare({
    userId,
    createdAt,
    assessmentCreatedAt,
    targetProfileSkills,
  } = {}) {
    const targetProfile = buildTargetProfile();
    targetProfileSkills.forEach((skill) => buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: skill }));
    const campaign = buildCampaign({ targetProfileId: targetProfile.id });

    const campaignParticipation = buildCampaignParticipation({
      userId,
      createdAt: createdAt,
      sharedAt: null,
      isShared: false,
      campaignId: campaign.id,
    });

    buildAssessment({
      userId,
      campaignParticipationId: campaignParticipation.id,
      state: Assessment.states.COMPLETED,
      createdAt: assessmentCreatedAt,
    });

    return campaignParticipation;
  },

  buildEnded({
    userId,
    createdAt,
    sharedAt,
    assessmentCreatedAt,
    targetProfileSkills,
  } = {}) {

    const targetProfile = buildTargetProfile();
    targetProfileSkills.forEach((skill) => buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: skill }));
    const campaign = buildCampaign({ targetProfileId: targetProfile.id });

    const campaignParticipation = buildCampaignParticipation({
      userId,
      createdAt: createdAt,
      sharedAt: sharedAt || createdAt,
      isShared: true,
      campaignId: campaign.id,
    });

    buildAssessment({
      userId,
      campaignParticipationId: campaignParticipation.id,
      state: Assessment.states.COMPLETED,
      createdAt: assessmentCreatedAt,
    });

    return campaignParticipation;
  },

  buildArchived({
    userId,
    createdAt,
    sharedAt,
    assessmentCreatedAt,
    campaignArchivedAt = new Date('1998-07-01'),
    targetProfileSkills,
  } = {}) {

    const targetProfile = buildTargetProfile();
    targetProfileSkills.forEach((skill) => buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: skill }));
    const campaign = buildCampaign({ targetProfileId: targetProfile.id, archivedAt: campaignArchivedAt });

    const campaignParticipation = buildCampaignParticipation({
      userId,
      campaignId: campaign.id,
      createdAt: createdAt,
      sharedAt: sharedAt || createdAt,
      isShared: false,
    });

    buildAssessment({
      userId,
      campaignParticipationId: campaignParticipation.id,
      createdAt: assessmentCreatedAt,
    });

    return campaignParticipation;
  },
};


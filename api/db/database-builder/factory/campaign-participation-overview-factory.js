import { buildAssessment } from './build-assessment.js';
import { buildCampaign } from './build-campaign.js';
import { buildCampaignParticipation } from './build-campaign-participation.js';
import { buildCampaignSkill } from './build-campaign-skill.js';
import { buildUser } from './build-user.js';
import { Assessment } from '../../../src/shared/domain/models/Assessment.js';
import { CampaignParticipationStatuses } from '../../../src/prescription/shared/domain/constants.js';

const { STARTED, SHARED, TO_SHARE } = CampaignParticipationStatuses;

const build = function ({
  userId,
  createdAt,
  sharedAt,
  assessmentCreatedAt,
  assessmentState,
  campaignId,
  deletedAt,
  deletedBy,
  id,
} = {}) {
  const status = assessmentState === Assessment.states.COMPLETED ? TO_SHARE : STARTED;

  const campaignParticipation = buildCampaignParticipation({
    userId,
    campaignId,
    createdAt: createdAt,
    sharedAt: sharedAt,
    status: sharedAt ? SHARED : status,
    deletedAt,
    deletedBy,
  });

  buildAssessment({
    id,
    userId,
    campaignParticipationId: campaignParticipation.id,
    state: assessmentState,
    createdAt: assessmentCreatedAt,
  });

  return campaignParticipation;
};

const buildOnGoing = function ({ userId, createdAt, assessmentCreatedAt, campaignSkills } = {}) {
  const campaign = buildCampaign();
  campaignSkills.forEach((skill) => buildCampaignSkill({ campaignId: campaign.id, skillId: skill }));

  const campaignParticipation = buildCampaignParticipation({
    userId,
    createdAt: createdAt,
    sharedAt: null,
    status: STARTED,
    campaignId: campaign.id,
  });

  buildAssessment({
    userId,
    campaignParticipationId: campaignParticipation.id,
    state: Assessment.states.STARTED,
    createdAt: assessmentCreatedAt,
  });

  return campaignParticipation;
};

const buildToShare = function ({ userId, createdAt, assessmentCreatedAt, campaignSkills } = {}) {
  const campaign = buildCampaign();
  campaignSkills.forEach((skill) => buildCampaignSkill({ campaignId: campaign.id, skillId: skill }));

  const campaignParticipation = buildCampaignParticipation({
    userId,
    createdAt: createdAt,
    sharedAt: null,
    status: TO_SHARE,
    campaignId: campaign.id,
  });

  buildAssessment({
    userId,
    campaignParticipationId: campaignParticipation.id,
    state: Assessment.states.COMPLETED,
    createdAt: assessmentCreatedAt,
  });

  return campaignParticipation;
};

const buildEnded = function ({ userId, createdAt, sharedAt, assessmentCreatedAt, campaignSkills } = {}) {
  const campaign = buildCampaign();
  campaignSkills.forEach((skill) => buildCampaignSkill({ campaignId: campaign.id, skillId: skill }));

  const campaignParticipation = buildCampaignParticipation({
    userId,
    createdAt: createdAt,
    sharedAt: sharedAt || createdAt,
    campaignId: campaign.id,
  });

  buildAssessment({
    userId,
    campaignParticipationId: campaignParticipation.id,
    state: Assessment.states.COMPLETED,
    createdAt: assessmentCreatedAt,
  });

  return campaignParticipation;
};

const buildArchived = function ({
  userId,
  createdAt,
  sharedAt,
  assessmentCreatedAt,
  campaignArchivedAt = new Date('1998-07-01'),
  campaignSkills,
} = {}) {
  const campaign = buildCampaign({ archivedAt: campaignArchivedAt });
  campaignSkills.forEach((skill) => buildCampaignSkill({ campaignId: campaign.id, skillId: skill }));

  const campaignParticipation = buildCampaignParticipation({
    userId,
    campaignId: campaign.id,
    createdAt: createdAt,
    sharedAt: sharedAt || createdAt,
    status: STARTED,
  });

  buildAssessment({
    userId,
    campaignParticipationId: campaignParticipation.id,
    createdAt: assessmentCreatedAt,
  });

  return campaignParticipation;
};

const buildDeleted = function ({
  userId,
  createdAt,
  sharedAt,
  assessmentCreatedAt,
  deletedAt = new Date('1998-07-01'),
  deletedBy = buildUser().id,
  campaignSkills,
} = {}) {
  const campaign = buildCampaign();
  campaignSkills.forEach((skill) => buildCampaignSkill({ campaignId: campaign.id, skillId: skill }));

  const campaignParticipation = buildCampaignParticipation({
    userId,
    campaignId: campaign.id,
    createdAt: createdAt,
    sharedAt: sharedAt || createdAt,
    deletedAt,
    deletedBy,
    status: STARTED,
  });

  buildAssessment({
    userId,
    campaignParticipationId: campaignParticipation.id,
    createdAt: assessmentCreatedAt,
  });

  return campaignParticipation;
};

export { build, buildOnGoing, buildToShare, buildEnded, buildArchived, buildDeleted };

import { CampaignParticipationStatuses } from '../../../src/prescription/shared/domain/constants.ts';
import { Assessment } from '../../../src/shared/domain/models/Assessment.js';
import { buildAssessment } from './build-assessment.js';
import { buildCampaign } from './build-campaign.js';
import { buildCampaignParticipation } from './build-campaign-participation.js';
import { buildCampaignSkill } from './build-campaign-skill.js';
import { buildOrganizationLearner } from './build-organization-learner.js';
import { buildUser } from './build-user.js';

const { STARTED, SHARED } = CampaignParticipationStatuses;

const build = function ({
  organizationLearnerId,
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
  const campaignParticipation = buildCampaignParticipation({
    organizationLearnerId,
    userId,
    campaignId,
    createdAt: createdAt,
    sharedAt: sharedAt,
    status: sharedAt ? SHARED : STARTED,
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

const buildDeletedAndAnonymised = function ({
  userId,
  createdAt,
  sharedAt,
  organizationLearnerId,
  assessmentCreatedAt,
  assessmentUpdatedAt,
  deletedAt = new Date('1998-07-01'),
  deletedBy = buildUser().id,
  campaignSkills,
} = {}) {
  const campaign = buildCampaign();
  campaignSkills.forEach((skill) => buildCampaignSkill({ campaignId: campaign.id, skillId: skill }));
  const learnerId = organizationLearnerId || buildOrganizationLearner({ userId, campaignId: campaign.id }).id;

  const campaignParticipation = buildCampaignParticipation({
    organizationLearnerId: learnerId,
    campaignId: campaign.id,
    createdAt: createdAt,
    sharedAt: sharedAt || createdAt,
    deletedAt,
    deletedBy,
    status: SHARED,
  });

  const assessment = buildAssessment({
    userId,
    campaignParticipationId: null,
    createdAt: assessmentCreatedAt,
    updatedAt: assessmentUpdatedAt || assessmentCreatedAt,
    type: Assessment.types.CAMPAIGN,
    state: Assessment.states.COMPLETED,
  });

  return { assessment, campaignParticipation };
};

export { build, buildArchived, buildDeleted, buildDeletedAndAnonymised, buildEnded, buildOnGoing };

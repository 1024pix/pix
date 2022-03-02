const buildCampaign = require('./build-campaign');
const buildUser = require('./build-user');
const buildSchoolingRegistration = require('./build-schooling-registration');
const databaseBuffer = require('../database-buffer');
const CampaignParticipationStatuses = require('../../../lib/domain/models/CampaignParticipationStatuses');
const _ = require('lodash');

const { SHARED } = CampaignParticipationStatuses;

module.exports = function buildCampaignParticipation({
  id = databaseBuffer.getNextId(),
  campaignId,
  createdAt = new Date('2020-01-01'),
  sharedAt = new Date('2020-01-02'),
  userId,
  schoolingRegistrationId,
  participantExternalId = 'participantExternalId',
  validatedSkillsCount,
  masteryRate,
  pixScore,
  status = SHARED,
  isImproved = false,
  deletedAt = null,
  deletedBy = null,
} = {}) {
  userId = _.isUndefined(userId) ? buildUser().id : userId;
  schoolingRegistrationId = _.isUndefined(schoolingRegistrationId)
    ? buildSchoolingRegistration().id
    : schoolingRegistrationId;
  campaignId = _.isUndefined(campaignId) ? buildCampaign().id : campaignId;
  const isShared = status === SHARED;
  sharedAt = isShared ? sharedAt : null;

  const values = {
    id,
    campaignId,
    userId,
    schoolingRegistrationId,
    createdAt,
    sharedAt,
    participantExternalId,
    validatedSkillsCount,
    masteryRate,
    pixScore,
    status,
    isImproved,
    deletedAt,
    deletedBy,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'campaign-participations',
    values,
  });
};

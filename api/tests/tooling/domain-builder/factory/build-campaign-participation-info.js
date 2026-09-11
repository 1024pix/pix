import { CampaignParticipationInfo } from '../../../../src/prescription/campaign/domain/read-models/CampaignParticipationInfo.js';
import { CampaignParticipationStatuses } from '../../../../src/prescription/shared/domain/constants.ts';

function buildCampaignParticipationInfo({
  participantFirstName = 'participantFirstName',
  participantLastName = 'participantLastName',
  participantExternalId = 'participantExternalId',
  studentNumber = '123ABC',
  userId = 123,
  campaignParticipationId = 999,
  isCompleted = true,
  createdAt = new Date('2020-01-01'),
  sharedAt = new Date('2020-02-02'),
  division,
  group,
  masteryRate = 1,
  additionalInfos = null,
  status = CampaignParticipationStatuses.SHARED,
  pixScore = 120,
} = {}) {
  return new CampaignParticipationInfo({
    participantFirstName,
    participantLastName,
    participantExternalId,
    studentNumber,
    userId,
    campaignParticipationId,
    isCompleted,
    createdAt,
    sharedAt,
    division,
    group,
    masteryRate,
    additionalInfos,
    status,
    pixScore,
  });
}

export { buildCampaignParticipationInfo };

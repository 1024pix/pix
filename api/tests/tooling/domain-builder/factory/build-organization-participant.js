import { OrganizationParticipant } from '../../../../src/prescription/organization-learner/domain/read-models/OrganizationParticipant.js';

function buildOrganizationParticipant({
  id = 345,
  firstName = 'first-name',
  lastName = 'last-name',
  participationCount = 0,
  lastParticipationDate = null,
  campaignName = null,
  campaignType = null,
  participationStatus = null,
  isCertifiableFromCampaign = false,
  certifiableAtFromCampaign = false,
  isCertifiableFromLearner = false,
  certifiableAtFromLearner = false,
  extraColumns,
} = {}) {
  return new OrganizationParticipant({
    id,
    firstName,
    lastName,
    participationCount,
    lastParticipationDate,
    campaignName,
    campaignType,
    participationStatus,
    isCertifiableFromCampaign,
    certifiableAtFromCampaign,
    isCertifiableFromLearner,
    certifiableAtFromLearner,
    ...extraColumns,
  });
}

export { buildOrganizationParticipant };

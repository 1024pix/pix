import { CampaignParticipantActivity } from '../../../../../../src/prescription/campaign/domain/read-models/CampaignParticipantActivity.js';
import { CampaignParticipationStatuses } from '../../../../../../src/shared/domain/models/index.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Domain | Read-Models | CampaignResults | CampaignParticipantActivity', function () {
  describe('constructor', function () {
    it('should correctly initialize the information about campaign participant activity', function () {
      const sharedAt = new Date();

      const campaignParticipantActivity = new CampaignParticipantActivity({
        campaignParticipationId: 45,
        firstName: 'Lidia',
        lastName: 'Aguilar',
        userId: 123,
        participantExternalId: 'Alba67',
        sharedAt,
        status: CampaignParticipationStatuses.SHARED,
        lastCampaignParticipationId: null,
        participationCount: null,
      });

      expect(campaignParticipantActivity).to.deep.equal({
        campaignParticipationId: 45,
        firstName: 'Lidia',
        lastName: 'Aguilar',
        userId: 123,
        participantExternalId: 'Alba67',
        sharedAt,
        status: CampaignParticipationStatuses.SHARED,
        lastCampaignParticipationId: 45,
        participationCount: 0,
      });
    });

    it('should use lastCampaignParticipationId if provided', function () {
      const lastCampaignParticipationId = 42;

      const campaignParticipantActivity = new CampaignParticipantActivity({
        campaignParticipationId: 45,
        firstName: 'Lidia',
        lastName: 'Aguilar',
        userId: 123,
        participantExternalId: 'Alba67',
        sharedAt: new Date(),
        status: CampaignParticipationStatuses.SHARED,
        lastCampaignParticipationId: lastCampaignParticipationId,
      });

      expect(campaignParticipantActivity.lastCampaignParticipationId).to.deep.equal(lastCampaignParticipationId);
    });
  });
});

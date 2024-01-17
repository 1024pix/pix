import { expect } from '../../../../../test-helper.js';
import { CampaignParticipantActivity } from '../../../../../../src/prescription/campaign/domain/read-models/CampaignParticipantActivity.js';
import { CampaignParticipationStatuses } from '../../../../../../lib/domain/models/index.js';

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
        lastSharedCampaignParticipationId: null,
      });

      expect(campaignParticipantActivity).to.deep.equal({
        campaignParticipationId: 45,
        firstName: 'Lidia',
        lastName: 'Aguilar',
        userId: 123,
        participantExternalId: 'Alba67',
        sharedAt,
        status: CampaignParticipationStatuses.SHARED,
        lastSharedOrCurrentCampaignParticipationId: 45,
      });
    });
    it('should lastSharedCampaignParticipationId if provided', function () {
      const lastSharedCampaignParticipationId = 42;

      const campaignParticipantActivity = new CampaignParticipantActivity({
        campaignParticipationId: 45,
        firstName: 'Lidia',
        lastName: 'Aguilar',
        userId: 123,
        participantExternalId: 'Alba67',
        sharedAt: new Date(),
        status: CampaignParticipationStatuses.SHARED,
        lastSharedCampaignParticipationId: lastSharedCampaignParticipationId,
      });

      expect(campaignParticipantActivity.lastSharedOrCurrentCampaignParticipationId).to.deep.equal(
        lastSharedCampaignParticipationId,
      );
    });
  });
});

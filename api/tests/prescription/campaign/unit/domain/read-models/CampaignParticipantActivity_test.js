import { expect } from '../../../../../test-helper.js';
import { CampaignParticipantActivity } from '../../../../../../src/prescription/campaign/domain/read-models/CampaignParticipantActivity.js';
import { CampaignParticipationStatuses } from '../../../../../../lib/domain/models/index.js';

describe('Unit | Domain | Read-Models | CampaignResults | CampaignAssessmentParticipationResultMinimal', function () {
  describe('constructor', function () {
    it('should correctly initialize the information about campaign participation result', function () {
      const campaignParticipantActivity = new CampaignParticipantActivity({
        campaignParticipationId: 45,
        firstName: 'Lidia',
        lastName: 'Aguilar',
        userId: 123,
        participantExternalId: 'Alba67',
        sharedAt: new Date(),
        status: CampaignParticipationStatuses.SHARED,
      });

      expect(campaignParticipantActivity).to.deep.equal({
        campaignParticipationId: 45,
        firstName: 'Lidia',
        lastName: 'Aguilar',
        userId: 123,
        participantExternalId: 'Alba67',
        sharedAt: new Date(),
        status: CampaignParticipationStatuses.SHARED,
      });
    });
  });
});

import { expect } from '../../../../test-helper';
import CampaignManagement from '../../../../../lib/domain/read-models/CampaignManagement';

describe('campaignManagement', function () {
  describe('#totalParticipationsCount', function () {
    it('returns total participations count', function () {
      const campaignManagement = new CampaignManagement({
        id: 1,
        name: 'Assessment101',
        shared: 5,
        started: 3,
        completed: 2,
      });

      expect(campaignManagement.totalParticipationsCount).to.equal(10);
    });

    it('returns total participations count when started is undifined', function () {
      const campaignManagement = new CampaignManagement({
        id: 1,
        name: 'Assessment101',
        shared: 5,
        started: undefined,
        completed: 2,
      });

      expect(campaignManagement.totalParticipationsCount).to.equal(7);
    });
  });
});

import { expect } from '../../../../../test-helper.js';
import { CampaignManagement } from '../../../../../../src/prescription/campaign/domain/models/CampaignManagement.js';

describe('CampaignManagement', function () {
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

  describe('#updateFields', function () {
    it('update only field existing on model', function () {
      const campaignManagement = new CampaignManagement({
        id: 1,
        name: 'Assessment101',
        title: 'Minus One',
        shared: 5,
        started: undefined,
        completed: 2,
        multipleSendings: true,
      });

      campaignManagement.updateFields({ name: 'GodZilla', toto: 'toto', multipleSendings: undefined });

      expect(campaignManagement.name).to.be.equal('GodZilla');
      expect(campaignManagement.title).to.be.equal('Minus One');
      expect(campaignManagement.multipleSendings).to.be.true;
      expect(campaignManagement.toto).to.be.undefined;
    });
  });
});

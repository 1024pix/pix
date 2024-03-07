import { Campaign } from '../../../../../../src/prescription/campaign/domain/models/Campaign.js';
import { expect } from '../../../../../test-helper.js';

describe('Campaign', function () {
  describe('#updateFields', function () {
    it('update only field existing on model', function () {
      const campaign = new Campaign({
        id: 1,
        name: 'Assessment101',
        title: 'Minus One',
        multipleSendings: true,
      });

      campaign.updateFields({ name: 'GodZilla', toto: 'toto', multipleSendings: undefined });

      expect(campaign.name).to.be.equal('GodZilla');
      expect(campaign.title).to.be.equal('Minus One');
      expect(campaign.multipleSendings).to.be.true;
      expect(campaign.toto).to.be.undefined;
    });
  });
});

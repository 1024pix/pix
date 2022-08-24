const { expect, catchErr } = require('../../../test-helper');
const Campaign = require('../../../../lib/domain/models/CampaignForArchiving');
const { ArchivedCampaignError, ObjectValidationError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Models | CampaignForArchiving', function () {
  describe('#archive', function () {
    it('archives the campaigns', function () {
      const campaign = new Campaign({ id: 1, code: 'ABC123', archivedAt: null, archivedBy: null });

      campaign.archive('2023-02-27', 1);

      expect(campaign).to.deep.equal({ id: 1, code: 'ABC123', archivedAt: '2023-02-27', archivedBy: 1 });
    });

    context('when the campaign is already archived', function () {
      it('archives the campaigns', async function () {
        const campaign = new Campaign({ id: 1, code: 'ABC123', archivedAt: '2023-01-01', archivedBy: 2 });

        const error = await catchErr(campaign.archive, campaign)('2023-02-27', 1);

        expect(error).to.be.an.instanceOf(ArchivedCampaignError);
      });
    });

    context('when the given date is  null', function () {
      it('throws an exception', async function () {
        const campaign = new Campaign({ id: 1, code: 'ABC123', archivedAt: null, archivedBy: null });

        const error = await catchErr(campaign.archive, campaign)(null, 1);

        expect(error).to.be.an.instanceOf(ObjectValidationError);
      });
    });

    context('when the given userId is null', function () {
      it('throws an exception', async function () {
        const campaign = new Campaign({ id: 1, code: 'ABC123', archivedAt: null, archivedBy: null });

        const error = await catchErr(campaign.archive, campaign)('2023-02-27', null);

        expect(error).to.be.an.instanceOf(ObjectValidationError);
      });
    });
  });

  describe('#unarchive', function () {
    it('unarchives the campaigns', function () {
      const campaign = new Campaign({ id: 1, code: 'ABC123', archivedAt: new Date('2022-01-01'), archivedBy: 1 });

      campaign.unarchive();

      expect(campaign).to.deep.equal({ id: 1, code: 'ABC123', archivedAt: null, archivedBy: null });
    });
  });
});

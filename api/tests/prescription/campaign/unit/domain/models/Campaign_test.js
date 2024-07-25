import sinon from 'sinon';

import {
  ArchivedCampaignError,
  CampaignCodeFormatError,
  DeletedCampaignError,
} from '../../../../../../src/prescription/campaign/domain/errors.js';
import { Campaign } from '../../../../../../src/prescription/campaign/domain/models/Campaign.js';
import { ObjectValidationError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, expect } from '../../../../../test-helper.js';

describe('Campaign', function () {
  let campaign;
  let clock;
  const now = new Date('2022-11-28T12:00:00Z');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    campaign = new Campaign({
      id: 1,
      code: 'RIGHTCODE',
      name: 'Assessment101',
      title: 'Minus One',
      multipleSendings: true,
    });
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#isDeleted', function () {
    it('returns true', function () {
      campaign = new Campaign({
        deletedAt: new Date(),
        deletedBy: 1,
      });

      expect(campaign.isDeleted).to.be.true;
    });

    it('returns false', function () {
      campaign = new Campaign({
        deletedAt: null,
        deletedBy: null,
      });

      expect(campaign.isDeleted).to.be.false;
    });
  });

  describe('#delete', function () {
    it('deletes the campaign', function () {
      const campaign = new Campaign({ id: 1, code: 'ABC123' });

      campaign.delete(1);

      expect(campaign).to.deep.includes({ id: 1, code: 'ABC123', deletedAt: now, deletedBy: 1 });
    });

    context('when the campaign is already deleted', function () {
      it('throws an exception', async function () {
        const campaign = new Campaign({ id: 1, code: 'ABC123', deletedAt: new Date('2023-01-01'), deletedBy: 2 });

        const error = await catchErr(campaign.delete, campaign)(1);

        expect(error).to.be.an.instanceOf(DeletedCampaignError);
      });
    });

    context('when the given userId is not provided', function () {
      it('throws an exception', async function () {
        const campaign = new Campaign({ id: 1, code: 'ABC123' });

        const error = await catchErr(campaign.delete, campaign)();

        expect(error).to.be.an.instanceOf(ObjectValidationError);
      });
    });
  });

  describe('#archive', function () {
    it('archives the campaigns', function () {
      const campaign = new Campaign({ id: 1, code: 'ABC123', archivedAt: null, archivedBy: null });

      campaign.archive('2023-02-27', 1);

      expect(campaign).to.deep.includes({ id: 1, code: 'ABC123', archivedAt: '2023-02-27', archivedBy: 1 });
    });

    context('when the campaign is already archived', function () {
      it('throws an exception', async function () {
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

      expect(campaign).to.deep.includes({ id: 1, code: 'ABC123', archivedAt: null, archivedBy: null });
    });
  });

  describe('#updateFields', function () {
    it('update only field existing on model', function () {
      campaign.updateFields({ name: 'GodZilla', toto: 'toto', multipleSendings: undefined });

      expect(campaign.name).to.be.equal('GodZilla');
      expect(campaign.title).to.be.equal('Minus One');
      expect(campaign.multipleSendings).to.be.true;
      expect(campaign.toto).to.be.undefined;
    });

    describe('#code', function () {
      it('should throw an error if the code format is not respected', async function () {
        const error = await catchErr(campaign.updateFields, campaign)({ code: 'WRONG' });

        expect(error).to.be.instanceOf(CampaignCodeFormatError);
      });

      it('should not update code if not provided', async function () {
        const originalCode = campaign.code;

        campaign.updateFields({ name: 'Something' });

        expect(campaign.code).to.equal(originalCode);
      });

      it('should return false if code is less than 9 char', async function () {
        const error = await catchErr(campaign.updateFields, campaign)({ code: 'ABC123' });

        expect(error).to.be.ok;
      });

      it('should return false if code is more than 9 char', async function () {
        const error = await catchErr(campaign.updateFields, campaign)({ code: 'ABC123ABC123' });

        expect(error).to.be.ok;
      });

      it('should return false if code contains char other than uppercase Alphanumeric or numbers', async function () {
        const error = await catchErr(campaign.updateFields, campaign)({ code: 'abc abc @' });

        expect(error).to.be.instanceOf(CampaignCodeFormatError);
      });

      it('should return true if code contains only uppercase alphanumeric chars', function () {
        const expectedCode = '123ABDCDE';

        campaign.updateFields({ code: expectedCode });

        expect(campaign.code).to.equal(expectedCode);
      });
    });
  });
});

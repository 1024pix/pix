import sinon from 'sinon';

import {
  ArchivedCampaignError,
  CampaignCodeFormatError,
  DeletedCampaignError,
} from '../../../../../../src/prescription/campaign/domain/errors.js';
import { Campaign } from '../../../../../../src/prescription/campaign/domain/models/Campaign.js';
import { CampaignTypes } from '../../../../../../src/prescription/shared/domain/constants.js';
import { ObjectValidationError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Campaign', function () {
  let campaign;
  let clock;
  const now = new Date('2022-11-28T12:00:00Z');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    campaign = new Campaign({
      id: 1,
      type: CampaignTypes.ASSESSMENT,
      ownerId: 12,
      creatorId: 12,
      organizationId: 1,
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
    context('when the campaign is already deleted', function () {
      it('throws an exception', async function () {
        const campaign = new Campaign({ id: 1, code: 'ABC123', deletedAt: new Date('2023-01-01'), deletedBy: 2 });

        const error = await catchErr(campaign.delete, campaign)(1);

        expect(error).to.be.an.instanceOf(DeletedCampaignError);
      });

      it('not throws when keepPreviousDeletion is true', async function () {
        const campaign = new Campaign({ id: 1, code: 'ABC123', deletedAt: new Date('2023-01-01'), deletedBy: 2 });

        campaign.delete(1, { keepPreviousDeletion: true });

        expect(campaign.name).equal('(anonymized)');
      });
    });

    context('when the given userId is not provided', function () {
      it('throws an exception', async function () {
        const campaign = new Campaign({ id: 1, code: 'ABC123' });

        const error = await catchErr(campaign.delete, campaign)();

        expect(error).to.be.an.instanceOf(ObjectValidationError);
      });
    });

    it('anonymize datas', async function () {
      // given
      const campaign = new Campaign({
        name: 'Ma campagne',
        title: 'Title',
        customLandingPageText: 'customLandingPageText',
        externalIdHelpImageUrl: 'externalIdHelpImageUrl',
        alternativeTextToExternalIdHelpImage: 'alternativeTextToExternalIdHelpImage',
        customResultPageText: 'customResultPageText',
        customResultPageButtonText: 'customResultPageButtonText',
        customResultPageButtonUrl: 'customResultPageButtonUrl',
      });

      // when
      campaign.delete(1);

      // then
      expect(campaign.name).to.equal('(anonymized)');
      expect(campaign.title).to.be.null;
      expect(campaign.customLandingPageText).to.be.null;
      expect(campaign.externalIdHelpImageUrl).to.be.null;
      expect(campaign.alternativeTextToExternalIdHelpImage).to.be.null;
      expect(campaign.customResultPageText).to.be.null;
      expect(campaign.customResultPageButtonText).to.be.null;
      expect(campaign.customResultPageButtonUrl).to.be.null;
      expect(campaign.deletedAt).deep.equal(now);
      expect(campaign.deletedBy).equal(1);
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

  describe('getters', function () {
    [
      {
        getter: 'isAssessment',

        isTrueForType: CampaignTypes.ASSESSMENT,
      },
      {
        getter: 'isProfilesCollection',

        isTrueForType: CampaignTypes.PROFILES_COLLECTION,
      },
      {
        getter: 'isExam',

        isTrueForType: CampaignTypes.EXAM,
      },
    ].forEach(({ getter, isTrueForType }) => {
      describe('#' + getter, function () {
        Object.values(CampaignTypes).forEach((campaignType) => {
          const expected = campaignType === isTrueForType;
          it(`should return ${expected} when campaign is of type ${campaignType}`, function () {
            // given
            const campaign = new Campaign({
              type: campaignType,
            });

            // when / then
            expect(campaign[getter]).to.equal(expected);
          });
        });
      });
    });
  });
});

import {
  ArchivedCampaignError,
  DeletedCampaignError,
} from '../../../../../../src/prescription/campaign/domain/errors.js';
import { getPresentationSteps } from '../../../../../../src/prescription/campaign/domain/usecases/get-presentation-steps.js';
import { LOCALE } from '../../../../../../src/shared/domain/constants.js';
import { CampaignCodeError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, expect, sinon } from '../../../../../test-helper.js';

const { FRENCH_SPOKEN } = LOCALE;

describe('Unit | Domain | Use Cases | get-presentation-steps', function () {
  let badgeRepository;
  let campaignRepository;
  let learningContentRepository;

  const locale = FRENCH_SPOKEN;
  const campaignCode = 'someCampaignCode';

  beforeEach(function () {
    badgeRepository = { findByCampaignId: sinon.stub() };
    campaignRepository = { getByCode: sinon.stub() };
    learningContentRepository = { findByCampaignId: sinon.stub() };
  });

  context('when campaign exists', function () {
    context('when campaign is archived', function () {
      it('should throw an error', async function () {
        // given
        campaignRepository.getByCode.withArgs(campaignCode).resolves({
          archivedAt: new Date(),
        });

        // when
        const error = await catchErr(getPresentationSteps)({
          campaignCode,
          locale,
          campaignRepository,
          badgeRepository,
          learningContentRepository,
        });

        // then
        expect(error).to.be.instanceOf(ArchivedCampaignError);
      });
    });

    context('when campaign is deleted', function () {
      it('should throw an error', async function () {
        // given
        campaignRepository.getByCode.withArgs(campaignCode).resolves({
          deletedAt: new Date(),
        });

        // when
        const error = await catchErr(getPresentationSteps)({
          campaignCode,
          locale,
          campaignRepository,
          badgeRepository,
          learningContentRepository,
        });

        // then
        expect(error).to.be.instanceOf(DeletedCampaignError);
      });
    });
  });

  context('when campaign does not exist', function () {
    it('should throw an error', async function () {
      // given
      campaignRepository.getByCode.withArgs(campaignCode).resolves(null);

      // when
      const error = await catchErr(getPresentationSteps)({
        campaignCode,
        locale,
        campaignRepository,
        badgeRepository,
        learningContentRepository,
      });

      // then
      expect(error).to.be.instanceOf(CampaignCodeError);
    });
  });
});

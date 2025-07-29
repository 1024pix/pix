import {
  ArchivedCampaignError,
  DeletedCampaignError,
} from '../../../../../../src/prescription/campaign/domain/errors.js';
import { getPresentationSteps } from '../../../../../../src/prescription/campaign/domain/usecases/get-presentation-steps.js';
import { CampaignCodeError, UserNotAuthorizedToAccessEntityError } from '../../../../../../src/shared/domain/errors.js';
import { FRENCH_SPOKEN } from '../../../../../../src/shared/domain/services/locale-service.js';
import { catchErr, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Domain | Use Cases | get-presentation-steps', function () {
  let badgeRepository;
  let campaignRepository;
  let campaignParticipationRepository;
  let learningContentRepository;

  const locale = FRENCH_SPOKEN;
  const campaignCode = 'someCampaignCode';

  beforeEach(function () {
    badgeRepository = { findByCampaignId: sinon.stub() };
    campaignRepository = {
      getByCode: sinon.stub(),
      checkIfUserOrganizationHasAccessToCampaign: sinon.stub(),
    };
    campaignParticipationRepository = {
      findOneByCampaignIdAndUserId: sinon.stub(),
    };
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

    context('when user does not have access to the campaign', function () {
      it('should throw an error', async function () {
        const userId = Symbol('user-id');
        const campaignId = Symbol('campaign-id');

        campaignRepository.getByCode.withArgs(campaignCode).resolves({ id: campaignId });
        campaignParticipationRepository.findOneByCampaignIdAndUserId.withArgs({ campaignId, userId }).resolves(null);

        // when
        const error = await catchErr(getPresentationSteps)({
          userId,
          campaignCode,
          locale,
          campaignRepository,
          campaignParticipationRepository,
          badgeRepository,
          learningContentRepository,
        });

        // then
        expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
      });
    });

    context('when everything is fine', function () {
      it('should call badge and learning content repositories', async function () {
        const userId = Symbol('user-id');
        const campaignId = Symbol('campaign-id');

        campaignRepository.getByCode.withArgs(campaignCode).resolves({ id: campaignId });
        campaignParticipationRepository.findOneByCampaignIdAndUserId
          .withArgs({ campaignId, userId })
          .resolves(Symbol('a campaign participation'));

        // when
        await getPresentationSteps({
          userId,
          campaignCode,
          locale,
          campaignRepository,
          campaignParticipationRepository,
          badgeRepository,
          learningContentRepository,
        });

        // then
        expect(badgeRepository.findByCampaignId).to.have.been.calledOnce;
        expect(learningContentRepository.findByCampaignId).to.have.been.calledOnce;
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

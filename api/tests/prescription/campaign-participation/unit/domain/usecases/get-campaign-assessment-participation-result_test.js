import sinon from 'sinon';

import { getCampaignAssessmentParticipationResult } from '../../../../../../src/prescription/campaign-participation/domain/usecases/get-campaign-assessment-participation-result.js';
import { UserNotAuthorizedToAccessEntityError } from '../../../../../../src/shared/domain/errors.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | get-campaign-assessment-participation-result', function () {
  let campaignRepository, campaignAssessmentParticipationResultRepository, campaignParticipationRepository;
  let userId, campaignId, campaign, campaignParticipationId;
  const locale = 'fr';

  beforeEach(function () {
    campaignRepository = {
      checkIfUserOrganizationHasAccessToCampaign: sinon.stub(),
    };
    campaignAssessmentParticipationResultRepository = {
      getByCampaignIdAndCampaignParticipationId: sinon.stub(),
    };
    campaignParticipationRepository = {
      get: sinon.stub(),
    };
  });

  context('when user has access to organization that owns campaign', function () {
    beforeEach(function () {
      userId = domainBuilder.buildUser().id;
      campaign = domainBuilder.buildCampaign();
      campaignId = campaign.id;
      campaignParticipationId = domainBuilder.buildCampaignParticipation({ campaign, userId }).id;
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(true);
    });

    context('when participation is shared', function () {
      it('should get the campaignAssessmentParticipationResult', async function () {
        // given
        const expectedResult = Symbol('Result');
        campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves({ isShared: true });
        campaignAssessmentParticipationResultRepository.getByCampaignIdAndCampaignParticipationId
          .withArgs({ campaignId, campaignParticipationId, locale })
          .resolves(expectedResult);

        // when
        const result = await getCampaignAssessmentParticipationResult({
          userId,
          campaignId,
          campaignParticipationId,
          campaignRepository,
          campaignAssessmentParticipationResultRepository,
          campaignParticipationRepository,
          locale,
        });

        // then
        expect(result).to.equal(expectedResult);
      });
    });

    context('when participation is not shared', function () {
      it('should throw UserNotAuthorizedToAccessEntityError', async function () {
        // given
        campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves({ isShared: false });

        // when
        const result = await catchErr(getCampaignAssessmentParticipationResult)({
          userId,
          campaignId,
          campaignParticipationId,
          campaignRepository,
          campaignAssessmentParticipationResultRepository,
          campaignParticipationRepository,
          locale,
        });

        // then
        expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
      });
    });
  });

  context('when user does not have access to organization that owns campaign', function () {
    beforeEach(function () {
      userId = domainBuilder.buildUser().id;
      campaign = domainBuilder.buildCampaign();
      campaignId = campaign.id;
      campaignParticipationId = domainBuilder.buildCampaignParticipation({ campaign, userId }).id;
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(false);
    });

    it('should throw UserNotAuthorizedToAccessEntityError', async function () {
      // when
      const result = await catchErr(getCampaignAssessmentParticipationResult)({
        userId,
        campaignId,
        campaignParticipationId,
        campaignRepository,
        campaignAssessmentParticipationResultRepository,
        campaignParticipationRepository,
        locale,
      });

      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });
});

import { expect } from 'chai';
import sinon from 'sinon';

import { LtiCampaignNotFoundError, LtiLineItemsInitializationError } from '../../../../../src/lti/domain/errors.js';
import { LtiCampaign } from '../../../../../src/lti/domain/models/LtiCampaign.js';
import { startLtiCampaign } from '../../../../../src/lti/domain/usecases/start-lti-campaign.usecase.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | LTI | Domain | Usecases | startLtiCampaign', function () {
  const campaignId = 123;
  const lineItemsUrl = 'https://moodle.example.net/mod/lti/services.php/2/lineitems?type_id=3';
  const resourceLinkId = 'resource-link-id';
  const accessToken = { token_type: 'Bearer', access_token: 'platform-access-token' };

  let ltiCampaignRepository;
  let ltiScoringService;
  let campaign;

  beforeEach(function () {
    campaign = new LtiCampaign({ id: campaignId, code: 'ABCD12345', name: 'Campagne', type: 'ASSESSMENT' });
    ltiCampaignRepository = { getLtiCampaign: sinon.stub() };
    ltiCampaignRepository.getLtiCampaign.withArgs({ campaignId }).resolves(campaign);
    ltiScoringService = { initializeLineItems: sinon.stub().resolves() };
  });

  it('initializes the line items of the campaign and returns the campaign', async function () {
    // when
    const result = await startLtiCampaign({
      campaignId,
      lineItemsUrl,
      resourceLinkId,
      accessToken,
      ltiCampaignRepository,
      ltiScoringService,
    });

    // then
    expect(result).to.equal(campaign);
    expect(ltiScoringService.initializeLineItems).to.have.been.calledOnceWithExactly({
      lineItemsUrl,
      resourceLinkId,
      campaign,
      accessToken,
    });
  });

  context('when the campaign does not exist', function () {
    it('throws a LtiCampaignNotFoundError and does not initialize line items', async function () {
      // when
      const error = await catchErr(startLtiCampaign)({
        campaignId: 999,
        lineItemsUrl,
        resourceLinkId,
        accessToken,
        ltiCampaignRepository,
        ltiScoringService,
      });

      // then
      expect(error).to.be.instanceOf(LtiCampaignNotFoundError);
      expect(ltiScoringService.initializeLineItems).not.to.have.been.called;
    });
  });

  context('when the campaign id is not an integer', function () {
    it('throws a LtiCampaignNotFoundError without looking for the campaign', async function () {
      // when
      const error = await catchErr(startLtiCampaign)({
        campaignId: NaN,
        lineItemsUrl,
        resourceLinkId,
        accessToken,
        ltiCampaignRepository,
        ltiScoringService,
      });

      // then
      expect(error).to.be.instanceOf(LtiCampaignNotFoundError);
      expect(ltiCampaignRepository.getLtiCampaign).not.to.have.been.called;
    });
  });

  context('when line items cannot be initialized', function () {
    it('throws the LtiLineItemsInitializationError', async function () {
      // given
      ltiScoringService.initializeLineItems.rejects(new LtiLineItemsInitializationError());

      // when
      const error = await catchErr(startLtiCampaign)({
        campaignId,
        lineItemsUrl,
        resourceLinkId,
        accessToken,
        ltiCampaignRepository,
        ltiScoringService,
      });

      // then
      expect(error).to.be.instanceOf(LtiLineItemsInitializationError);
    });
  });
});

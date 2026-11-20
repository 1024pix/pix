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

  const registration = Symbol('registration');

  let ltiCampaignRepository;
  let ltiService;
  let ltiScoringService;
  let campaign;

  beforeEach(function () {
    campaign = new LtiCampaign({ id: campaignId, code: 'ABCD12345', name: 'Campagne', type: 'ASSESSMENT' });
    ltiCampaignRepository = { getLtiCampaign: sinon.stub() };
    ltiCampaignRepository.getLtiCampaign.withArgs({ campaignId }).resolves(campaign);
    ltiService = { getAccessToken: sinon.stub() };
    ltiService.getAccessToken
      .withArgs({ scope: 'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem', registration })
      .resolves(accessToken);
    ltiScoringService = { initializeLineItems: sinon.stub().resolves() };
  });

  it('initializes the line items of the campaign and returns the campaign', async function () {
    // when
    const result = await startLtiCampaign({
      campaignId,
      lineItemsUrl,
      resourceLinkId,
      registration,
      ltiCampaignRepository,
      ltiService,
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
        registration,
        ltiCampaignRepository,
        ltiService,
        ltiScoringService,
      });

      // then
      expect(error).to.be.instanceOf(LtiCampaignNotFoundError);
      expect(ltiService.getAccessToken).not.to.have.been.called;
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
        registration,
        ltiCampaignRepository,
        ltiService,
        ltiScoringService,
      });

      // then
      expect(error).to.be.instanceOf(LtiCampaignNotFoundError);
      expect(ltiCampaignRepository.getLtiCampaign).not.to.have.been.called;
    });
  });

  context('when the platform does not deliver an access token', function () {
    it('throws a LtiLineItemsInitializationError and does not initialize line items', async function () {
      // given
      ltiService.getAccessToken = sinon.stub().resolves(null);

      // when
      const error = await catchErr(startLtiCampaign)({
        campaignId,
        lineItemsUrl,
        resourceLinkId,
        registration,
        ltiCampaignRepository,
        ltiService,
        ltiScoringService,
      });

      // then
      expect(error).to.be.instanceOf(LtiLineItemsInitializationError);
      expect(ltiScoringService.initializeLineItems).not.to.have.been.called;
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
        registration,
        ltiCampaignRepository,
        ltiService,
        ltiScoringService,
      });

      // then
      expect(error).to.be.instanceOf(LtiLineItemsInitializationError);
    });
  });
});

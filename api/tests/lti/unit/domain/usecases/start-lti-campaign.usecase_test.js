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
  const i18n = { __: (key) => ({ 'lti.line-item-mastery-rate': 'Taux de réussite' })[key] };

  const competence1LineItem = {
    label: 'ABCD12345 : 1.1 Mener une recherche',
    resourceId: 'pix:campaign:123:competence:recCompetence1',
    scoreMaximum: 3,
    tag: 'pix-campaign-123',
    resourceLinkId,
  };
  const competence2LineItem = {
    label: 'ABCD12345 : 1.2 Gérer des données',
    resourceId: 'pix:campaign:123:competence:recCompetence2',
    scoreMaximum: 5,
    tag: 'pix-campaign-123',
    resourceLinkId,
  };
  const masteryRateLineItem = {
    label: 'ABCD12345 : Taux de réussite',
    resourceId: 'pix:campaign:123:mastery-rate',
    scoreMaximum: 100,
    tag: 'pix-campaign-123',
    resourceLinkId,
  };

  let ltiCampaignRepository;
  let ltiService;
  let ltiScoringService;
  let getI18n;
  let campaign;

  beforeEach(function () {
    campaign = new LtiCampaign({
      id: campaignId,
      code: 'ABCD12345',
      name: 'Campagne',
      type: 'ASSESSMENT',
      competences: [
        { id: 'recCompetence1', index: '1.1', name: 'Mener une recherche', maxLevel: 3.4 },
        { id: 'recCompetence2', index: '1.2', name: 'Gérer des données', maxLevel: 5 },
      ],
    });
    ltiCampaignRepository = { getLtiCampaign: sinon.stub() };
    ltiCampaignRepository.getLtiCampaign.withArgs({ campaignId }).resolves(campaign);

    ltiService = { getAccessToken: sinon.stub() };
    ltiService.getAccessToken
      .withArgs({ scope: 'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem', registration })
      .resolves(accessToken);

    ltiScoringService = { initializeLineItems: sinon.stub().resolves() };

    getI18n = sinon.stub().withArgs('fr').returns(i18n);
  });

  function execute(args = {}) {
    return startLtiCampaign({
      campaignId,
      lineItemsUrl,
      resourceLinkId,
      registration,
      ltiCampaignRepository,
      ltiService,
      ltiScoringService,
      getI18n,
      ...args,
    });
  }

  it('initializes the line items of the campaign on the platform and returns the campaign', async function () {
    // when
    const result = await execute();

    // then
    expect(result).to.equal(campaign);
    expect(ltiScoringService.initializeLineItems).to.have.been.calledOnceWithExactly({
      lineItemsUrl,
      resourceLinkId,
      tag: 'pix-campaign-123',
      lineItems: [competence1LineItem, competence2LineItem, masteryRateLineItem],
      accessToken,
    });
  });

  context('when the campaign does not exist', function () {
    it('throws a LtiCampaignNotFoundError without requesting the platform', async function () {
      // when
      const error = await catchErr(execute)({ campaignId: 999 });

      // then
      expect(error).to.be.instanceOf(LtiCampaignNotFoundError);
      expect(ltiService.getAccessToken).not.to.have.been.called;
      expect(ltiScoringService.initializeLineItems).not.to.have.been.called;
    });
  });

  context('when the campaign id is not an integer', function () {
    it('throws a LtiCampaignNotFoundError without looking for the campaign', async function () {
      // when
      const error = await catchErr(execute)({ campaignId: NaN });

      // then
      expect(error).to.be.instanceOf(LtiCampaignNotFoundError);
      expect(ltiCampaignRepository.getLtiCampaign).not.to.have.been.called;
    });
  });

  context('when the platform does not deliver an access token', function () {
    it('throws a LtiLineItemsInitializationError without initializing the line items', async function () {
      // given
      ltiService.getAccessToken = sinon.stub().resolves(null);

      // when
      const error = await catchErr(execute)();

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
      const error = await catchErr(execute)();

      // then
      expect(error).to.be.instanceOf(LtiLineItemsInitializationError);
    });
  });
});

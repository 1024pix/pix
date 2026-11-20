import { expect } from 'chai';
import sinon from 'sinon';

import { LtiScoreSendingError } from '../../../../../src/lti/domain/errors.js';
import { CampaignParticipationResult } from '../../../../../src/lti/domain/models/CampaignParticipationResult.js';
import { LtiCampaign } from '../../../../../src/lti/domain/models/LtiCampaign.js';
import { sendCampaignParticipationResult } from '../../../../../src/lti/domain/usecases/send-campaign-participation-result.usecase.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | LTI | Domain | Usecases | sendCampaignParticipationResult', function () {
  const campaignId = 123;
  const campaignParticipationId = 456;
  const userId = 789;
  const sharedAt = new Date('2026-01-01T10:00:00Z');
  const accessToken = { token_type: 'Bearer', access_token: 'platform-access-token' };
  const registration = Symbol('registration');
  const ltiLaunchContext = {
    registration,
    lineItemsUrl: 'https://moodle.example.net/mod/lti/services.php/2/lineitems?type_id=3',
    resourceLinkId: 'resource-link-id',
    ltiUserId: 'lti-user-id',
  };

  let ltiCampaignRepository;
  let ltiCampaignParticipationRepository;
  let ltiLaunchContextRepository;
  let ltiService;
  let ltiScoringService;

  beforeEach(function () {
    const campaign = new LtiCampaign({
      id: campaignId,
      code: 'ABCD12345',
      name: 'Campagne',
      type: 'ASSESSMENT',
      competences: [
        { id: 'recCompetence1', index: '1.1', name: 'Mener une recherche', maxLevel: 3 },
        { id: 'recCompetence2', index: '1.2', name: 'Gérer des données', maxLevel: 5 },
      ],
    });
    ltiCampaignRepository = { getLtiCampaign: sinon.stub() };
    ltiCampaignRepository.getLtiCampaign.withArgs({ campaignId }).resolves(campaign);

    ltiCampaignParticipationRepository = { getCampaignParticipationResult: sinon.stub() };
    ltiCampaignParticipationRepository.getCampaignParticipationResult.withArgs({ campaignParticipationId }).resolves(
      new CampaignParticipationResult({
        campaignParticipationId,
        masteryRate: 0.75,
        competences: [
          { id: 'recCompetence1', index: '1.1', name: 'Mener une recherche', maxLevel: 3, reachedLevel: 2 },
          { id: 'recCompetence2', index: '1.2', name: 'Gérer des données', maxLevel: 5, reachedLevel: 4 },
        ],
      }),
    );

    ltiLaunchContextRepository = { findByCampaignIdAndUserId: sinon.stub() };
    ltiLaunchContextRepository.findByCampaignIdAndUserId.withArgs({ campaignId, userId }).resolves(ltiLaunchContext);

    ltiService = { getAccessToken: sinon.stub() };
    ltiService.getAccessToken
      .withArgs({
        scope: 'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem https://purl.imsglobal.org/spec/lti-ags/scope/score',
        registration,
      })
      .resolves(accessToken);

    ltiScoringService = { sendScores: sinon.stub().resolves() };
  });

  function execute() {
    return sendCampaignParticipationResult({
      campaignId,
      campaignParticipationId,
      userId,
      sharedAt,
      ltiCampaignRepository,
      ltiCampaignParticipationRepository,
      ltiLaunchContextRepository,
      ltiService,
      ltiScoringService,
    });
  }

  it('sends the scores of the participation on the line items of the campaign, timestamped with the sharing date', async function () {
    // when
    await execute();

    // then
    expect(ltiScoringService.sendScores).to.have.been.calledOnceWithExactly({
      lineItemsUrl: ltiLaunchContext.lineItemsUrl,
      resourceLinkId: ltiLaunchContext.resourceLinkId,
      tag: 'pix-campaign-123',
      ltiUserId: 'lti-user-id',
      scores: [
        { resourceId: 'pix:campaign:123:competence:recCompetence1', scoreGiven: 2, scoreMaximum: 3 },
        { resourceId: 'pix:campaign:123:competence:recCompetence2', scoreGiven: 4, scoreMaximum: 5 },
        { resourceId: 'pix:campaign:123:mastery-rate', scoreGiven: 75, scoreMaximum: 100 },
      ],
      timestamp: sharedAt,
      accessToken,
    });
  });

  context('when the participation was not launched through LTI', function () {
    it('does not send any score', async function () {
      // given
      ltiLaunchContextRepository.findByCampaignIdAndUserId = sinon.stub().resolves(null);

      // when
      await execute();

      // then
      expect(ltiService.getAccessToken).not.to.have.been.called;
      expect(ltiScoringService.sendScores).not.to.have.been.called;
    });
  });

  context('when the platform does not deliver an access token', function () {
    it('throws a LtiScoreSendingError without sending any score', async function () {
      // given
      ltiService.getAccessToken = sinon.stub().resolves(null);

      // when
      const error = await catchErr(execute)();

      // then
      expect(error).to.be.instanceOf(LtiScoreSendingError);
      expect(ltiScoringService.sendScores).not.to.have.been.called;
    });
  });
});

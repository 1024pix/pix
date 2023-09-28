import { domainBuilder, expect, sinon } from '../../../test-helper.js';
import { startCampaignParticipation } from '../../../../lib/domain/usecases/start-campaign-participation.js';
import { CampaignParticipationStarted } from '../../../../lib/domain/events/CampaignParticipationStarted.js';
import { CampaignParticipant } from '../../../../lib/domain/models/CampaignParticipant.js';

describe('Unit | UseCase | start-campaign-participation', function () {
  const userId = 19837482;
  let campaignRepository;
  let campaignParticipantRepository;
  let campaignParticipationRepository;

  beforeEach(function () {
    campaignRepository = {
      findAllSkills: sinon.stub(),
      areKnowledgeElementsResettable: sinon.stub(),
    };
    campaignParticipantRepository = {
      get: sinon.stub(),
      save: sinon.stub(),
    };
    campaignParticipationRepository = {
      get: sinon.stub(),
    };
  });

  it('should return CampaignParticipationStarted event', async function () {
    // given
    const domainTransaction = Symbol('transaction');
    const campaignToStartParticipation = domainBuilder.buildCampaignToStartParticipation();
    const campaignParticipant = new CampaignParticipant({
      campaignToStartParticipation,
      organizationLearner: { id: null, hasParticipated: false },
      userIdentity: { id: userId },
    });
    const campaignParticipationId = 1;
    const campaignParticipationAttributes = { campaignId: 12, participantExternalId: 'YvoLoL', isReset: false };
    const expectedCampaignParticipation = domainBuilder.buildCampaignParticipation({ id: campaignParticipationId });

    const campaignParticipationStartedEvent = new CampaignParticipationStarted({
      campaignParticipationId: expectedCampaignParticipation.id,
    });

    campaignParticipantRepository.get
      .withArgs({ userId, campaignId: campaignParticipationAttributes.campaignId, domainTransaction })
      .resolves(campaignParticipant);

    sinon.stub(campaignParticipant, 'start');

    campaignParticipantRepository.save
      .withArgs({ userId, campaignParticipant, domainTransaction })
      .resolves(campaignParticipationId);

    campaignParticipationRepository.get
      .withArgs(campaignParticipationId, domainTransaction)
      .resolves(expectedCampaignParticipation);

    // when
    const { event, campaignParticipation } = await startCampaignParticipation({
      campaignParticipation: campaignParticipationAttributes,
      userId,
      campaignRepository,
      campaignParticipantRepository,
      campaignParticipationRepository,
      domainTransaction,
    });

    // then
    expect(campaignParticipant.start).to.have.been.calledWithExactly({
      participantExternalId: 'YvoLoL',
      isReset: campaignParticipationAttributes.isReset,
    });
    expect(event).to.deep.equal(campaignParticipationStartedEvent);
    expect(campaignParticipation).to.deep.equal(expectedCampaignParticipation);
  });
});

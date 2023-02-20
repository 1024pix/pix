import { expect, sinon, domainBuilder } from '../../../test-helper';
import startCampaignParticipation from '../../../../lib/domain/usecases/start-campaign-participation';
import CampaignParticipationStarted from '../../../../lib/domain/events/CampaignParticipationStarted';
import CampaignParticipant from '../../../../lib/domain/models/CampaignParticipant';

describe('Unit | UseCase | start-campaign-participation', function () {
  const userId = 19837482;
  let campaignParticipantRepository;
  let campaignParticipationRepository;

  beforeEach(function () {
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
    const campaignParticipationAttributes = { campaignId: 12, participantExternalId: 'YvoLoL' };
    const expectedCampaignParticipation = domainBuilder.buildCampaignParticipation({ id: 12 });

    const campaignParticipationStartedEvent = new CampaignParticipationStarted({
      campaignParticipationId: expectedCampaignParticipation.id,
    });

    campaignParticipantRepository.get
      .withArgs({ userId, campaignId: campaignParticipationAttributes.campaignId, domainTransaction })
      .resolves(campaignParticipant);

    sinon.stub(campaignParticipant, 'start');

    campaignParticipantRepository.save.withArgs(sinon.match(campaignParticipant), domainTransaction).resolves(12);

    campaignParticipationRepository.get.withArgs(12, domainTransaction).resolves(expectedCampaignParticipation);

    // when
    const { event, campaignParticipation } = await startCampaignParticipation({
      campaignParticipation: campaignParticipationAttributes,
      userId,
      campaignParticipantRepository,
      campaignParticipationRepository,
      domainTransaction,
    });

    // then
    expect(campaignParticipant.start).to.have.been.calledWith({ participantExternalId: 'YvoLoL' });
    expect(event).to.deep.equal(campaignParticipationStartedEvent);
    expect(campaignParticipation).to.deep.equal(expectedCampaignParticipation);
  });
});

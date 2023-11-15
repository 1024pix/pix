import { expect, sinon, domainBuilder } from '../../../test-helper.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { CampaignParticipation } from '../../../../lib/domain/models/CampaignParticipation.js';

const { deleteCampaignParticipationForAdmin } = usecases;

describe('Unit | UseCase | delete-campaign-participation-for-admin', function () {
  //given
  let clock;
  const now = new Date('2021-09-25');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now: now.getTime(), toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  it('should call repository method to delete a campaign participation', async function () {
    const campaignRepository = {
      getCampaignIdByCampaignParticipationId: sinon.stub(),
    };
    const campaignParticipationRepository = {
      getAllCampaignParticipationsInCampaignForASameLearner: sinon.stub(),
      remove: sinon.stub(),
    };
    const campaignParticipationId = 1234;
    const domainTransaction = Symbol('domainTransaction');
    const campaignId = domainBuilder.buildCampaign().id;
    const ownerId = domainBuilder.buildUser().id;
    const organizationLearnerId = domainBuilder.buildOrganizationLearner().id;

    const campaignParticipation1 = new CampaignParticipation({
      id: campaignParticipationId,
      organizationLearnerId,
      deletedAt: null,
      deletedBy: null,
      campaignId,
    });

    const campaignParticipation2 = new CampaignParticipation({
      id: 1235,
      deletedAt: null,
      deletedBy: null,
    });

    const campaignParticipations = [campaignParticipation1, campaignParticipation2];

    campaignRepository.getCampaignIdByCampaignParticipationId.withArgs(campaignParticipationId).resolves(campaignId);
    campaignParticipationRepository.getAllCampaignParticipationsInCampaignForASameLearner
      .withArgs({
        campaignId,
        campaignParticipationId,
        domainTransaction,
      })
      .resolves(campaignParticipations);

    //when
    await deleteCampaignParticipationForAdmin({
      userId: ownerId,
      campaignParticipationId,
      domainTransaction,
      campaignRepository,
      campaignParticipationRepository,
    });

    //then
    expect(campaignParticipationRepository.remove).to.have.been.calledTwice;
    campaignParticipations.forEach((campaignParticipation) => {
      const deletedCampaignParticipation = new CampaignParticipation({
        ...campaignParticipation,
        deletedAt: now,
        deletedBy: ownerId,
      });
      expect(campaignParticipationRepository.remove).to.have.been.calledWithExactly({
        id: deletedCampaignParticipation.id,
        deletedAt: deletedCampaignParticipation.deletedAt,
        deletedBy: deletedCampaignParticipation.deletedBy,
        domainTransaction,
      });
    });
  });
});

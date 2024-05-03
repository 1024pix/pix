import { getCampaignParticipationsForOrganizationLearner } from '../../../../../../src/prescription/campaign-participation/domain/usecases/get-campaign-participations-for-organization-learner.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | get-organization-learner-campaign-participations', function () {
  let campaignParticipationRepository,
    getCampaignParticipationsForOrganizationLearnerStub,
    organizationLearnerId,
    campaignId,
    participations;

  beforeEach(function () {
    organizationLearnerId = Symbol('organisationLearnerId');
    campaignId = Symbol('campaignId');
    participations = Symbol('participations');
    getCampaignParticipationsForOrganizationLearnerStub = sinon.stub();
    campaignParticipationRepository = {
      getCampaignParticipationsForOrganizationLearner: getCampaignParticipationsForOrganizationLearnerStub,
    };
  });

  it('should return given participations', async function () {
    //given
    getCampaignParticipationsForOrganizationLearnerStub
      .withArgs({ organizationLearnerId, campaignId })
      .resolves(participations);

    //when
    const result = await getCampaignParticipationsForOrganizationLearner({
      campaignId,
      organizationLearnerId,
      campaignParticipationRepository,
    });

    //then
    expect(result).to.deep.equal(participations);
  });
});

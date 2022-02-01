const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const getUserCampaignAssessmentResult = require('../../../../lib/domain/usecases/get-user-campaign-assessment-result');
const { NotFoundError, NoCampaignParticipationForUserAndCampaign } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-user-campaign-assessment-result', function () {
  let participantResultRepository, campaignParticipationRepository;
  beforeEach(function () {
    participantResultRepository = { getByUserIdAndCampaignId: sinon.stub() };
  });

  it('should get the participant result', async function () {
    const userId = domainBuilder.buildUser().id;
    const campaignId = domainBuilder.buildCampaign().id;
    const locale = 'FR';
    const results = Symbol();

    participantResultRepository.getByUserIdAndCampaignId.withArgs({ userId, campaignId, locale }).resolves(results);

    const actualCampaignParticipationResult = await getUserCampaignAssessmentResult({
      userId,
      campaignId,
      locale,
      campaignParticipationRepository,
      participantResultRepository,
    });

    expect(actualCampaignParticipationResult).to.deep.equal(results);
  });

  it('should throw an error when there is no participation for given campaign and user', async function () {
    const userId = domainBuilder.buildUser().id;
    const campaignId = domainBuilder.buildCampaign().id;
    const locale = 'FR';

    participantResultRepository.getByUserIdAndCampaignId
      .withArgs({ userId, campaignId, locale })
      .rejects(new NotFoundError());

    const error = await catchErr(getUserCampaignAssessmentResult)({
      userId,
      campaignId,
      locale,
      campaignParticipationRepository,
      participantResultRepository,
    });

    expect(error).to.be.instanceOf(NoCampaignParticipationForUserAndCampaign);
  });
});

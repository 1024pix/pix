const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const getUserCampaignAssessmentResult = require('../../../../lib/domain/usecases/get-user-campaign-assessment-result');
const { NotFoundError, NoCampaignParticipationForUserAndCampaign } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-user-campaign-assessment-result', function () {
  let participantResultRepository,
    campaignParticipationRepository,
    targetProfileRepository,
    knowledgeElementRepository,
    badgeRepository;

  beforeEach(function () {
    participantResultRepository = { getByUserIdAndCampaignId: sinon.stub() };
    targetProfileRepository = { getByCampaignId: sinon.stub() };
    knowledgeElementRepository = { findUniqByUserId: sinon.stub() };
    badgeRepository = { findByTargetProfileId: sinon.stub() };
  });

  it('should get the participant result', async function () {
    const userId = domainBuilder.buildUser().id;
    const campaignId = domainBuilder.buildCampaign().id;
    const targetProfile = domainBuilder.buildTargetProfile();
    const locale = 'FR';
    const results = Symbol();

    participantResultRepository.getByUserIdAndCampaignId
      .withArgs({ userId, campaignId, locale, targetProfile, badges: [] })
      .resolves(results);
    targetProfileRepository.getByCampaignId.withArgs(campaignId).resolves(targetProfile);
    knowledgeElementRepository.findUniqByUserId.withArgs({ userId }).resolves([]);
    badgeRepository.findByTargetProfileId.withArgs(targetProfile.id).resolves([]);

    const actualCampaignParticipationResult = await getUserCampaignAssessmentResult({
      userId,
      campaignId,
      locale,
      campaignParticipationRepository,
      participantResultRepository,
      targetProfileRepository,
      knowledgeElementRepository,
      badgeRepository,
    });

    expect(actualCampaignParticipationResult).to.deep.equal(results);
  });

  it('should throw an error when there is no participation for given campaign and user', async function () {
    const userId = domainBuilder.buildUser().id;
    const campaignId = domainBuilder.buildCampaign().id;
    const targetProfile = domainBuilder.buildTargetProfile();
    const locale = 'FR';

    targetProfileRepository.getByCampaignId.withArgs(campaignId).resolves(targetProfile);
    knowledgeElementRepository.findUniqByUserId.withArgs({ userId }).resolves([]);
    badgeRepository.findByTargetProfileId.withArgs(targetProfile.id).resolves([]);

    participantResultRepository.getByUserIdAndCampaignId
      .withArgs({ userId, campaignId, locale, targetProfile, badges: [] })
      .rejects(new NotFoundError());

    const error = await catchErr(getUserCampaignAssessmentResult)({
      userId,
      campaignId,
      locale,
      campaignParticipationRepository,
      participantResultRepository,
      targetProfileRepository,
      knowledgeElementRepository,
      badgeRepository,
    });

    expect(error).to.be.instanceOf(NoCampaignParticipationForUserAndCampaign);
  });
});

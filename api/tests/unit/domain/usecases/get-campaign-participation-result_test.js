const { expect, sinon, catchErr } = require('../../../test-helper');
const getCampaignParticipationResult = require('../../../../lib/domain/usecases/get-campaign-participation-result');
const CampaignParticipationResult = require('../../../../lib/domain/models/CampaignParticipationResult');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-campaign-participation-result', () => {

  const campaignParticipationId = 1;
  const targetProfileId = 1;
  const userId = 2;
  const campaignId = 'campaignId';
  const otherUserId = 3;
  const campaignParticipationResult = { id: 'foo' };
  const campaignParticipation = {
    campaignId,
    userId,
  };
  const badge = {
    id: 1
  };
  const targetProfile = {
    id: 1
  };

  let campaignParticipationRepository,
    campaignRepository,
    targetProfileRepository,
    competenceRepository,
    assessmentRepository,
    badgeRepository,
    knowledgeElementRepository;

  beforeEach(() => {
    campaignParticipationRepository = { get: sinon.stub() };
    campaignRepository = { checkIfUserOrganizationHasAccessToCampaign: sinon.stub() };
    targetProfileRepository = { getByCampaignId: sinon.stub() };
    competenceRepository = { list: sinon.stub() };
    assessmentRepository = { get: sinon.stub() };
    badgeRepository = { getByTargetProfileId: sinon.stub() };
    knowledgeElementRepository = { findUniqByUserId: sinon.stub() };
    sinon.stub(CampaignParticipationResult, 'buildFrom').returns(campaignParticipationResult);
  });

  context('when user belongs to the organization of the campaign', () => {

    it('should get the campaignParticipationResult', async () => {
      // given
      campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
      targetProfileRepository.getByCampaignId.withArgs(campaignParticipation.campaignId).resolves(targetProfile);
      badgeRepository.getByTargetProfileId.withArgs(targetProfileId).resolves(badge);
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, otherUserId).resolves(true);

      // when
      const actualCampaignParticipationResult = await getCampaignParticipationResult({
        userId: otherUserId,
        campaignParticipationId,
        campaignParticipationRepository,
        campaignRepository,
        targetProfileRepository,
        competenceRepository,
        assessmentRepository,
        badgeRepository,
        knowledgeElementRepository,
      });

      // then
      expect(actualCampaignParticipationResult).to.deep.equal(campaignParticipationResult);
    });
  });

  context('when campaignParticipation belongs to user', () => {

    it('should get the campaignParticipationResult', async () => {
      // given
      campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
      targetProfileRepository.getByCampaignId.withArgs(campaignParticipation.campaignId).resolves(targetProfile);
      badgeRepository.getByTargetProfileId.withArgs(targetProfileId).resolves(badge);

      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, otherUserId).resolves(false);

      // when
      const actualCampaignParticipationResult = await getCampaignParticipationResult({
        userId,
        campaignParticipationId,
        campaignParticipationRepository,
        campaignRepository,
        targetProfileRepository,
        competenceRepository,
        assessmentRepository,
        badgeRepository,
        knowledgeElementRepository,
      });

      // then
      expect(actualCampaignParticipationResult).to.deep.equal(campaignParticipationResult);
    });
  });

  context('when user not belongs to the organization of the campaign or not own this campaignParticipation', () => {
    it('should throw an error', async () => {
      // given
      campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves({ userId });
      targetProfileRepository.getByCampaignId.withArgs(campaignParticipation.campaignId).resolves(targetProfile);
      badgeRepository.getByTargetProfileId.withArgs(targetProfileId).resolves(badge);

      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.resolves(false);

      // when
      const result = await catchErr(getCampaignParticipationResult)({
        userId: 3,
        campaignParticipationId,
        campaignParticipationRepository,
        campaignRepository,
      });

      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });
});

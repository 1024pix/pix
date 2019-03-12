const { expect, sinon, catchErr } = require('../../../test-helper');
const getCampaignParticipationResult = require('../../../../lib/domain/usecases/get-campaign-participation-result');
const CampaignParticipationResult = require('../../../../lib/domain/models/CampaignParticipationResult');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-campaign-participation-result', () => {

  const campaignParticipationId = 1;
  const userId = 2;
  const targetProfileId = 3;
  const sharedAt = new Date('2018-02-03');

  let campaignParticipationRepository,
    targetProfileRepository,
    smartPlacementKnowledgeElementRepository,
    campaignRepository;

  beforeEach(() => {
    campaignParticipationRepository = { get: sinon.stub() };
    targetProfileRepository = { get: sinon.stub() };
    smartPlacementKnowledgeElementRepository = { findUniqByUserId: sinon.stub() };
    campaignRepository = { checkIfUserOrganizationHasAccessToCampaign: sinon.stub() };
  });

  context('when user owned his campaignParticipation', () => {

    it('should get the completed campaignParticipationResult', async () => {
      // given
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.resolves(false);
      campaignParticipationRepository.get.withArgs(
        campaignParticipationId, { include: ['assessment', 'campaign'] }
      ).resolves({
        sharedAt,
        isShared: true,
        userId,
        assessment: {
          userId,
          isCompleted() {
            return true;
          }
        },
        campaign: {
          targetProfileId,
        }
      });

      targetProfileRepository.get.withArgs(targetProfileId).resolves({
        skills: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });

      smartPlacementKnowledgeElementRepository.findUniqByUserId.withArgs(
        userId, sharedAt
      ).resolves([{
        skillId: 1,
        isValidated: true,
      }, {
        skillId: 2,
        isValidated: false,
      }, {
        skillId: 7,
        isValidated: true,
      }]);

      // when
      const campaignParticipationResult = await getCampaignParticipationResult({
        campaignParticipationId,
        campaignParticipationRepository,
        targetProfileRepository,
        smartPlacementKnowledgeElementRepository,
        campaignRepository,
        userId
      });

      // then
      expect(campaignParticipationResult).to.be.an.instanceOf(CampaignParticipationResult);
      expect(campaignParticipationResult.id).to.be.equal(campaignParticipationId);
      expect(campaignParticipationResult.totalSkillsCount).to.be.equal(4);
      expect(campaignParticipationResult.testedSkillsCount).to.be.equal(2);
      expect(campaignParticipationResult.validatedSkillsCount).to.be.equal(1);
      expect(campaignParticipationResult.isCompleted).to.be.true;
    });

    it('should get the non completed campaignParticipationResult', async () => {
      // given
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.resolves(false);
      campaignParticipationRepository.get.withArgs(
        campaignParticipationId, { include: ['assessment', 'campaign'] }
      ).resolves({
        isShared: false,
        userId,
        assessment: {
          userId,
          isCompleted() {
            return false;
          }
        },
        campaign: {
          targetProfileId,
        }
      });

      targetProfileRepository.get.withArgs(targetProfileId).resolves({
        skills: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });

      smartPlacementKnowledgeElementRepository.findUniqByUserId.withArgs(
        userId
      ).resolves([{
        skillId: 1,
        isValidated: true,
      }, {
        skillId: 2,
        isValidated: false,
      }, {
        skillId: 7,
        isValidated: true,
      }]);

      // when
      const campaignParticipationResult = await getCampaignParticipationResult({
        campaignParticipationId,
        campaignParticipationRepository,
        targetProfileRepository,
        smartPlacementKnowledgeElementRepository,
        campaignRepository,
        userId
      });

      // then
      expect(campaignParticipationResult).to.be.an.instanceOf(CampaignParticipationResult);
      expect(campaignParticipationResult.id).to.be.equal(campaignParticipationId);
      expect(campaignParticipationResult.totalSkillsCount).to.be.equal(4);
      expect(campaignParticipationResult.testedSkillsCount).to.be.equal(2);
      expect(campaignParticipationResult.validatedSkillsCount).to.be.equal(null);
      expect(campaignParticipationResult.isCompleted).to.be.false;
    });
  });

  context('when user belongs to the organization of the campaign', () => {
    it('should get the campaignParticipationResult', async () => {
      // given
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.resolves(true);
      campaignParticipationRepository.get.withArgs(campaignParticipationId, { include: ['assessment', 'campaign'] }).resolves({
        userId,
        assessment: {
          userId,
          isCompleted() {
            return false;
          }
        },
        campaign: {
          targetProfileId,
        }
      });

      targetProfileRepository.get.withArgs(targetProfileId).resolves({ skills: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] });

      smartPlacementKnowledgeElementRepository.findUniqByUserId.withArgs(userId).resolves([]);

      // when
      const campaignParticipationResult = await getCampaignParticipationResult({
        campaignParticipationId,
        campaignParticipationRepository,
        targetProfileRepository,
        smartPlacementKnowledgeElementRepository,
        campaignRepository,
        userId: 3
      });

      // then
      expect(campaignParticipationResult).to.be.an.instanceOf(CampaignParticipationResult);
      expect(campaignParticipationResult.id).to.be.equal(campaignParticipationId);

    });

  });

  context('when user not belongs to the organization of the campaign or not own this campaignParticipation', () => {
    it('should throw an error', async () => {
      // given
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.resolves(false);
      campaignParticipationRepository.get.withArgs(campaignParticipationId, { include: ['assessment', 'campaign'] }).resolves({ userId });

      // when
      const result = await catchErr(getCampaignParticipationResult)({
        campaignParticipationId,
        campaignParticipationRepository,
        targetProfileRepository,
        smartPlacementKnowledgeElementRepository,
        campaignRepository,
        userId: 3
      });

      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });
});

const { expect, sinon, catchErr } = require('../../../test-helper');
const getCampaignParticipationResult = require('../../../../lib/domain/usecases/get-campaign-participation-result');
const CampaignParticipationResult = require('../../../../lib/domain/models/CampaignParticipationResult');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-campaign-participation-result', () => {

  const campaignParticipationId = 1;
  const userId = 2;
  const targetProfileId = 3;
  const sharedAt = new Date('2018-02-03');
  const campaignId = 'campaignId';
  const otherUserId = 3;
  const competences = [{
    id: 1,
    name: 'Economie symbiotique',
    index: '5.1',
    skills: [1],
  }, {
    id: 1,
    name: 'Désobéissance civile',
    index: '6.9',
    skills: [2, 3, 4],
  }, {
    id: 1,
    name: 'Démocratie liquide',
    index: '8.6',
    skills: [5, 6],
  }];

  let campaignParticipationRepository,
    targetProfileRepository,
    smartPlacementKnowledgeElementRepository,
    campaignRepository,
    competenceRepository;

  beforeEach(() => {
    campaignParticipationRepository = { get: sinon.stub() };
    targetProfileRepository = { get: sinon.stub() };
    smartPlacementKnowledgeElementRepository = { findUniqByUserId: sinon.stub() };
    campaignRepository = { checkIfUserOrganizationHasAccessToCampaign: sinon.stub() };
    competenceRepository = { list: sinon.stub() };
    competenceRepository.list.resolves(competences);
  });

  context('when user belongs to the organization of the campaign', () => {

    it('should get the full campaignParticipationResult', async () => {
      // given
      campaignParticipationRepository.get.withArgs(
        campaignParticipationId, { include: ['assessment', 'campaign'] }
      ).resolves({
        campaignId,
        isShared: true,
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

      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, otherUserId).resolves(true);

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
        userId: otherUserId,
        campaignParticipationId,
        campaignParticipationRepository,
        targetProfileRepository,
        smartPlacementKnowledgeElementRepository,
        campaignRepository,
        competenceRepository,
      });

      // then
      expect(campaignParticipationResult).to.be.an.instanceOf(CampaignParticipationResult);
      expect(campaignParticipationResult).to.deep.equal({
        id: campaignParticipationId,
        isCompleted: false,
        totalSkillsCount: 4,
        testedSkillsCount: 2,
        validatedSkillsCount: 1,
        competenceResults: [{
          id: 1,
          name: 'Economie symbiotique',
          index: '5.1',
          totalSkillsCount: 1,
          testedSkillsCount: 1,
          validatedSkillsCount: 1,
        }, {
          id: 1,
          name: 'Désobéissance civile',
          index: '6.9',
          totalSkillsCount: 3,
          testedSkillsCount: 1,
          validatedSkillsCount: 0,
        }],
      });
    });

    it('should get the non shared campaignParticipationResult', async () => {
      // given
      campaignParticipationRepository.get.withArgs(
        campaignParticipationId, { include: ['assessment', 'campaign'] }
      ).resolves({
        campaignId,
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

      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, otherUserId).resolves(true);

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
        userId: otherUserId,
        campaignParticipationId,
        campaignParticipationRepository,
        targetProfileRepository,
        smartPlacementKnowledgeElementRepository,
        campaignRepository,
        competenceRepository,
      });

      // then
      expect(campaignParticipationResult).to.be.an.instanceOf(CampaignParticipationResult);
      expect(campaignParticipationResult).to.deep.equal({
        id: campaignParticipationId,
        isCompleted: false,
        totalSkillsCount: 4,
        testedSkillsCount: 2,
        validatedSkillsCount: null,
        competenceResults: [{
          id: 1,
          name: 'Economie symbiotique',
          index: '5.1',
          totalSkillsCount: 1,
          testedSkillsCount: 1,
          validatedSkillsCount: null,
        }, {
          id: 1,
          name: 'Désobéissance civile',
          index: '6.9',
          totalSkillsCount: 3,
          testedSkillsCount: 1,
          validatedSkillsCount: null,
        }],
      });
    });

  });

  context('when user owned his campaignParticipation', () => {

    it('should get the campaignParticipationResult with validated skills', async () => {
      // given
      campaignParticipationRepository.get.withArgs(
        campaignParticipationId, { include: ['assessment', 'campaign'] }
      ).resolves({
        sharedAt,
        isShared: false,
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

      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.resolves();

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
        userId,
        campaignParticipationId,
        campaignParticipationRepository,
        targetProfileRepository,
        smartPlacementKnowledgeElementRepository,
        campaignRepository,
        competenceRepository,
      });

      // then
      expect(campaignParticipationResult).to.be.an.instanceOf(CampaignParticipationResult);
      expect(campaignParticipationResult).to.deep.equal({
        id: campaignParticipationId,
        isCompleted: true,
        totalSkillsCount: 4,
        testedSkillsCount: 2,
        validatedSkillsCount: 1,
        competenceResults: [{
          id: 1,
          name: 'Economie symbiotique',
          index: '5.1',
          totalSkillsCount: 1,
          testedSkillsCount: 1,
          validatedSkillsCount: 1
        }, {
          id: 1,
          name: 'Désobéissance civile',
          index: '6.9',
          totalSkillsCount: 3,
          testedSkillsCount: 1,
          validatedSkillsCount: 0,
        }],
      });
    });

  });

  context('when user not belongs to the organization of the campaign or not own this campaignParticipation', () => {
    it('should throw an error', async () => {
      // given
      campaignParticipationRepository.get.withArgs(
        campaignParticipationId, { include: ['assessment', 'campaign'] }
      ).resolves({ userId });

      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.resolves(false);

      // when
      const result = await catchErr(getCampaignParticipationResult)({
        userId: 3,
        campaignParticipationId,
        campaignParticipationRepository,
        targetProfileRepository,
        smartPlacementKnowledgeElementRepository,
        campaignRepository,
        competenceRepository,
      });

      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });
});

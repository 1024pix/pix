const { expect, sinon } = require('../../../test-helper');
const getCampaignParticipationResult = require('../../../../lib/domain/usecases/get-campaign-participation-result');
const CampaignParticipationResult = require('../../../../lib/domain/models/CampaignParticipationResult');

describe('Unit | UseCase | get-campaign-participation-result', () => {

  const campaignParticipationId = 1;
  const userId = 2;
  const targetProfileId = 3;
  const sharedAt = new Date('2018-02-03');

  let campaignParticipationRepository,
    targetProfileRepository,
    smartPlacementKnowledgeElementRepository;

  beforeEach(() => {
    campaignParticipationRepository = { get: sinon.stub() };
    targetProfileRepository = { get: sinon.stub() };
    smartPlacementKnowledgeElementRepository = { findUniqByUserId: sinon.stub() };
  });

  it('should get the completed campaignParticipationResult', async () => {
    // given
    campaignParticipationRepository.get.withArgs(
      campaignParticipationId, { include: ['assessment', 'campaign'] }
    ).resolves({
      sharedAt,
      isShared: true,
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
      smartPlacementKnowledgeElementRepository
    });

    // then
    expect(campaignParticipationResult).to.be.an.instanceOf(CampaignParticipationResult);
    expect(campaignParticipationResult.id).to.be.equal(campaignParticipationId);
    expect(campaignParticipationResult.totalSkills).to.be.equal(4);
    expect(campaignParticipationResult.testedSkills).to.be.equal(2);
    expect(campaignParticipationResult.validatedSkills).to.be.equal(1);
    expect(campaignParticipationResult.isCompleted).to.be.true;
  });

  it('should get the non completed campaignParticipationResult', async () => {
    // given
    campaignParticipationRepository.get.withArgs(
      campaignParticipationId, { include: ['assessment', 'campaign'] }
    ).resolves({
      isShared: false,
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
      smartPlacementKnowledgeElementRepository
    });

    // then
    expect(campaignParticipationResult).to.be.an.instanceOf(CampaignParticipationResult);
    expect(campaignParticipationResult.id).to.be.equal(campaignParticipationId);
    expect(campaignParticipationResult.totalSkills).to.be.equal(4);
    expect(campaignParticipationResult.testedSkills).to.be.equal(2);
    expect(campaignParticipationResult.validatedSkills).to.be.equal(null);
    expect(campaignParticipationResult.isCompleted).to.be.false;
  });

});

import { Eligibility } from '../../../../../src/quest/domain/models/Eligibility.js';
import { Quest } from '../../../../../src/quest/domain/models/Quest.js';
import { getQuestResultsForCampaignParticipation } from '../../../../../src/quest/domain/usecases/get-quest-results-for-campaign-participation.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Usecases | getQuestResultsForCampaignParticipation', function () {
  let questRepository, eligibilityRepository, rewardRepository, campaignParticipationId, userId;

  beforeEach(function () {
    userId = 1;
    campaignParticipationId = 2;
    questRepository = { findAll: sinon.stub() };
    eligibilityRepository = { find: sinon.stub() };
    rewardRepository = { getByQuestAndUserId: sinon.stub() };
  });

  it('should return empty array when there are no quests', async function () {
    // given
    questRepository.findAll.resolves([]);

    // when
    const result = await getQuestResultsForCampaignParticipation({
      campaignParticipationId,
      userId,
      questRepository,
      eligibilityRepository,
      rewardRepository,
    });

    // then
    expect(result.length).to.equal(0);
  });

  it('should return empty array when there is no eligibility', async function () {
    // given
    const wrongCampaignParticipationId = 30;
    questRepository.findAll.resolves([
      new Quest({
        id: 10,
        eligibilityRequirements: [],
        successRequirements: [],
        rewardType: 'attestations',
        rewardId: 20,
      }),
    ]);

    eligibilityRepository.find.withArgs({ userId }).resolves([
      new Eligibility({
        campaignParticipations: [{ id: wrongCampaignParticipationId, targetProfileId: 40 }],
      }),
    ]);

    // when
    const result = await getQuestResultsForCampaignParticipation({
      campaignParticipationId,
      userId,
      questRepository,
      eligibilityRepository,
      rewardRepository,
    });

    // then
    expect(result.length).to.equal(0);
  });

  it('should return empty array when there is no eligible quests', async function () {
    // given
    const wrongTargetProfileId = 41;
    questRepository.findAll.resolves([
      new Quest({
        id: 10,
        eligibilityRequirements: [
          { type: 'campaignParticipations', data: { targetProfileIds: [wrongTargetProfileId] } },
        ],
        successRequirements: [],
        rewardType: 'attestations',
        rewardId: 20,
      }),
    ]);

    eligibilityRepository.find.withArgs({ userId }).resolves([
      new Eligibility({
        campaignParticipations: [{ id: campaignParticipationId, targetProfileId: 40 }],
      }),
    ]);

    // when
    const result = await getQuestResultsForCampaignParticipation({
      campaignParticipationId,
      userId,
      questRepository,
      eligibilityRepository,
      rewardRepository,
    });

    // then
    expect(result.length).to.equal(0);
  });
});

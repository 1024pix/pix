import { COMPARISON as CRITERION_PROPERTY_COMPARISON } from '../../../../../src/quest/domain/models/CriterionProperty.js';
import { Eligibility, TYPES } from '../../../../../src/quest/domain/models/Eligibility.js';
import { COMPARISON, Quest } from '../../../../../src/quest/domain/models/Quest.js';
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
    expect(result).to.have.lengthOf(0);
  });

  // TODO demander si ce cas est possible (hors cuRL douteux) ?
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
    expect(result).to.have.lengthOf(0);
  });

  it('should return empty array when there is no eligible quests', async function () {
    // given
    const wrongTargetProfileId = 41;
    questRepository.findAll.resolves([
      new Quest({
        id: 10,
        eligibilityRequirements: [
          {
            requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
            data: {
              targetProfileId: {
                data: wrongTargetProfileId,
                comparison: CRITERION_PROPERTY_COMPARISON.EQUAL,
              },
            },
            comparison: COMPARISON.ALL,
          },
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
    expect(result).to.have.lengthOf(0);
  });
});

import sinon from 'sinon';

import { Eligibility } from '../../../../../src/quest/domain/models/Eligibility.js';
import {
  CRITERION_COMPARISONS,
  Quest,
  REQUIREMENT_COMPARISONS,
  REQUIREMENT_TYPES,
} from '../../../../../src/quest/domain/models/Quest.js';
import { getQuestResultsForCampaignParticipation } from '../../../../../src/quest/domain/usecases/get-quest-results-for-campaign-participation.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Usecases | getQuestResultsForCampaignParticipation', function () {
  let questRepository, eligibilityRepository, rewardRepository, campaignParticipationId, userId, logger;

  beforeEach(function () {
    userId = 1;
    campaignParticipationId = 2;
    logger = { error: sinon.stub() };
    questRepository = { findAllWithReward: sinon.stub() };
    eligibilityRepository = { find: sinon.stub() };
    rewardRepository = { getByQuestAndUserId: sinon.stub() };
  });

  it('should return empty array when there are no quests', async function () {
    // given
    questRepository.findAllWithReward.resolves([]);

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
  // EDIT : cas de l'accès simplifié !
  it('should return empty array when there is no eligibility', async function () {
    // given
    const wrongCampaignParticipationId = 30;
    const quest = new Quest({
      id: 10,
      eligibilityRequirements: [],
      successRequirements: [],
      rewardType: 'attestations',
      rewardId: 20,
    });
    questRepository.findAllWithReward.resolves([quest]);

    eligibilityRepository.find.withArgs({ userId, quest }).resolves([
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
    const quest = new Quest({
      id: 10,
      eligibilityRequirements: [
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          data: {
            targetProfileId: {
              data: wrongTargetProfileId,
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
          },
          comparison: REQUIREMENT_COMPARISONS.ALL,
        },
      ],
      successRequirements: [],
      rewardType: 'attestations',
      rewardId: 20,
    });
    questRepository.findAllWithReward.resolves([quest]);

    eligibilityRepository.find.withArgs({ userId, quest }).resolves([
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

  it('ensure that quest system does not throw error', async function () {
    const error = new Error('my error');
    questRepository.findAllWithReward.throws(error);

    const result = await getQuestResultsForCampaignParticipation({
      userId,
      campaignParticipationId,
      questRepository,
      eligibilityRepository,
      rewardRepository,
      logger,
    });

    expect(logger.error).have.been.calledWithExactly({ event: 'quest-result', err: error }, 'Error on quests');
    expect(result).lengthOf(0);
  });
});

import { DataForQuest } from '../../../../../src/quest/domain/models/DataForQuest.js';
import { Eligibility } from '../../../../../src/quest/domain/models/Eligibility.js';
import {
  CRITERION_COMPARISONS,
  Quest,
  REQUIREMENT_COMPARISONS,
  REQUIREMENT_TYPES,
} from '../../../../../src/quest/domain/models/Quest.js';
import { Success } from '../../../../../src/quest/domain/models/Success.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/index.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | Quest ', function () {
  describe('#constructor', function () {
    it('should throw if args are not valid', function () {
      expect(() => {
        new Quest({ rewardId: 1 });
      }).to.throw();
    });

    it('should not throw if args are valid', function () {
      expect(() => {
        new Quest({
          rewardType: 'attestations',
          rewardId: 1,
          eligibilityRequirements: [
            {
              data: {
                status: {
                  data: ['SHARED', 'TO_SHARE'],
                  comparison: 'one-of',
                },
                targetProfileId: {
                  data: 2,
                  comparison: 'equal',
                },
              },
              comparison: 'all',
              requirement_type: 'campaignParticipations',
            },
          ],
          successRequirements: [
            {
              requirement_type: 'cappedTubes',
              data: {
                cappedTubes: [
                  {
                    tubeId: 'tube11aVujagTGVuMY',
                    level: 2,
                  },
                  {
                    tubeId: 'recBbCIEKgrQi7eb6',
                    level: 5,
                  },
                ],
                threshold: 50,
              },
            },
          ],
        });
      }).not.to.throw();
    });

    it('should throw without args', function () {
      expect(() => {
        new Quest();
      }).to.throw();
    });
  });

  describe('#isEligible', function () {
    it('return true', function () {
      const quest = new Quest({
        rewardId: 1,
        rewardType: 'attestations',
        eligibilityRequirements: [
          {
            requirement_type: REQUIREMENT_TYPES.OBJECT.ORGANIZATION,
            data: {
              type: {
                data: 'SCO',
                comparison: CRITERION_COMPARISONS.EQUAL,
              },
            },
            comparison: REQUIREMENT_COMPARISONS.ALL,
          },
        ],
        successRequirements: [],
      });

      const eligibility = new Eligibility({ organization: { type: 'SCO' } });
      const data = new DataForQuest({ eligibility });

      expect(quest.isEligible(data)).to.be.true;
    });

    it('return false', function () {
      const quest = new Quest({
        rewardId: 1,
        rewardType: 'attestations',
        eligibilityRequirements: [
          {
            requirement_type: REQUIREMENT_TYPES.OBJECT.ORGANIZATION,
            data: {
              type: {
                data: 'SCO',
                comparison: CRITERION_COMPARISONS.EQUAL,
              },
            },
            comparison: REQUIREMENT_COMPARISONS.ALL,
          },
        ],
        successRequirements: [],
      });

      const eligibility = new Eligibility({ organization: { type: 'PRO' } });
      const data = new DataForQuest({ eligibility });

      expect(quest.isEligible(data)).to.be.false;
    });
  });

  describe('#isSuccessful', function () {
    it('returns true when successfulRequirement is empty', function () {
      // given
      const quest = new Quest({
        rewardId: 1,
        rewardType: 'attestations',
        eligibilityRequirements: [],
        successRequirements: [],
      });
      const success = new Success({
        knowledgeElements: [
          { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillA' },
          { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillB' },
          { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillC' },
          { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillD' },
        ],
      });
      const data = new DataForQuest({ success });

      expect(quest.isSuccessful(data)).to.be.true;
    });

    it('returns true when all requirements are met', function () {
      // given
      const quest = new Quest({
        rewardId: 1,
        rewardType: 'attestations',
        eligibilityRequirements: [],
        successRequirements: [
          {
            requirement_type: REQUIREMENT_TYPES.SKILL_PROFILE,
            data: {
              skillIds: ['skillA', 'skillB'],
              threshold: 100,
            },
          },
          {
            requirement_type: REQUIREMENT_TYPES.SKILL_PROFILE,
            data: {
              skillIds: ['skillC', 'skillD'],
              threshold: 50,
            },
          },
        ],
      });
      const success = new Success({
        knowledgeElements: [
          { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillA' },
          { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillB' },
          { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillC' },
          { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillD' },
        ],
        skills: [
          { id: 'skillA', tubeId: 'tubeA', difficulty: 1 },
          { id: 'skillB', tubeId: 'tubeA', difficulty: 1 },
          { id: 'skillC', tubeId: 'tubeA', difficulty: 1 },
          { id: 'skillD', tubeId: 'tubeA', difficulty: 1 },
        ],
      });
      const data = new DataForQuest({ success });

      expect(quest.isSuccessful(data)).to.be.true;
    });

    it('returns false when at least one requirement is not met', function () {
      // given
      const quest = new Quest({
        rewardId: 1,
        rewardType: 'attestations',
        eligibilityRequirements: [],
        successRequirements: [
          {
            requirement_type: REQUIREMENT_TYPES.SKILL_PROFILE,
            data: {
              skillIds: ['skillA', 'skillB'],
              threshold: 100,
            },
          },
          {
            requirement_type: REQUIREMENT_TYPES.SKILL_PROFILE,
            data: {
              skillIds: ['skillC', 'skillD'],
              threshold: 50,
            },
          },
        ],
      });
      const success = new Success({
        knowledgeElements: [
          { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillA' },
          { status: KnowledgeElement.StatusType.INVALIDATED, skillId: 'skillB' },
          { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillC' },
          { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillD' },
        ],
        skills: [
          { id: 'skillA', tubeId: 'tubeA', difficulty: 1 },
          { id: 'skillB', tubeId: 'tubeA', difficulty: 1 },
          { id: 'skillC', tubeId: 'tubeA', difficulty: 1 },
          { id: 'skillD', tubeId: 'tubeA', difficulty: 1 },
        ],
      });
      const data = new DataForQuest({ success });

      expect(quest.isSuccessful(data)).to.be.false;
    });

    it('returns false when none of the requirements are met', function () {
      // given
      const quest = new Quest({
        rewardId: 1,
        rewardType: 'attestations',
        eligibilityRequirements: [],
        successRequirements: [
          {
            requirement_type: REQUIREMENT_TYPES.SKILL_PROFILE,
            data: {
              skillIds: ['skillA', 'skillB'],
              threshold: 100,
            },
          },
          {
            requirement_type: REQUIREMENT_TYPES.SKILL_PROFILE,
            data: {
              skillIds: ['skillC', 'skillD'],
              threshold: 50,
            },
          },
        ],
      });
      const success = new Success({
        knowledgeElements: [
          { status: KnowledgeElement.StatusType.INVALIDATED, skillId: 'skillA' },
          { status: KnowledgeElement.StatusType.INVALIDATED, skillId: 'skillB' },
          { status: KnowledgeElement.StatusType.INVALIDATED, skillId: 'skillC' },
          { status: KnowledgeElement.StatusType.INVALIDATED, skillId: 'skillD' },
        ],
        skills: [
          { id: 'skillA', tubeId: 'tubeA', difficulty: 1 },
          { id: 'skillB', tubeId: 'tubeA', difficulty: 1 },
          { id: 'skillC', tubeId: 'tubeA', difficulty: 1 },
          { id: 'skillD', tubeId: 'tubeA', difficulty: 1 },
        ],
      });
      const data = new DataForQuest({ success });

      expect(quest.isSuccessful(data)).to.be.false;
    });
  });

  describe('#findTargetProfileIdsWithoutCampaignParticipationContributingToQuest', function () {
    it('returns an empty array when there is a campaign participation contributing to quest', function () {
      const eligibilityRequirements = [
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          data: {
            targetProfileId: {
              data: 123,
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
          },
          comparison: REQUIREMENT_COMPARISONS.ALL,
        },
      ];
      const successRequirements = [
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          data: {
            targetProfileId: {
              data: 456,
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
          },
          comparison: REQUIREMENT_COMPARISONS.ALL,
        },
      ];
      const quest = new Quest({
        rewardId: 1,
        rewardType: 'attestations',
        eligibilityRequirements,
        successRequirements,
      });
      const campaignParticipations = [
        { id: 10, targetProfileId: 123 },
        { id: 10, targetProfileId: 456 },
      ];
      const eligibility = new Eligibility({ organization: {}, organizationLearner: {}, campaignParticipations });
      const dataForQuest = new DataForQuest({ eligibility });

      const result = quest.findTargetProfileIdsWithoutCampaignParticipationContributingToQuest(dataForQuest);

      expect(result).to.have.length(0);
    });

    it('returns an array with a targetProfileId when there are no campaign participations contributing to quest', function () {
      const eligibilityRequirements = [
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          data: {
            targetProfileId: {
              data: 1,
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
          },
          comparison: REQUIREMENT_COMPARISONS.ALL,
        },
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          data: {
            status: {
              data: 'SHARED',
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
          },
          comparison: REQUIREMENT_COMPARISONS.ALL,
        },
      ];
      const quest = new Quest({
        rewardId: 1,
        rewardType: 'attestations',
        eligibilityRequirements,
        successRequirements: [],
      });
      const campaignParticipations = [{ id: 10, targetProfileId: 789 }];
      const eligibility = new Eligibility({ organization: {}, organizationLearner: {}, campaignParticipations });
      const dataForQuest = new DataForQuest({ eligibility });

      const result = quest.findTargetProfileIdsWithoutCampaignParticipationContributingToQuest(dataForQuest);

      expect(result).to.have.length(1);
      expect(result[0]).to.equal(1);
    });

    it('returns a flatten array with a targetProfileIds when there are arrays in targetProfileId properties', function () {
      const eligibilityRequirements = [
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          data: {
            targetProfileId: {
              data: [1, 2],
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
          },
          comparison: REQUIREMENT_COMPARISONS.ALL,
        },
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          data: {
            status: {
              data: 'SHARED',
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
          },
          comparison: REQUIREMENT_COMPARISONS.ALL,
        },
      ];
      const quest = new Quest({
        rewardId: 1,
        rewardType: 'attestations',
        eligibilityRequirements,
        successRequirements: [],
      });
      const campaignParticipations = [{ id: 10, targetProfileId: 789 }];
      const eligibility = new Eligibility({ organization: {}, organizationLearner: {}, campaignParticipations });
      const dataForQuest = new DataForQuest({ eligibility });

      const result = quest.findTargetProfileIdsWithoutCampaignParticipationContributingToQuest(dataForQuest);

      expect(result).to.have.length(2);
      expect(result[0]).to.equal(1);
      expect(result[1]).to.equal(2);
    });

    it('returns an array with only target profiles ids without campaign participations contributing to quest', function () {
      const eligibilityRequirements = [
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          data: {
            targetProfileId: {
              data: [123, 456],
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
          },
          comparison: REQUIREMENT_COMPARISONS.ALL,
        },
      ];
      const successRequirements = [
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          data: {
            targetProfileId: {
              data: 789,
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
          },
          comparison: REQUIREMENT_COMPARISONS.ALL,
        },
      ];
      const quest = new Quest({
        rewardId: 1,
        rewardType: 'attestations',
        eligibilityRequirements,
        successRequirements,
      });
      const campaignParticipations = [{ id: 10, targetProfileId: 123 }];
      const eligibility = new Eligibility({ organization: {}, organizationLearner: {}, campaignParticipations });
      const dataForQuest = new DataForQuest({ eligibility });

      const result = quest.findTargetProfileIdsWithoutCampaignParticipationContributingToQuest(dataForQuest);

      expect(result).to.have.length(2);
      expect(result[0]).to.equal(456);
      expect(result[1]).to.equal(789);
    });
  });

  describe('#findCampaignParticipationIdsContributingToQuest', function () {
    it('returns an empty array when there are no campaign participations contributing to quest', function () {
      const eligibilityRequirements = [
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          data: {
            targetProfileId: {
              data: 1,
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
          },
          comparison: REQUIREMENT_COMPARISONS.ALL,
        },
      ];
      const successRequirements = [
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          data: {
            targetProfileId: {
              data: 2,
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
          },
          comparison: REQUIREMENT_COMPARISONS.ALL,
        },
      ];
      const quest = new Quest({
        rewardId: 1,
        rewardType: 'attestations',
        eligibilityRequirements,
        successRequirements,
      });
      const campaignParticipations = [{ id: 10, targetProfileId: 123 }];
      const eligibility = new Eligibility({ organization: {}, organizationLearner: {}, campaignParticipations });
      const dataForQuest = new DataForQuest({ eligibility });

      expect(quest.findCampaignParticipationIdsContributingToQuest(dataForQuest)).to.have.length(0);
    });

    it('returns an array with one id when there is a campaign participation contributing to quest', function () {
      const eligibilityRequirements = [
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          data: {
            targetProfileId: {
              data: 123,
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
          },
          comparison: REQUIREMENT_COMPARISONS.ALL,
        },
      ];
      const quest = new Quest({
        rewardId: 1,
        rewardType: 'attestations',
        eligibilityRequirements,
        successRequirements: [],
      });
      const campaignParticipations = [{ id: 10, targetProfileId: 123 }];
      const eligibility = new Eligibility({ organization: {}, organizationLearner: {}, campaignParticipations });
      const dataForQuest = new DataForQuest({ eligibility });

      const result = quest.findCampaignParticipationIdsContributingToQuest(dataForQuest);

      expect(result).to.have.length(1);
      expect(result[0]).to.equal(10);
    });

    it('returns an array with only ids of campaign participations contributing to quest', function () {
      const eligibilityRequirements = [
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          data: {
            targetProfileId: {
              data: 123,
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
          },
          comparison: REQUIREMENT_COMPARISONS.ALL,
        },
      ];
      const successRequirements = [
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          data: {
            targetProfileId: {
              data: 789,
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
          },
          comparison: REQUIREMENT_COMPARISONS.ALL,
        },
      ];
      const quest = new Quest({
        rewardId: 1,
        rewardType: 'attestations',
        eligibilityRequirements,
        successRequirements,
      });
      const campaignParticipations = [
        { id: 10, targetProfileId: 123 },
        { id: 100, targetProfileId: 456 },
        { id: 1000, targetProfileId: 789 },
      ];
      const eligibility = new Eligibility({ organization: {}, organizationLearner: {}, campaignParticipations });
      const dataForQuest = new DataForQuest({ eligibility });

      const result = quest.findCampaignParticipationIdsContributingToQuest(dataForQuest);

      expect(result).to.have.length(2);
      expect(result[0]).to.equal(10);
      expect(result[1]).to.equal(1000);
    });
  });

  describe('#isCampaignParticipationContributingToQuest', function () {
    const organization = { type: 'SCO' };
    const organizationLearner = { id: 123 };

    context('at least one eligibilityRequirements is type of "campaignParticipations"', function () {
      it('return false if none of campaignParticipation eligibilityRequirement or successRequirement is valid given campaignParticipationId', function () {
        // given
        const eligibilityRequirements = [
          {
            requirement_type: REQUIREMENT_TYPES.OBJECT.ORGANIZATION,
            data: {
              type: {
                data: 'SCO',
                comparison: CRITERION_COMPARISONS.EQUAL,
              },
            },
            comparison: REQUIREMENT_COMPARISONS.ALL,
          },
          {
            requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
            data: {
              targetProfileId: {
                data: 1,
                comparison: CRITERION_COMPARISONS.EQUAL,
              },
            },
            comparison: REQUIREMENT_COMPARISONS.ALL,
          },
        ];
        const successRequirements = [
          {
            requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
            data: {
              targetProfileId: {
                data: 2,
                comparison: CRITERION_COMPARISONS.EQUAL,
              },
            },
            comparison: REQUIREMENT_COMPARISONS.ALL,
          },
        ];
        const quest = new Quest({
          rewardId: 1,
          rewardType: 'attestations',
          eligibilityRequirements,
          successRequirements,
        });
        const campaignParticipations = [
          { id: 10, targetProfileId: 1 },
          { id: 11, targetProfileId: 3 },
        ];
        const eligibility = new Eligibility({ organization, organizationLearner, campaignParticipations });
        const data = new DataForQuest({ eligibility });
        const campaignParticipationIdToCheck = 11;

        // when
        const isContributing = quest.isCampaignParticipationContributingToQuest({
          data,
          campaignParticipationId: campaignParticipationIdToCheck,
        });

        // then
        expect(isContributing).to.be.false;
      });

      it('return true if one of campaignParticipation eligibilityRequirement is valid given campaignParticipationId', function () {
        // given
        const eligibilityRequirements = [
          {
            requirement_type: REQUIREMENT_TYPES.OBJECT.ORGANIZATION,
            data: {
              type: {
                data: 'SCO',
                comparison: CRITERION_COMPARISONS.EQUAL,
              },
            },
            comparison: REQUIREMENT_COMPARISONS.ALL,
          },
          {
            requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
            data: {
              targetProfileId: {
                data: 1,
                comparison: CRITERION_COMPARISONS.EQUAL,
              },
            },
            comparison: REQUIREMENT_COMPARISONS.ALL,
          },
          {
            requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
            data: {
              targetProfileId: {
                data: 2,
                comparison: CRITERION_COMPARISONS.EQUAL,
              },
            },
            comparison: REQUIREMENT_COMPARISONS.ALL,
          },
        ];
        const quest = new Quest({
          rewardId: 1,
          rewardType: 'attestations',
          eligibilityRequirements,
          successRequirements: [],
        });
        const campaignParticipations = [
          { id: 10, targetProfileId: 1 },
          { id: 11, targetProfileId: 3 },
        ];
        const eligibility = new Eligibility({ organization, organizationLearner, campaignParticipations });
        const data = new DataForQuest({ eligibility });
        const campaignParticipationIdToCheck = 10;

        // when
        const isContributing = quest.isCampaignParticipationContributingToQuest({
          data,
          campaignParticipationId: campaignParticipationIdToCheck,
        });

        // then
        expect(isContributing).to.be.true;
      });

      it('return true if one of campaignParticipation successRequirement is valid given campaignParticipationId', function () {
        // given
        const eligibilityRequirements = [
          {
            requirement_type: REQUIREMENT_TYPES.OBJECT.ORGANIZATION,
            data: {
              type: {
                data: 'SCO',
                comparison: CRITERION_COMPARISONS.EQUAL,
              },
            },
            comparison: REQUIREMENT_COMPARISONS.ALL,
          },
        ];
        const successRequirements = [
          {
            requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
            data: {
              targetProfileId: {
                data: 1,
                comparison: CRITERION_COMPARISONS.EQUAL,
              },
            },
            comparison: REQUIREMENT_COMPARISONS.ALL,
          },
          {
            requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
            data: {
              targetProfileId: {
                data: 2,
                comparison: CRITERION_COMPARISONS.EQUAL,
              },
            },
            comparison: REQUIREMENT_COMPARISONS.ALL,
          },
        ];
        const quest = new Quest({
          rewardId: 1,
          rewardType: 'attestations',
          eligibilityRequirements,
          successRequirements,
        });
        const campaignParticipations = [
          { id: 10, targetProfileId: 1 },
          { id: 11, targetProfileId: 3 },
        ];
        const eligibility = new Eligibility({ organization, organizationLearner, campaignParticipations });
        const data = new DataForQuest({ eligibility });
        const campaignParticipationIdToCheck = 10;

        // when
        const isContributing = quest.isCampaignParticipationContributingToQuest({
          data,
          campaignParticipationId: campaignParticipationIdToCheck,
        });

        // then
        expect(isContributing).to.be.true;
      });
    });

    context('eligibilityRequirement without campaignParticipation type', function () {
      it('return false', function () {
        // given
        const eligibilityRequirements = [
          {
            requirement_type: REQUIREMENT_TYPES.OBJECT.ORGANIZATION,
            data: {
              type: {
                data: 'SCO',
                comparison: CRITERION_COMPARISONS.EQUAL,
              },
            },
            comparison: REQUIREMENT_COMPARISONS.ALL,
          },
          {
            requirement_type: REQUIREMENT_TYPES.OBJECT.ORGANIZATION_LEARNER,
            data: {
              id: {
                data: 123,
                comparison: CRITERION_COMPARISONS.EQUAL,
              },
            },
            comparison: REQUIREMENT_COMPARISONS.ALL,
          },
        ];
        const quest = new Quest({
          rewardId: 1,
          rewardType: 'attestations',
          eligibilityRequirements,
          successRequirements: [],
        });
        const campaignParticipations = [{ id: 10 }, { id: 11 }];
        const eligibility = new Eligibility({ organization, organizationLearner, campaignParticipations });
        const data = new DataForQuest({ eligibility });
        const campaignParticipationIdToCheck = 10;

        // when
        const isContributing = quest.isCampaignParticipationContributingToQuest({
          data,
          campaignParticipationId: campaignParticipationIdToCheck,
        });

        // then
        expect(isContributing).to.be.false;
      });
    });
  });

  describe('#toDTO', function () {
    it('should return a DTO version of the Quest', function () {
      // given
      const quest = new Quest({
        id: 123,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2020-02-02'),
        rewardType: 'attestations',
        rewardId: 456,
        eligibilityRequirements: [
          {
            requirement_type: REQUIREMENT_TYPES.COMPOSE,
            comparison: REQUIREMENT_COMPARISONS.ONE_OF,
            data: [
              {
                requirement_type: REQUIREMENT_TYPES.COMPOSE,
                comparison: REQUIREMENT_COMPARISONS.ALL,
                data: [
                  {
                    requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
                    data: {
                      targetProfileId: {
                        data: 1,
                        comparison: CRITERION_COMPARISONS.EQUAL,
                      },
                    },
                    comparison: REQUIREMENT_COMPARISONS.ONE_OF,
                  },
                  {
                    requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
                    data: {
                      targetProfileId: {
                        data: 2,
                        comparison: CRITERION_COMPARISONS.EQUAL,
                      },
                    },
                    comparison: REQUIREMENT_COMPARISONS.ALL,
                  },
                ],
              },
              {
                requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
                data: {
                  targetProfileId: {
                    data: 3,
                    comparison: CRITERION_COMPARISONS.EQUAL,
                  },
                },
                comparison: REQUIREMENT_COMPARISONS.ONE_OF,
              },
            ],
          },
        ],
        successRequirements: [
          {
            requirement_type: REQUIREMENT_TYPES.SKILL_PROFILE,
            data: {
              skillIds: ['id1', 'id2'],
              threshold: 70,
            },
          },
        ],
      });

      // when
      const DTO = quest.toDTO();

      // then
      expect(DTO).to.deep.equal({
        id: 123,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2020-02-02'),
        rewardType: 'attestations',
        rewardId: 456,
        eligibilityRequirements: [
          {
            requirement_type: REQUIREMENT_TYPES.COMPOSE,
            comparison: REQUIREMENT_COMPARISONS.ONE_OF,
            data: [
              {
                requirement_type: REQUIREMENT_TYPES.COMPOSE,
                comparison: REQUIREMENT_COMPARISONS.ALL,
                data: [
                  {
                    requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
                    data: {
                      targetProfileId: {
                        data: 1,
                        comparison: CRITERION_COMPARISONS.EQUAL,
                      },
                    },
                    comparison: REQUIREMENT_COMPARISONS.ONE_OF,
                  },
                  {
                    requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
                    data: {
                      targetProfileId: {
                        data: 2,
                        comparison: CRITERION_COMPARISONS.EQUAL,
                      },
                    },
                    comparison: REQUIREMENT_COMPARISONS.ALL,
                  },
                ],
              },
              {
                requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
                data: {
                  targetProfileId: {
                    data: 3,
                    comparison: CRITERION_COMPARISONS.EQUAL,
                  },
                },
                comparison: REQUIREMENT_COMPARISONS.ONE_OF,
              },
            ],
          },
        ],
        successRequirements: [
          {
            requirement_type: REQUIREMENT_TYPES.SKILL_PROFILE,
            data: {
              skillIds: ['id1', 'id2'],
              threshold: 70,
            },
          },
        ],
      });
    });
  });
});

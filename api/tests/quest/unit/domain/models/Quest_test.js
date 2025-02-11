import { COMPARISON as CRITERION_PROPERTY_COMPARISON } from '../../../../../src/quest/domain/models/CriterionProperty.js';
import { Eligibility, TYPES } from '../../../../../src/quest/domain/models/Eligibility.js';
import { COMPOSE_TYPE } from '../../../../../src/quest/domain/models/EligibilityRequirement.js';
import { Quest } from '../../../../../src/quest/domain/models/Quest.js';
import { COMPARISON } from '../../../../../src/quest/domain/models/Quest.js';
import { Success } from '../../../../../src/quest/domain/models/Success.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/index.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | Quest ', function () {
  describe('#isEligible', function () {
    it('return true', function () {
      const quest = new Quest({
        eligibilityRequirements: [
          {
            requirement_type: TYPES.ORGANIZATION,
            data: {
              type: {
                data: 'SCO',
                comparison: CRITERION_PROPERTY_COMPARISON.EQUAL,
              },
            },
            comparison: COMPARISON.ALL,
          },
        ],
      });

      const eligibility = new Eligibility({ organization: { type: 'SCO' } });

      expect(quest.isEligible(eligibility)).to.be.true;
    });

    it('return false', function () {
      const quest = new Quest({
        eligibilityRequirements: [
          {
            requirement_type: TYPES.ORGANIZATION,
            data: {
              type: {
                data: 'SCO',
                comparison: CRITERION_PROPERTY_COMPARISON.EQUAL,
              },
            },
            comparison: COMPARISON.ALL,
          },
        ],
      });

      const eligibility = new Eligibility({ organization: { type: 'PRO' } });

      expect(quest.isEligible(eligibility)).to.be.false;
    });
  });

  describe('#isSuccessful', function () {
    let quest;

    before(function () {
      // given
      const successRequirements = [
        {
          type: 'skill',
          data: {
            ids: [1, 2, 3],
            threshold: 50,
          },
        },
      ];
      quest = new Quest({ successRequirements, eligibilityRequirements: [] });
    });

    it('should return true if success requirements are met', function () {
      // when
      const success = new Success({
        knowledgeElements: [
          { status: KnowledgeElement.StatusType.VALIDATED },
          { status: KnowledgeElement.StatusType.VALIDATED },
          { status: KnowledgeElement.StatusType.VALIDATED },
          { status: KnowledgeElement.StatusType.INVALIDATED },
        ],
      });

      //then
      expect(quest.isSuccessful(success)).to.equal(true);
    });

    it('should return false if success requirements are not met', function () {
      // when
      const success = new Success({
        knowledgeElements: [
          { status: KnowledgeElement.StatusType.VALIDATED },
          { status: KnowledgeElement.StatusType.INVALIDATED },
          { status: KnowledgeElement.StatusType.INVALIDATED },
          { status: KnowledgeElement.StatusType.INVALIDATED },
        ],
      });

      // then
      expect(quest.isSuccessful(success)).to.equal(false);
    });
  });

  describe('#isCampaignParticipationContributingToQuest', function () {
    const organization = { type: 'SCO' };
    const organizationLearner = { id: 123 };

    context('at least one eligibilityRequirements is type of "campaignParticipations"', function () {
      it('return false if none of campaignParticipation eligibilityRequirement is valid given campaignParticipationId', function () {
        // given
        const eligibilityRequirements = [
          {
            requirement_type: TYPES.ORGANIZATION,
            data: {
              type: {
                data: 'SCO',
                comparison: CRITERION_PROPERTY_COMPARISON.EQUAL,
              },
            },
            comparison: COMPARISON.ALL,
          },
          {
            requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
            data: {
              targetProfileId: {
                data: 1,
                comparison: CRITERION_PROPERTY_COMPARISON.EQUAL,
              },
            },
            comparison: COMPARISON.ALL,
          },
          {
            requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
            data: {
              targetProfileId: {
                data: 2,
                comparison: CRITERION_PROPERTY_COMPARISON.EQUAL,
              },
            },
            comparison: COMPARISON.ALL,
          },
        ];
        const quest = new Quest({ eligibilityRequirements });
        const campaignParticipations = [
          { id: 10, targetProfileId: 1 },
          { id: 11, targetProfileId: 3 },
        ];
        const eligibilityData = new Eligibility({ organization, organizationLearner, campaignParticipations });
        const campaignParticipationIdToCheck = 11;

        // when
        const isContributing = quest.isCampaignParticipationContributingToQuest({
          eligibility: eligibilityData,
          campaignParticipationId: campaignParticipationIdToCheck,
        });

        // then
        expect(isContributing).to.be.false;
      });

      it('return true if one of campaignParticipation eligibilityRequirement is valid given campaignParticipationId', function () {
        // given
        const eligibilityRequirements = [
          {
            requirement_type: TYPES.ORGANIZATION,
            data: {
              type: {
                data: 'SCO',
                comparison: CRITERION_PROPERTY_COMPARISON.EQUAL,
              },
            },
            comparison: COMPARISON.ALL,
          },
          {
            requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
            data: {
              targetProfileId: {
                data: 1,
                comparison: CRITERION_PROPERTY_COMPARISON.EQUAL,
              },
            },
            comparison: COMPARISON.ALL,
          },
          {
            requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
            data: {
              targetProfileId: {
                data: 2,
                comparison: CRITERION_PROPERTY_COMPARISON.EQUAL,
              },
            },
            comparison: COMPARISON.ALL,
          },
        ];
        const quest = new Quest({ eligibilityRequirements });
        const campaignParticipations = [
          { id: 10, targetProfileId: 1 },
          { id: 11, targetProfileId: 3 },
        ];
        const eligibilityData = new Eligibility({ organization, organizationLearner, campaignParticipations });
        const campaignParticipationIdToCheck = 10;

        // when
        const isContributing = quest.isCampaignParticipationContributingToQuest({
          eligibility: eligibilityData,
          campaignParticipationId: campaignParticipationIdToCheck,
        });

        // then
        expect(isContributing).to.be.true;
      });
    });

    context('eligibilityRequirement without campaignParticipation type', function () {
      it('return false when none of eligiblityRequirement is eligible', function () {
        // given
        const eligibilityRequirements = [
          {
            requirement_type: TYPES.ORGANIZATION,
            data: {
              type: {
                data: 'PRO',
                comparison: CRITERION_PROPERTY_COMPARISON.EQUAL,
              },
            },
            comparison: COMPARISON.ALL,
          },
        ];
        const quest = new Quest({ eligibilityRequirements });
        const campaignParticipations = [{ id: 10 }, { id: 11 }];
        const eligibilityData = new Eligibility({ organization, organizationLearner, campaignParticipations });
        const campaignParticipationIdToCheck = 11;

        // when
        const isContributing = quest.isCampaignParticipationContributingToQuest({
          eligibility: eligibilityData,
          campaignParticipationId: campaignParticipationIdToCheck,
        });

        // then
        expect(isContributing).to.be.false;
      });

      it('return false when eligibilityRequirement is partially eligible', function () {
        // given
        const eligibilityRequirements = [
          {
            requirement_type: TYPES.ORGANIZATION,
            data: {
              type: {
                data: 'SCO',
                comparison: CRITERION_PROPERTY_COMPARISON.EQUAL,
              },
            },
            comparison: COMPARISON.ALL,
          },
          {
            requirement_type: TYPES.ORGANIZATION_LEARNER,
            data: {
              id: {
                data: 456,
                comparison: CRITERION_PROPERTY_COMPARISON.EQUAL,
              },
            },
            comparison: COMPARISON.ALL,
          },
        ];
        const quest = new Quest({ eligibilityRequirements });
        const campaignParticipations = [{ id: 10 }, { id: 11 }];
        const eligibilityData = new Eligibility({ organization, organizationLearner, campaignParticipations });
        const campaignParticipationIdToCheck = 11;

        // when
        const isContributing = quest.isCampaignParticipationContributingToQuest({
          eligibility: eligibilityData,
          campaignParticipationId: campaignParticipationIdToCheck,
        });

        // then
        expect(isContributing).to.be.false;
      });

      it('return true if all eligibilityRequirement is valid', function () {
        // given
        const eligibilityRequirements = [
          {
            requirement_type: TYPES.ORGANIZATION,
            data: {
              type: {
                data: 'SCO',
                comparison: CRITERION_PROPERTY_COMPARISON.EQUAL,
              },
            },
            comparison: COMPARISON.ALL,
          },
          {
            requirement_type: TYPES.ORGANIZATION_LEARNER,
            data: {
              type: {
                id: 123,
                comparison: CRITERION_PROPERTY_COMPARISON.EQUAL,
              },
            },
            comparison: COMPARISON.ALL,
          },
        ];
        const quest = new Quest({ eligibilityRequirements });
        const campaignParticipations = [{ id: 10 }, { id: 11 }];
        const eligibilityData = new Eligibility({ organization, organizationLearner, campaignParticipations });
        const campaignParticipationIdToCheck = 10;

        // when
        const isContributing = quest.isCampaignParticipationContributingToQuest({
          eligibility: eligibilityData,
          campaignParticipationId: campaignParticipationIdToCheck,
        });

        // then
        expect(isContributing).to.be.true;
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
        rewardType: 'attestation',
        rewardId: 456,
        eligibilityRequirements: [
          {
            requirement_type: COMPOSE_TYPE,
            comparison: COMPARISON.ONE_OF,
            data: [
              {
                requirement_type: COMPOSE_TYPE,
                comparison: COMPARISON.ALL,
                data: [
                  {
                    requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
                    data: {
                      targetProfileId: {
                        data: 1,
                        comparison: CRITERION_PROPERTY_COMPARISON.EQUAL,
                      },
                    },
                    comparison: COMPARISON.ONE_OF,
                  },
                  {
                    requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
                    data: {
                      targetProfileId: {
                        data: 2,
                        comparison: CRITERION_PROPERTY_COMPARISON.EQUAL,
                      },
                    },
                    comparison: COMPARISON.ALL,
                  },
                ],
              },
              {
                requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
                data: {
                  targetProfileId: {
                    data: 3,
                    comparison: CRITERION_PROPERTY_COMPARISON.EQUAL,
                  },
                },
                comparison: COMPARISON.ONE_OF,
              },
            ],
          },
        ],
        successRequirements: { some: 'success' },
      });

      // when
      const DTO = quest.toDTO();

      // then
      expect(DTO).to.deep.equal({
        id: 123,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2020-02-02'),
        rewardType: 'attestation',
        rewardId: 456,
        eligibilityRequirements: [
          {
            requirement_type: COMPOSE_TYPE,
            comparison: COMPARISON.ONE_OF,
            data: [
              {
                requirement_type: COMPOSE_TYPE,
                comparison: COMPARISON.ALL,
                data: [
                  {
                    requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
                    data: {
                      targetProfileId: {
                        data: 1,
                        comparison: CRITERION_PROPERTY_COMPARISON.EQUAL,
                      },
                    },
                    comparison: COMPARISON.ONE_OF,
                  },
                  {
                    requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
                    data: {
                      targetProfileId: {
                        data: 2,
                        comparison: CRITERION_PROPERTY_COMPARISON.EQUAL,
                      },
                    },
                    comparison: COMPARISON.ALL,
                  },
                ],
              },
              {
                requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
                data: {
                  targetProfileId: {
                    data: 3,
                    comparison: CRITERION_PROPERTY_COMPARISON.EQUAL,
                  },
                },
                comparison: COMPARISON.ONE_OF,
              },
            ],
          },
        ],
        successRequirements: { some: 'success' },
      });
    });
  });
});

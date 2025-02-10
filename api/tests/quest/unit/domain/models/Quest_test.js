import { Eligibility, TYPES } from '../../../../../src/quest/domain/models/Eligibility.js';
import { COMPOSE_TYPE } from '../../../../../src/quest/domain/models/EligibilityRequirement.js';
import { Quest } from '../../../../../src/quest/domain/models/Quest.js';
import { COMPARISON } from '../../../../../src/quest/domain/models/Quest.js';
import { Success } from '../../../../../src/quest/domain/models/Success.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/index.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | Quest ', function () {
  describe('#isEligible', function () {
    describe('when there are requirements of type "requirements"', function () {
      let quest;

      beforeEach(function () {
        quest = new Quest({
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
                        targetProfileId: 1,
                      },
                    },
                    {
                      requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
                      data: {
                        targetProfileId: 2,
                      },
                    },
                  ],
                },
                {
                  requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
                  data: {
                    targetProfileId: 3,
                  },
                },
              ],
            },
          ],
        });
      });

      // eslint-disable-next-line mocha/no-setup-in-describe
      [
        {
          title: 'return false when no requirements passed',
          data: [{ targetProfileId: 1 }],
          expected: false,
        },
        { title: 'return true when one simple requirement passed', data: [{ targetProfileId: 3 }], expected: true },
        {
          title: 'return true when one nested requirement passed',
          data: [{ targetProfileId: 1 }, { targetProfileId: 2 }],
          expected: true,
        },
      ].forEach((test) => {
        it(test.title, function () {
          expect(quest.isEligible(new Eligibility({ campaignParticipations: test.data }))).to.equal(test.expected);
        });
      });
    });

    describe('when comparison is "all"', function () {
      describe('when data to test is a simple value', function () {
        let quest;

        before(function () {
          // given
          const eligibilityRequirements = [
            {
              requirement_type: TYPES.ORGANIZATION,
              data: {
                type: 'SCO',
              },
              comparison: COMPARISON.ALL,
            },
          ];
          quest = new Quest({ eligibilityRequirements });
        });

        it('should return true if is eligible', function () {
          // when
          const organization = { type: 'SCO' };
          const eligibilityData = new Eligibility({ organization });

          // then
          expect(quest.isEligible(eligibilityData)).to.equal(true);
        });

        it('should return false if is not eligible', function () {
          // when
          const organization = { type: 'PRO' };
          const eligibilityData = new Eligibility({ organization });

          // then
          expect(quest.isEligible(eligibilityData)).to.equal(false);
        });
      });

      describe('when data to test is an array', function () {
        let quest;

        before(function () {
          const eligibilityRequirements = [
            {
              requirement_type: TYPES.ORGANIZATION,
              data: {
                tags: ['AGRICULTURE', 'AEFE'],
              },
            },
          ];
          quest = new Quest({ eligibilityRequirements });
        });

        it('should return true if is eligible', function () {
          // when
          const organization = { tags: ['MARITIME', 'AGRICULTURE', 'AEFE'] };
          const eligibilityData = new Eligibility({ organization });

          // then
          expect(quest.isEligible(eligibilityData)).to.equal(true);
        });

        it('should return false if is not eligible', function () {
          // when
          const organization = { tags: ['MARITIME', 'AGRICULTURE'] };
          const eligibilityData = new Eligibility({ organization });

          // then
          expect(quest.isEligible(eligibilityData)).to.equal(false);
        });
      });
    });

    describe('when comparison is "one-of"', function () {
      let quest;

      before(function () {
        const eligibilityRequirements = [
          {
            requirement_type: TYPES.ORGANIZATION,
            data: {
              isManagingStudents: true,
              tags: ['AEFE'],
            },
            comparison: 'one-of',
          },
        ];
        quest = new Quest({ eligibilityRequirements });
      });

      it('should return true if is eligible', function () {
        //when
        const organization = { isManagingStudents: true, tags: ['MARITIME'] };
        const eligibilityData = new Eligibility({ organization });

        // then
        expect(quest.isEligible(eligibilityData)).to.equal(true);
      });

      it('should return false if is not eligible', function () {
        //when
        const organization = { isManagingStudents: false, tags: ['MARITIME', 'AGRICULTURE'] };
        const eligibilityData = new Eligibility({ organization });

        // then
        expect(quest.isEligible(eligibilityData)).to.equal(false);
      });
    });

    describe('when there are multiple eligibility requirements', function () {
      let quest;
      let userTargetProfileId;

      beforeEach(function () {
        // given
        const eligibleTargetProfileId = 1000;
        userTargetProfileId = eligibleTargetProfileId;

        const eligibilityRequirements = [
          {
            requirement_type: TYPES.ORGANIZATION,
            data: {
              type: 'SCO',
            },
            comparison: COMPARISON.ALL,
          },
          {
            requirement_type: TYPES.ORGANIZATION,
            data: {
              isManagingStudents: true,
              tags: ['AEFE'],
            },
            comparison: COMPARISON.ONE_OF,
          },
          {
            requirement_type: TYPES.ORGANIZATION_LEARNER,
            data: {
              MEFCode: '10010012110',
            },
            comparison: COMPARISON.ALL,
          },
          {
            requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
            data: {
              targetProfileIds: [eligibleTargetProfileId],
            },
            comparison: COMPARISON.ALL,
          },
        ];
        quest = new Quest({ eligibilityRequirements });
      });

      it('should return true if all eligibility requirements are met', function () {
        // when
        const organization = { type: 'SCO', isManagingStudents: true, tags: ['AEFE'] };
        const organizationLearner = { MEFCode: '10010012110' };
        const campaignParticipations = [{ targetProfileId: userTargetProfileId }, { targetProfileId: 2000 }];
        const eligibilityData = new Eligibility({ organization, organizationLearner, campaignParticipations });

        // then
        expect(quest.isEligible(eligibilityData)).to.equal(true);
      });

      it('should return false if only some eligibility requirements are met', function () {
        // when
        const organization = { type: 'PRO', isManagingStudents: true, tags: ['AEFE'] };
        const eligibilityData = new Eligibility({ organization });

        // then
        expect(quest.isEligible(eligibilityData)).to.equal(false);
      });

      it('should return true if all eligibility requirements of a same type are met', function () {
        // given
        const organization = { type: 'SCO', isManagingStudents: true, tags: ['AEFE'] };
        const organizationLearner = { MEFCode: '10010012110' };
        const campaignParticipations = [{ targetProfileId: 1 }, { targetProfileId: 2 }];
        const eligibilityData = new Eligibility({ organization, organizationLearner, campaignParticipations });
        const eligibilityRequirements = [
          {
            requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
            data: {
              targetProfileIds: [1],
            },
            comparison: COMPARISON.ALL,
          },
          {
            requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
            data: {
              targetProfileIds: [2, 3],
            },
            comparison: COMPARISON.ALL,
          },
        ];
        quest = new Quest({ eligibilityRequirements });

        // then
        expect(quest.isEligible(eligibilityData)).to.equal(true);
      });

      it('should return false if one of eligibility requirement of a same type is not eligible', function () {
        // given
        const organization = { type: 'SCO', isManagingStudents: true, tags: ['AEFE'] };
        const organizationLearner = { MEFCode: '10010012110' };
        const campaignParticipations = [{ targetProfileId: 1 }, { targetProfileId: 4 }];
        const eligibilityData = new Eligibility({ organization, organizationLearner, campaignParticipations });
        const eligibilityRequirements = [
          {
            requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
            data: {
              targetProfileIds: [1],
            },
            comparison: COMPARISON.ALL,
          },
          {
            requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
            data: {
              targetProfileIds: [2, 3],
            },
            comparison: COMPARISON.ALL,
          },
        ];
        quest = new Quest({ eligibilityRequirements });

        // then
        expect(quest.isEligible(eligibilityData)).to.equal(false);
      });
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
              type: 'SCO',
            },
            comparison: COMPARISON.ALL,
          },
          {
            requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
            data: {
              targetProfileId: [1],
            },
            comparison: COMPARISON.ALL,
          },
          {
            requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
            data: {
              targetProfileId: [2],
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
              type: 'SCO',
            },
            comparison: COMPARISON.ALL,
          },
          {
            requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
            data: {
              targetProfileId: [1],
            },
            comparison: COMPARISON.ALL,
          },
          {
            requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
            data: {
              targetProfileId: [2],
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
              type: 'PRO',
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
              type: 'SCO',
            },
            comparison: COMPARISON.ALL,
          },
          {
            requirement_type: TYPES.ORGANIZATION_LEARNER,
            data: {
              id: 456,
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
              type: 'SCO',
            },
            comparison: COMPARISON.ALL,
          },
          {
            requirement_type: TYPES.ORGANIZATION_LEARNER,
            data: {
              id: 123,
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
                      targetProfileId: 1,
                    },
                    comparison: COMPARISON.ONE_OF,
                  },
                  {
                    requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
                    data: {
                      targetProfileId: 2,
                    },
                    comparison: COMPARISON.ALL,
                  },
                ],
              },
              {
                requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
                data: {
                  targetProfileId: 3,
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
                      targetProfileId: 1,
                    },
                    comparison: COMPARISON.ONE_OF,
                  },
                  {
                    requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
                    data: {
                      targetProfileId: 2,
                    },
                    comparison: COMPARISON.ALL,
                  },
                ],
              },
              {
                requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
                data: {
                  targetProfileId: 3,
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

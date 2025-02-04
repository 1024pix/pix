import { Eligibility, TYPES } from '../../../../../src/quest/domain/models/Eligibility.js';
import { Quest } from '../../../../../src/quest/domain/models/Quest.js';
import { COMPARISON } from '../../../../../src/quest/domain/models/Quest.js';
import { Success, TYPES as SUCCESS_TYPES } from '../../../../../src/quest/domain/models/Success.js';
import { CampaignParticipationStatuses, KnowledgeElement } from '../../../../../src/shared/domain/models/index.js';
import { domainBuilder, expect } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | Quest ', function () {
  describe('#isEligible', function () {
    describe('when comparison is "all"', function () {
      describe('when data to test is a simple value', function () {
        let quest;

        before(function () {
          // given
          const eligibilityRequirements = [
            {
              type: TYPES.ORGANIZATION,
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
              type: TYPES.ORGANIZATION,
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
            type: TYPES.ORGANIZATION,
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

      before(function () {
        // given
        const eligibleTargetProfileId = 1000;
        userTargetProfileId = eligibleTargetProfileId;

        const eligibilityRequirements = [
          {
            type: TYPES.ORGANIZATION,
            data: {
              type: 'SCO',
            },
            comparison: COMPARISON.ALL,
          },
          {
            type: TYPES.ORGANIZATION,
            data: {
              isManagingStudents: true,
              tags: ['AEFE'],
            },
            comparison: COMPARISON.ONE_OF,
          },
          {
            type: TYPES.ORGANIZATION_LEARNER, // Object
            data: {
              MEFCode: '10010012110',
            },
            comparison: COMPARISON.ALL,
          },
          {
            type: TYPES.CAMPAIGN_PARTICIPATIONS, // Array
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
    });

    describe('when you want different comparison of data', function () {
      let quest;

      before(function () {
        // given
        const eligibilityRequirements = [
          {
            type: TYPES.CAMPAIGN_PARTICIPATIONS,
            data: {
              statuses: {
                value: [CampaignParticipationStatuses.TO_SHARE, CampaignParticipationStatuses.SHARED],
                comparison: COMPARISON.ONE_OF,
              },
            },
            comparison: COMPARISON.ALL,
          },
        ];
        quest = new Quest({ eligibilityRequirements });
      });

      it('should return true if eligibility requirements are met', function () {
        // when
        const campaignParticipations = [
          { status: CampaignParticipationStatuses.TO_SHARE },
          { status: CampaignParticipationStatuses.STARTED },
        ];
        const eligibilityData = new Eligibility({ organizationLearner: {}, organization: {}, campaignParticipations });

        // then
        expect(quest.isEligible(eligibilityData)).to.equal(true);
      });

      it('should return false if eligibility requirements are met', function () {
        // when
        const eligibilityData = new Eligibility({
          organizationLearner: {},
          organization: {},
          campaignParticipations: [],
        });

        // then
        expect(quest.isEligible(eligibilityData)).to.equal(false);
      });
    });
  });

  describe('#isSuccessful', function () {
    describe('without requirement', function () {
      it('should return true if successRequirement is undefined', function () {
        const quest = new Quest({});

        //then
        expect(quest.isSuccessful()).to.equal(true);
      });

      it('should return true if successRequirement is empty array', function () {
        const quest = new Quest({ successRequirements: [] });

        //then
        expect(quest.isSuccessful()).to.equal(true);
      });
    });

    describe('type of requirement is SKILL', function () {
      let quest, successRequirements;

      before(function () {
        // given
        successRequirements = [
          {
            type: SUCCESS_TYPES.SKILL,
            data: {
              ids: [1, 2, 3],
              threshold: 50,
            },
          },
        ];
        quest = new Quest({ successRequirements });
      });

      it('should return true if success requirements are met', function () {
        // when
        const success = new Success({
          knowledgeElements: [
            domainBuilder.buildKnowledgeElement({ skillId: 1, status: KnowledgeElement.StatusType.VALIDATED }),
            domainBuilder.buildKnowledgeElement({ skillId: 2, status: KnowledgeElement.StatusType.VALIDATED }),
            domainBuilder.buildKnowledgeElement({ skillId: 3, status: KnowledgeElement.StatusType.INVALIDATED }),
          ],
        });

        //then
        expect(quest.isSuccessful(success)).to.equal(true);
      });

      it('should return false if success requirements are not met', function () {
        // when
        const success = new Success({
          knowledgeElements: [
            domainBuilder.buildKnowledgeElement({ skillId: 1, status: KnowledgeElement.StatusType.VALIDATED }),
            domainBuilder.buildKnowledgeElement({ skillId: 2, status: KnowledgeElement.StatusType.INVALIDATED }),
            domainBuilder.buildKnowledgeElement({ skillId: 3, status: KnowledgeElement.StatusType.INVALIDATED }),
          ],
        });

        // then
        expect(quest.isSuccessful(success)).to.equal(false);
      });

      it('should return true if multiple success requirements are met', function () {
        // when
        const success = new Success({
          knowledgeElements: [
            domainBuilder.buildKnowledgeElement({ skillId: 1, status: KnowledgeElement.StatusType.VALIDATED }),
            domainBuilder.buildKnowledgeElement({ skillId: 2, status: KnowledgeElement.StatusType.VALIDATED }),
            domainBuilder.buildKnowledgeElement({ skillId: 3, status: KnowledgeElement.StatusType.INVALIDATED }),
            domainBuilder.buildKnowledgeElement({ skillId: 4, status: KnowledgeElement.StatusType.VALIDATED }),
            domainBuilder.buildKnowledgeElement({ skillId: 5, status: KnowledgeElement.StatusType.VALIDATED }),
          ],
        });

        successRequirements = [
          ...successRequirements,
          {
            type: SUCCESS_TYPES.SKILL,
            data: {
              ids: [4, 5],
              threshold: 100,
            },
          },
        ];
        quest = new Quest({ successRequirements });
        //then
        expect(quest.isSuccessful(success)).to.equal(true);
      });

      it('should return false if multiple success requirements are met', function () {
        // when
        const success = new Success({
          knowledgeElements: [
            domainBuilder.buildKnowledgeElement({ skillId: 1, status: KnowledgeElement.StatusType.VALIDATED }),
            domainBuilder.buildKnowledgeElement({ skillId: 2, status: KnowledgeElement.StatusType.VALIDATED }),
            domainBuilder.buildKnowledgeElement({ skillId: 3, status: KnowledgeElement.StatusType.INVALIDATED }),
            domainBuilder.buildKnowledgeElement({ skillId: 4, status: KnowledgeElement.StatusType.VALIDATED }),
            domainBuilder.buildKnowledgeElement({ skillId: 5, status: KnowledgeElement.StatusType.INVALIDATED }),
          ],
        });

        successRequirements = [
          ...successRequirements,
          {
            type: SUCCESS_TYPES.SKILL,
            data: {
              ids: [4, 5],
              threshold: 100,
            },
          },
        ];
        quest = new Quest({ successRequirements });
        //then
        expect(quest.isSuccessful(success)).to.equal(false);
      });
    });
  });
});

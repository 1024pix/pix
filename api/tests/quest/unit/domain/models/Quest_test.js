import { Eligibility, TYPES } from '../../../../../src/quest/domain/models/Eligibility.js';
import { Quest } from '../../../../../src/quest/domain/models/Quest.js';
import { COMPARISON } from '../../../../../src/quest/domain/models/Quest.js';
import { Success } from '../../../../../src/quest/domain/models/Success.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/index.js';
import { expect } from '../../../../test-helper.js';

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

      beforeEach(function () {
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
            type: TYPES.ORGANIZATION_LEARNER,
            data: {
              MEFCode: '10010012110',
            },
            comparison: COMPARISON.ALL,
          },
          {
            type: TYPES.CAMPAIGN_PARTICIPATIONS,
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
            type: TYPES.CAMPAIGN_PARTICIPATIONS,
            data: {
              targetProfileIds: [1],
            },
            comparison: COMPARISON.ALL,
          },
          {
            type: TYPES.CAMPAIGN_PARTICIPATIONS,
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
            type: TYPES.CAMPAIGN_PARTICIPATIONS,
            data: {
              targetProfileIds: [1],
            },
            comparison: COMPARISON.ALL,
          },
          {
            type: TYPES.CAMPAIGN_PARTICIPATIONS,
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
      quest = new Quest({ successRequirements });
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
});

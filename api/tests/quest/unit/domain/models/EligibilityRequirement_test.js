import { TYPES } from '../../../../../src/quest/domain/models/Eligibility.js';
import { Eligibility } from '../../../../../src/quest/domain/models/Eligibility.js';
import { COMPOSE_TYPE, EligibilityRequirement } from '../../../../../src/quest/domain/models/EligibilityRequirement.js';
import { COMPARISON } from '../../../../../src/quest/domain/models/Quest.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | EligibilityRequirement ', function () {
  describe('#constructor', function () {
    describe('when requirement_type is compose', function () {
      it('should build the same instance whether we are passing through raw requirements or instanciated requirements', function () {
        // given
        const eligibilityRequirementA = new EligibilityRequirement({
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
        });
        const eligibilityRequirementB = new EligibilityRequirement({
          requirement_type: eligibilityRequirementA.requirement_type,
          comparison: eligibilityRequirementA.comparison,
          data: eligibilityRequirementA.data,
        });

        // when / then
        expect(eligibilityRequirementA.toDTO()).to.deep.equal(eligibilityRequirementB.toDTO());
      });
    });

    describe('when requirement_type is not compose', function () {
      it('should build the same instance whether we are passing through raw criterion or instanciated criterion', function () {
        // given
        const eligibilityRequirementA = new EligibilityRequirement({
          requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
          comparison: COMPARISON.ALL,
          data: {
            targetProfileId: 1,
          },
        });
        const eligibilityRequirementB = new EligibilityRequirement({
          requirement_type: eligibilityRequirementA.requirement_type,
          comparison: eligibilityRequirementA.comparison,
          data: eligibilityRequirementA.data,
        });

        // when / then
        expect(eligibilityRequirementA.toDTO()).to.deep.equal(eligibilityRequirementB.toDTO());
      });
    });
  });

  describe('isEligible', function () {
    describe('when requirement_type is compose', function () {
      describe('when comparison is ALL', function () {
        it('should return true if all requirements are met', function () {
          const eligibilityRequirement = new EligibilityRequirement({
            requirement_type: COMPOSE_TYPE,
            comparison: COMPARISON.ALL,
            data: [
              {
                requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
                data: {
                  targetProfileId: 1,
                },
                comparison: COMPARISON.ALL,
              },
              {
                requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
                data: {
                  targetProfileId: 2,
                },
                comparison: COMPARISON.ALL,
              },
            ],
          });
          const eligibility = new Eligibility({
            campaignParticipations: [{ targetProfileId: 1 }, { targetProfileId: 2 }],
          });

          expect(eligibilityRequirement.isEligible(eligibility)).to.be.true;
        });

        it('should return false if all requirements are not met', function () {
          const eligibilityRequirement = new EligibilityRequirement({
            requirement_type: COMPOSE_TYPE,
            comparison: COMPARISON.ALL,
            data: [
              {
                requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
                data: {
                  targetProfileId: 1,
                },
                comparison: COMPARISON.ALL,
              },
              {
                requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
                data: {
                  targetProfileId: 2,
                },
                comparison: COMPARISON.ALL,
              },
            ],
          });
          const eligibility = new Eligibility({
            campaignParticipations: [{ targetProfileId: 1 }, { targetProfileId: 3 }],
          });

          expect(eligibilityRequirement.isEligible(eligibility)).to.be.false;
        });
      });

      describe('when comparison is ONE_OF', function () {
        it('should return true if one of the requirements is met', function () {
          const eligibilityRequirement = new EligibilityRequirement({
            requirement_type: COMPOSE_TYPE,
            comparison: COMPARISON.ONE_OF,
            data: [
              {
                requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
                data: {
                  targetProfileId: 1,
                },
                comparison: COMPARISON.ALL,
              },
              {
                requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
                data: {
                  targetProfileId: 2,
                },
                comparison: COMPARISON.ALL,
              },
            ],
          });
          const eligibility = new Eligibility({
            campaignParticipations: [{ targetProfileId: 1 }],
          });

          expect(eligibilityRequirement.isEligible(eligibility)).to.be.true;
        });

        it('should return false if none of the requirements are met', function () {
          const eligibilityRequirement = new EligibilityRequirement({
            requirement_type: COMPOSE_TYPE,
            comparison: COMPARISON.ONE_OF,
            data: [
              {
                requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
                data: {
                  targetProfileId: 1,
                },
                comparison: COMPARISON.ALL,
              },
              {
                requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
                data: {
                  targetProfileId: 2,
                },
                comparison: COMPARISON.ALL,
              },
            ],
          });
          const eligibility = new Eligibility({
            campaignParticipations: [{ targetProfileId: 3 }],
          });

          expect(eligibilityRequirement.isEligible(eligibility)).to.be.false;
        });
      });
    });

    describe('when requirement_type is not compose', function () {
      describe('when eligibility attribute is not an array', function () {
        it('it should return true if criterion is valid', function () {
          const eligibilityRequirement = new EligibilityRequirement({
            requirement_type: TYPES.ORGANIZATION,
            comparison: COMPARISON.ALL,
            data: {
              type: 'SCO',
            },
          });
          const eligibility = new Eligibility({
            organization: {
              type: 'SCO',
            },
          });

          expect(eligibilityRequirement.isEligible(eligibility)).to.be.true;
        });

        it('it should return false if criterion is not valid', function () {
          const eligibilityRequirement = new EligibilityRequirement({
            requirement_type: TYPES.ORGANIZATION,
            comparison: COMPARISON.ALL,
            data: {
              type: 'SCO',
            },
          });
          const eligibility = new Eligibility({
            organization: {
              type: 'PRO',
            },
          });

          expect(eligibilityRequirement.isEligible(eligibility)).to.be.false;
        });
      });

      describe('when eligibility attribute is an array', function () {
        it('it should return true if one of the eligibility item validate criterion', function () {
          const eligibilityRequirement = new EligibilityRequirement({
            requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
            comparison: COMPARISON.ALL,
            data: {
              targetProfileId: 1,
            },
          });
          const eligibility = new Eligibility({
            campaignParticipations: [{ targetProfileId: 2 }, { targetProfileId: 1 }],
          });

          expect(eligibilityRequirement.isEligible(eligibility)).to.be.true;
        });

        it('it should return false if none of the eligibility item validate criterion', function () {
          const eligibilityRequirement = new EligibilityRequirement({
            requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
            comparison: COMPARISON.ALL,
            data: {
              targetProfileId: 3,
            },
          });
          const eligibility = new Eligibility({
            campaignParticipations: [{ targetProfileId: 2 }, { targetProfileId: 1 }],
          });

          expect(eligibilityRequirement.isEligible(eligibility)).to.be.false;
        });
      });
    });
  });

  describe('#toDTO', function () {
    it('should recursively unstack inside EligibilityRequirements into DTO', function () {
      // given
      const rootEligibilityRequirement = new EligibilityRequirement({
        requirement_type: COMPOSE_TYPE,
        data: [
          {
            requirement_type: TYPES.ORGANIZATION,
            data: 'someDataA',
            comparison: COMPARISON.ALL,
          },
          {
            requirement_type: COMPOSE_TYPE,
            data: [
              {
                requirement_type: TYPES.ORGANIZATION_LEARNER,
                data: 'someDataB',
                comparison: COMPARISON.ONE_OF,
              },
              {
                requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
                data: 'someDataC',
                comparison: COMPARISON.ONE_OF,
              },
            ],
            comparison: COMPARISON.ALL,
          },
        ],
        comparison: COMPARISON.ALL,
      });

      // when
      const DTO = rootEligibilityRequirement.toDTO();

      // then
      expect(DTO).to.deep.equal({
        requirement_type: COMPOSE_TYPE,
        data: [
          {
            requirement_type: TYPES.ORGANIZATION,
            data: 'someDataA',
            comparison: COMPARISON.ALL,
          },
          {
            requirement_type: COMPOSE_TYPE,
            data: [
              {
                requirement_type: TYPES.ORGANIZATION_LEARNER,
                data: 'someDataB',
                comparison: COMPARISON.ONE_OF,
              },
              {
                requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
                data: 'someDataC',
                comparison: COMPARISON.ONE_OF,
              },
            ],
            comparison: COMPARISON.ALL,
          },
        ],
        comparison: COMPARISON.ALL,
      });
    });
  });
});

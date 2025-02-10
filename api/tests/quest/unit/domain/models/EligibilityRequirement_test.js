import { TYPES } from '../../../../../src/quest/domain/models/Eligibility.js';
import { COMPOSE_TYPE, EligibilityRequirement } from '../../../../../src/quest/domain/models/EligibilityRequirement.js';
import { COMPARISON } from '../../../../../src/quest/domain/models/Quest.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | EligibilityRequirement ', function () {
  describe('#constructor', function () {
    context('when requirement_type is compose', function () {
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
    context('when requirement_type is not compose', function () {
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

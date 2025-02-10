import { TYPES } from '../../../../../src/quest/domain/models/Eligibility.js';
import { COMPOSE_TYPE, EligibilityRequirement } from '../../../../../src/quest/domain/models/EligibilityRequirement.js';
import { COMPARISON } from '../../../../../src/quest/domain/models/Quest.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | EligibilityRequirement ', function () {
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

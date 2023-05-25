import { expect, domainBuilder } from '../../../../test-helper.js';
import { scenarioSimulatorSerializer } from '../../../../../lib/infrastructure/serializers/jsonapi/scenario-simulator-serializer.js';

describe('Unit | Serializer | JSONAPI | scenario-simulator-serializer', function () {
  describe('#serialize', function () {
    it('should convert an scenario simulator object into JSON API data', function () {
      // given
      const challenge = domainBuilder.buildChallenge({
        id: '1',
        successProbabilityThreshold: 0.5,
        difficulty: 0.6,
        discriminant: 0.5,
      });
      const scenarioSimulator = {
        challenge,
        reward: 2,
        estimatedLevel: 1,
        errorRate: 1.5,
        answer: 'ok',
      };

      // when
      const scenarioSimulatorMember = scenarioSimulatorSerializer.serialize(scenarioSimulator);

      // then
      expect(scenarioSimulatorMember).to.deep.equal({
        data: {
          attributes: {
            'error-rate': 1.5,
            'estimated-level': 1,
            'minimum-capability': 0.6,
            difficulty: 0.6,
            discriminant: 0.5,
            answer: 'ok',
            reward: 2,
          },
          id: '1',
          type: 'scenario-simulator-challenges',
        },
      });
    });
  });
});

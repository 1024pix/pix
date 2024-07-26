import { scenarioSimulatorBatchSerializer } from '../../../../../../src/certification/flash-certification/infrastructure/serializers/scenario-simulator-batch-serializer.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | scenario-simulator-batch-serializer', function () {
  describe('#serialize', function () {
    it('should convert scenario simulator objects into JSON API data', function () {
      // given
      const challenge = domainBuilder.buildChallenge({
        id: '1',
        successProbabilityThreshold: 0.5,
        difficulty: 0.6,
        discriminant: 0.5,
      });
      const scenarioSimulator = [
        {
          index: 0,
          simulationReport: [
            {
              challenge,
              reward: 2,
              capacity: 1,
              errorRate: 1.5,
              answerStatus: 'ok',
              difficulty: 0.6,
              discriminant: 0.5,
            },
          ],
        },
      ];

      // when
      const scenarioSimulatorMember = scenarioSimulatorBatchSerializer.serialize(scenarioSimulator);

      // then
      expect(scenarioSimulatorMember).to.deep.equal({
        data: [
          {
            attributes: {
              'simulation-report': [
                {
                  'challenge-id': challenge.id,
                  'answer-status': 'ok',
                  'error-rate': 1.5,
                  capacity: 1,
                  'minimum-capability': 0.6,
                  reward: 2,
                  difficulty: 0.6,
                  discriminant: 0.5,
                },
              ],
            },
            id: '0',
            type: 'scenario-simulator-batches',
          },
        ],
      });
    });
  });
});

import { expect, domainBuilder } from '../../../../../../test-helper.js';
import { scenarioSimulatorBatchSerializer } from '../../../../../../../src/certification/assessment/infrastructure/serializers/jsonapi/scenario-simulator-batch-serializer.js';

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
              estimatedLevel: 1,
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
                  'estimated-level': 1,
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

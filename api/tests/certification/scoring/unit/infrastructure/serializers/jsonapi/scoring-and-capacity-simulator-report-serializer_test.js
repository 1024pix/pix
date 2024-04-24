import * as serializer from '../../../../../../../src/certification/scoring/infrastructure/serializers/jsonapi/scoring-and-capacity-simulator-report-serializer.js';
import { domainBuilder, expect } from '../../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | scoring-and-capacity-simulator-report', function () {
  describe('#serialize', function () {
    it('should convert a ScoringAndCapacitySimulatorReport model object into JSON API data', function () {
      // given
      const scoringAndCapacitySimulatorReport = domainBuilder.buildScoringAndCapacitySimulatorReport({
        score: 128,
        capacity: undefined,
        competences: [{ competenceCode: '1.1', level: 7 }],
      });

      const expectedSerializedScoringAndCapacitySimulatorReport = {
        data: {
          attributes: {
            score: 128,
            capacity: undefined,
            competences: [{ competenceCode: '1.1', level: 7 }],
          },
          type: 'scoring-and-capacity-simulator-reports',
        },
      };

      // when
      const json = serializer.serialize(scoringAndCapacitySimulatorReport);

      // then
      expect(json).to.deep.equal(expectedSerializedScoringAndCapacitySimulatorReport);
    });
  });
});

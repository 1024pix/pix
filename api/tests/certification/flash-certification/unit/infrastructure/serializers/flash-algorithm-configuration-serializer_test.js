import * as serializer from '../../../../../../src/certification/flash-certification/infrastructure/serializers/flash-algorithm-configuration-serializer.js';
import { FlashAssessmentAlgorithmConfiguration } from '../../../../../../src/certification/shared/domain/models/FlashAssessmentAlgorithmConfiguration.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Certification | flash-certification | Serializer | flash-algorithm-configuration-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a FlashAssessmentAlgorithmConfiguration model object into correct JSON API data', function () {
      // given
      const expectedJsonApi = {
        data: {
          id: '0',
          type: 'flash-algorithm-configurations',
          attributes: {
            'warm-up-length': 1,
            'forced-competences': 2,
            'maximum-assessment-length': 3,
            'challenges-between-same-competence': 4,
            'double-measures-until': 5,
            'variation-percent': 6,
            'variation-percent-until': 7,
            'minimum-estimated-success-rate-ranges': [],
            'limit-to-one-question-per-tube': false,
            'enable-passage-by-all-competences': true,
          },
        },
      };

      const flashAlgorithmConfiguration = new FlashAssessmentAlgorithmConfiguration({
        warmUpLength: 1,
        forcedCompetences: 2,
        maximumAssessmentLength: 3,
        challengesBetweenSameCompetence: 4,
        doubleMeasuresUntil: 5,
        variationPercent: 6,
        variationPercentUntil: 7,
        minimumEstimatedSuccessRateRanges: [],
        limitToOneQuestionPerTube: false,
        enablePassageByAllCompetences: true,
      });

      // when
      const json = serializer.serialize({ flashAlgorithmConfiguration });

      // then
      expect(json).to.deep.equal(expectedJsonApi);
    });
  });
});

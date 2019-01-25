const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/smart-placement-progression-serializer');

describe('Unit | Serializer | JSONAPI | smart-placement-progression-serializer', function() {

  describe('#serialize()', function() {

    it('should convert a SmartPlacementProgression model object into JSON API data', function() {
      const smartPlacementProgression = domainBuilder.buildSmartPlacementProgression();

      // when
      const json = serializer.serialize(smartPlacementProgression);

      // then
      expect(json).to.deep.equal({
        'data': {
          'type': 'smart-placement-progressions',
          'id': smartPlacementProgression.id,
          'attributes': {
            'validation-rate': smartPlacementProgression.validationRate,
            'completion-rate': smartPlacementProgression.completionRate,
          },
        },
      });
    });
  });
});

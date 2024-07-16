import * as serializer from '../../../../../../src/shared/infrastructure/serializers/jsonapi/feature-toggle-serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | feature-toggle-serializer', function () {
  describe('#serialize', function () {
    it('should convert feature-toggle object into JSON API data', function () {
      // given
      const featureToggles = {
        someFeatureToggle: true,
      };
      const expectedJSON = {
        data: {
          type: 'feature-toggles',
          id: '0',
          attributes: {
            'some-feature-toggle': true,
          },
        },
      };

      // when
      const json = serializer.serialize(featureToggles);

      // then
      expect(json).to.deep.equal(expectedJSON);
    });
  });
});

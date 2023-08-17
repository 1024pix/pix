import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/progression-serializer.js';
import { domainBuilder, expect } from '../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | progression-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a Progression model object into JSON API data', function () {
      const progression = domainBuilder.buildProgression();

      // when
      const json = serializer.serialize(progression);

      // then
      expect(json).to.deep.equal({
        data: {
          type: 'progressions',
          id: progression.id,
          attributes: {
            'completion-rate': progression.completionRate,
          },
        },
      });
    });
  });
});

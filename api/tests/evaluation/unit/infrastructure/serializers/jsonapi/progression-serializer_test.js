import { expect, domainBuilder } from '../../../../../test-helper.js';
import * as serializer from '../../../../../../src/evaluation/infrastructure/serializers/jsonapi/progression-serializer.js';

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

import { progressionSerializer } from '../../../../../../src/evaluation/infrastructure/serializers/jsonapi/progression-serializer.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Serializer | JSONAPI | progression-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a Progression model object into JSON API data', function () {
      const progression = domainBuilder.buildProgression();

      // when
      const json = progressionSerializer.serialize(progression);

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

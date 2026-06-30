import { tagSerializer } from '../../../../../../src/organizational-entities/infrastructure/serializers/jsonapi/tag-serializer.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Organizational Entities | Serializer | JSONAPI | tag', function () {
  describe('#serialize', function () {
    it('converts a tag model to JSON', function () {
      // given
      const tag = domainBuilder.buildTag({ name: 'TAG1' });

      const expectedSerializedTag = {
        data: {
          attributes: {
            name: tag.name,
          },
          id: tag.id.toString(),
          type: 'tags',
        },
      };

      // when
      const json = tagSerializer.serialize(tag);

      // then
      expect(json).to.deep.equal(expectedSerializedTag);
    });
  });
});

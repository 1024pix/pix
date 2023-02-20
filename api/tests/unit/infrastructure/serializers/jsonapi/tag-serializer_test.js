import { expect, domainBuilder } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/tag-serializer';

describe('Unit | Serializer | JSONAPI | tag-serializer', function () {
  describe('#serialize', function () {
    it('should convert a tag model to JSON', function () {
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
      const json = serializer.serialize(tag);

      // then
      expect(json).to.deep.equal(expectedSerializedTag);
    });
  });
});

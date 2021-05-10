const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/tag-serializer');

describe('Unit | Serializer | JSONAPI | tag-serializer', () => {

  describe('#serialize', function() {

    it('should convert a tag model object into JSON API data', () => {
      // given
      const tag = domainBuilder.buildTag({ id: 1, name: 'TAG1' });

      const expectedSerializedTag = {
        data: {
          attributes: {
            name: 'TAG1',
          },
          id: '1',
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

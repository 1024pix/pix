const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/badge-serializer');

describe('Unit | Serializer | JSONAPI | badge-serializer', function() {

  describe('#serialize', function() {

    it('should convert a Badge model object into JSON API data', function() {
      // given
      const badge = domainBuilder.buildBadge({
        id: '1',
        imageUrl: '/img/banana.svg',
        message: 'You won a banana badge',
        targetProfileId: '1',
      });

      const expectedSerializedBadge = {
        data: {
          attributes: {
            'image-url': '/img/banana.svg',
            message: 'You won a banana badge',
          },
          id: '1',
          type: 'badges'
        }
      };

      // when
      const json = serializer.serialize(badge);

      // then
      expect(json).to.deep.equal(expectedSerializedBadge);
    });
  });

});

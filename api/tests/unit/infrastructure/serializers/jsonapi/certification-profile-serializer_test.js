const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/is-certifiable-serializer');

describe('Unit | Serializer | JSONAPI | certification-profile-serializer', function() {

  describe('#serialize()', function() {

    it('should format is-certifiable response into JSON API data', function() {
      // given
      const isCertifiable = true;
      const userId = 104;

      // when
      const json = serializer.serialize({ isCertifiable, userId });

      // then
      expect(json).to.deep.equal({
        data: {
          type: 'isCertifiables',
          attributes: {
            'is-certifiable': true,
          },
          id: '104',
        },
      });
    });
  });
});

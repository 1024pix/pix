const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/password-reset-serializer');

describe('Unit | Serializer | JSONAPI | password-reset-serializer', function() {

  describe('#serialize', function() {

    it('should convert password-reset-object to JSON-API', () => {
      // given
      const passwordResetDemand = {
        id: 1,
        email: 'toto@pix.fr',
        temporaryKey : 'one key'
      };
      const expectedSerializedPasswordReset = {
        data : {
          type : 'password-resets',
          id : '1',
          attributes : {
            email : 'toto@pix.fr',
            'temporary-key' : 'one key'
          }
        }
      };

      // when
      const result = serializer.serialize(passwordResetDemand);

      // then
      expect(result).to.deep.equal(expectedSerializedPasswordReset);
    });
  });

});

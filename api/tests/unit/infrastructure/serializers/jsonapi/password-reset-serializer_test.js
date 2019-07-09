const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/password-reset-serializer');

describe('Unit | Serializer | JSONAPI | password-reset-serializer', () => {

  describe('#serialize', () => {

    it('should convert passwordResets to JSON-API', () => {
      // given
      const passwordReset = {
        id: '1',
        password: 'pix123',
        temporaryKey: 'one key',
      };

      const expectedSerializedPasswordReset = {
        data: {
          type: 'password-resets',
          id: '1',
          attributes: {
            password: 'pix123',
            'temporary-key': 'one key',
          },
        },
      };

      // when
      const result = serializer.serialize(passwordReset);

      // then
      expect(result).to.deep.equal(expectedSerializedPasswordReset);
    });
  });
});

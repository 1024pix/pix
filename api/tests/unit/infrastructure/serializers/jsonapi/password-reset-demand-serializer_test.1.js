const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/password-reset-demand-serializer');

describe('Unit | Serializer | JSONAPI | password-reset-demand-serializer', () => {

  describe('#serialize', () => {

    it('should convert passwordResetDemands to JSON-API', () => {
      // given
      const passwordResetDemand = {
        id: '1',
        email: 'user@pix.fr',
        temporaryKey: 'one key',
      };

      const expectedSerializedPasswordResetDemand = {
        data: {
          type: 'password-reset-demands',
          id: '1',
          attributes: {
            email: 'user@pix.fr',
            'temporary-key': 'one key',
          },
        },
      };

      // when
      const result = serializer.serialize(passwordResetDemand);

      // then
      expect(result).to.deep.equal(expectedSerializedPasswordResetDemand);
    });
  });
});

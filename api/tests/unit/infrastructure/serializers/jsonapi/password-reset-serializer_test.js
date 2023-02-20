import { expect } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/password-reset-serializer';

describe('Unit | Serializer | JSONAPI | password-reset-serializer', function () {
  describe('#serialize', function () {
    it('should convert password-reset-object to JSON-API', function () {
      // given
      const passwordResetDemand = {
        id: '1',
        email: 'toto@pix.fr',
        temporaryKey: 'one key',
      };
      const expectedSerializedPasswordReset = {
        data: {
          type: 'password-reset-demands',
          id: '1',
          attributes: {
            email: 'toto@pix.fr',
          },
        },
      };

      const result = serializer.serialize(passwordResetDemand);

      // then
      expect(result).to.deep.equal(expectedSerializedPasswordReset);
    });
  });
});

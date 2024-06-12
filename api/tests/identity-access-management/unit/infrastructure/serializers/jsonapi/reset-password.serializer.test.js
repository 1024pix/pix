import * as serializer from '../../../../../../src/identity-access-management/infrastructure/serializers/jsonapi/reset-password.serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Identity Access Management | Infrastructure | Serializer | JSONAPI | reset-password', function () {
  describe('#serialize', function () {
    it('converts reset-password-object to JSON-API', function () {
      // given
      const resetPasswordDemand = {
        id: '1',
        email: 'toto@pix.fr',
        temporaryKey: 'one key',
      };
      const expectedSerializedResetPasswordDemand = {
        data: {
          type: 'password-reset-demands',
          id: '1',
          attributes: {
            email: 'toto@pix.fr',
          },
        },
      };

      const result = serializer.serialize(resetPasswordDemand);

      // then
      expect(result).to.deep.equal(expectedSerializedResetPasswordDemand);
    });
  });
});

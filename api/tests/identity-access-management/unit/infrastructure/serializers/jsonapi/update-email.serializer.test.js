import { updateEmailSerializer } from '../../../../../../src/identity-access-management/infrastructure/serializers/jsonapi/update-email.serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Identity Access Management | Infrastructure | Serializer | JSONAPI | update-email-serializer', function () {
  describe('#serialize()', function () {
    it('should convert user new email into JSON API data', function () {
      //given
      const updatedUserAttributes = {
        email: 'new-email@example.net',
      };

      // when
      const json = updateEmailSerializer.serialize(updatedUserAttributes);

      // then
      const expectedJsonApi = {
        data: {
          type: 'email-verification-codes',
          attributes: {
            email: updatedUserAttributes.email,
          },
        },
      };
      expect(json).to.deep.equal(expectedJsonApi);
    });
  });
});

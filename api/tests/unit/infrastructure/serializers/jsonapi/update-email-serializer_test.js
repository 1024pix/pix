import { expect } from '../../../../test-helper.js';
import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/update-email-serializer.js';

describe('Unit | Serializer | JSONAPI | update-email-serializer', function () {
  describe('#serialize()', function () {
    it('should convert user new email into JSON API data', function () {
      //given
      const updatedUserAttributes = {
        email: 'new-email@example.net',
      };

      // when
      const json = serializer.serialize(updatedUserAttributes);

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

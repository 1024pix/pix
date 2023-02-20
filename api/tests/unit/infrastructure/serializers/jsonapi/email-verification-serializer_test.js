import { expect } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/email-verification-serializer';

describe('Unit | Serializer | JSONAPI | email-verification-serializer', function () {
  describe('#deserialize()', function () {
    it('should convert the payload json to email information', async function () {
      //given
      const payload = {
        data: {
          type: 'email-verification-code',
          attributes: {
            'new-email': '   EMAIL@example.net   ',
            password: 'myPassword',
          },
        },
      };

      // when
      const json = await serializer.deserialize(payload);

      // then
      const expectedJsonApi = {
        password: 'myPassword',
        newEmail: 'email@example.net',
      };
      expect(json).to.deep.equal(expectedJsonApi);
    });
  });
});

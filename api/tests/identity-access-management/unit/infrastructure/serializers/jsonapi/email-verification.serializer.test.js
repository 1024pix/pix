import { emailVerificationSerializer } from '../../../../../../src/identity-access-management/infrastructure/serializers/jsonapi/email-verification.serializer.js';

describe('Unit | Serializer | JSONAPI | email-verification-serializer', function () {
  describe('#deserialize()', function () {
    it('should convert the payload json to email information', async function () {
      //given
      const payload = {
        data: {
          type: 'email-verification-code',
          attributes: {
            action: 'update-email',
            'new-email': '   EMAIL@example.net   ',
            password: 'myPassword',
          },
        },
      };

      // when
      const json = await emailVerificationSerializer.deserialize(payload);

      // then
      const expectedJsonApi = {
        action: 'update-email',
        password: 'myPassword',
        newEmail: 'email@example.net',
      };
      expect(json).to.deep.equal(expectedJsonApi);
    });
  });
});

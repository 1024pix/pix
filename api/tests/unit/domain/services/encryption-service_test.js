const { catchErr, expect } = require('../../../test-helper');

const bcrypt = require('bcrypt');
const encryptionService = require('../../../../lib/domain/services/encryption-service');
const UserNotFoundError = require('../../../../lib/domain/errors').UserNotFoundError;

describe('Unit | Service | Encryption', function () {
  describe('#checkPassword', function () {
    describe('when password and hash are matching', function () {
      it('should resolve to undefined', async function () {
        // given
        const password = 'my-real-password';
        // eslint-disable-next-line no-sync
        const passwordHash = bcrypt.hashSync(password, 1);

        // when
        const result = await encryptionService.checkPassword({
          password,
          passwordHash,
        });

        // then
        expect(result).to.be.undefined;
      });
    });

    describe('when password and hash are not matching', function () {
      it('should reject a UserNotFoundError error ', async function () {
        // given
        const password = 'my-expected-password';
        const passwordHash = 'ABCDEF1234';

        // when
        const error = await catchErr(encryptionService.checkPassword)({
          password,
          passwordHash,
        });

        // then
        expect(error).to.be.an.instanceof(UserNotFoundError);
      });
    });

    describe('when password is not supplied', function () {
      it('should reject, but not a UserNotFoundError error ', async function () {
        // given
        const password = undefined;
        // eslint-disable-next-line no-sync
        const passwordHash = bcrypt.hashSync('my-real-password', 1);

        try {
          await encryptionService.checkPassword({
            password,
            passwordHash,
          });
        } catch (error) {
          expect(error).not.to.be.an.instanceof(UserNotFoundError);
        }
      });
    });
  });
});

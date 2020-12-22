const { catchErr, expect } = require('../../../test-helper');

const bcrypt = require('bcrypt');
const encryptionService = require('../../../../lib/domain/services/encryption-service');
const PasswordNotMatching = require('../../../../lib/domain/errors').PasswordNotMatching;

describe('Unit | Service | Encryption', () => {

  describe('#checkPassword', () => {

    describe('when password and hash are matching', async() => {

      it('should resolve to undefined', async () => {

        // given
        const password = 'my-real-password';
        /* eslint-disable no-sync */
        const passwordHash = bcrypt.hashSync(password, 1);

        // when
        const result = await encryptionService.checkPassword({
          rawPassword: password,
          hashedPassword: passwordHash,
        });

        // then
        expect(result).to.be.undefined;

      });
    });

    describe('when password and hash are not matching', async () => {

      it('should reject a PasswordNotMatching error ', async () => {

        // given
        const password = 'my-expected-password';
        const passwordHash = 'ABCDEF1234';

        // when
        const error = await catchErr(encryptionService.checkPassword)({
          rawPassword: password,
          hashedPassword: passwordHash,
        });

        // then
        expect(error).to.be.an.instanceof(PasswordNotMatching);

      });

    });

    describe('when password is not supplied', async () => {

      it('should reject, but not a PasswordNotMatching error ', async () => {

        // given
        const password = undefined;
        /* eslint-disable no-sync */
        const passwordHash = bcrypt.hashSync('my-real-password', 1);

        try {
          await encryptionService.checkPassword({
            rawPassword: password,
            hashedPassword: passwordHash,
          });
        } catch (error) {
          expect(error).not.to.be.an.instanceof(PasswordNotMatching);
        }

      });

    });

  });

});

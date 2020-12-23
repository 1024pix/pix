const { catchErr, expect } = require('../../../test-helper');

const bcrypt = require('bcrypt');
const encryptionService = require('../../../../lib/domain/services/encryption-service');
const PasswordNotMatching = require('../../../../lib/domain/errors').PasswordNotMatching;

describe('Unit | Service | Encryption', () => {

  describe('#checkPassword', () => {

    describe('#when password and hash are matching', async() => {
      it('should resolve', async () => {
        // given
        const password = 'my-real-password';
        /* eslint-disable no-sync */
        const passwordHashed = bcrypt.hashSync(password, 1);

        // when
        const error = await catchErr(encryptionService.checkPassword)({
          password,
          passwordHashed,
        });

        // then
        expect(error).to.be.an.instanceof(PasswordNotMatching);
      });
    });

    describe('#when password and hash are not matching', async () => {
      it('should reject a PasswordNotMatching error ', async () => {
        // given
        const password = 'my-expected-password';
        const passwordHashed = 'ABCDEF1234';

        // when
        const error = await catchErr(encryptionService.checkPassword)({
          password,
          passwordHashed,
        });
        // then
        expect(error).to.be.an.instanceof(PasswordNotMatching);
      });
    });

  });

});

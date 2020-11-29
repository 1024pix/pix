/* eslint-disable no-sync */
const bcrypt = require('bcrypt');

const { catchErr, expect } = require('../../../test-helper');

const PasswordNotMatching = require('../../../../lib/domain/errors').PasswordNotMatching;

const encryptionService = require('../../../../lib/domain/services/encryption-service');

describe('Unit | Service | Encryption', () => {

  describe('#checkPassword', () => {

    it('should reject when passwords are not matching', async () => {
      // given
      const rawPassword = 'my-expected-password';
      const hashedPassword = 'ABCDEF1234';

      // when
      const error = await catchErr(encryptionService.checkPassword)({
        rawPassword,
        hashedPassword,
      });

      // then
      expect(error).to.be.an.instanceof(PasswordNotMatching);
    });

    it('should resolve to undefined when passwords are matching', async () => {
      // given
      const rawPassword = 'Password123';
      const hashedPassword = bcrypt.hashSync(rawPassword, 1);

      // when
      const result = await encryptionService.checkPassword({
        rawPassword,
        hashedPassword,
      });

      // then
      expect(result).to.be.undefined;
    });
  });

});

import bcrypt from 'bcrypt';

import { catchErr, expect } from '../../../../test-helper.js';

import * as encryptionService from '../../../../../src/shared/domain/services/encryption-service.js';
import { PasswordNotMatching } from '../../../../../lib/domain/errors.js';

describe('Unit | Shared | Domain | Services | Encryption', function () {
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
      it('should reject a PasswordNotMatching error ', async function () {
        // given
        const password = 'my-expected-password';
        const passwordHash = 'ABCDEF1234';

        // when
        const error = await catchErr(encryptionService.checkPassword)({
          password,
          passwordHash,
        });

        // then
        expect(error).to.be.an.instanceof(PasswordNotMatching);
      });
    });

    describe('when password is not supplied', function () {
      it('should reject, but not a PasswordNotMatching error ', async function () {
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
          expect(error).not.to.be.an.instanceof(PasswordNotMatching);
        }
      });
    });
  });
});

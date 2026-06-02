import bcrypt from 'bcrypt';
import omit from 'lodash/omit.js';

import { PasswordNotMatching } from '../../../../../src/shared/domain/errors.js';
import { cryptoService } from '../../../../../src/shared/domain/services/crypto-service.js';
import { expect } from '../../../../test-helper.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Shared | Domain | Services | Crypto', function () {
  describe('#checkPassword', function () {
    describe('when password and hash are matching', function () {
      it('should resolve to undefined', async function () {
        // given
        const password = 'my-real-password';
        // eslint-disable-next-line n/no-sync
        const passwordHash = bcrypt.hashSync(password, 1);

        // when
        const result = await cryptoService.checkPassword({
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
        const error = await catchErr(cryptoService.checkPassword)({
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
        // eslint-disable-next-line n/no-sync
        const passwordHash = bcrypt.hashSync('my-real-password', 1);

        try {
          await cryptoService.checkPassword({
            password,
            passwordHash,
          });
        } catch (error) {
          expect(error).not.to.be.an.instanceof(PasswordNotMatching);
        }
      });
    });
  });

  describe('#encrypt', function () {
    it('resolves to a text output in PHC format', async function () {
      // when
      const output = await cryptoService.encrypt('00a6fa25-df29-4701-9077-557932591766');

      // then
      expect(output).to.match(cryptoService.phcRegexp);
    });
  });

  describe('#decrypt', function () {
    it('resolves to a decrypted text', async function () {
      // when
      const output = await cryptoService.decrypt(
        '$scrypt+aes-256-ctr$N=8192$r=8$p=10$jXTXUj3GLDWDQoV9JaX3Ng==$8HYIDMee4owS5MTnr9z7DjI+ABILdWExBFhd/VYM0I8XKTKN',
      );

      // then
      expect(output).to.equals('00a6fa25-df29-4701-9077-557932591766');
    });
  });

  describe('#generateJSONWebKeyPair', function () {
    it('should generate a new JSON Web Key pair', async function () {
      // when
      const keyPair = await cryptoService.generateJSONWebKeyPair();
      const newKeyPair = await cryptoService.generateJSONWebKeyPair();

      // then
      expect(keyPair.publicKey).to.be.instanceOf(Object);
      expect(keyPair.publicKey).to.have.property('kty', 'RSA');
      expect(keyPair.publicKey).to.have.property('kid');
      expect(keyPair.publicKey.kid).to.be.a('string');
      expect(keyPair.privateKey).to.be.instanceOf(Object);
      expect(keyPair.privateKey).to.have.property('kty', 'RSA');
      expect(keyPair.privateKey).to.have.property('kid');
      expect(keyPair.privateKey.kid).to.be.a('string');
      expect(keyPair.privateKey.kid).to.equal(keyPair.publicKey.kid);

      expect(omit(newKeyPair.publicKey, 'kid')).to.not.deep.equal(omit(keyPair.publicKey, 'kid'));
      expect(omit(newKeyPair.privateKey, 'kid')).to.not.deep.equal(omit(keyPair.privateKey, 'kid'));
    });
  });
});

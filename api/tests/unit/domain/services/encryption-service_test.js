const { describe, it, sinon, expect } = require('../../../test-helper');

const bcrypt = require('bcrypt');
const encryptionService = require('../../../../lib/domain/services/encryption-service');

const PasswordNotMatching = require('../../../../lib/domain/errors').PasswordNotMatching;

describe('Unit | Service | Encryption', () => {

  describe('#check', () => {

    it('should reject when passwords are not matching', () => {
      // Given
      const encryptedPassword = bcrypt.hashSync('my-real-password', 1);
      const password = 'my-expected-password';

      // When
      const promise = encryptionService.check(password, encryptedPassword);

      // Then
      return promise
        .then(() => {
          sinon.assert.fail('Should not succeed');
        })
        .catch((err) => {
          expect(err).to.be.an.instanceof(PasswordNotMatching);
        });
    });

    it('should resolve when passwords are matching', () => {
      // Given
      const encryptedPassword = bcrypt.hashSync('my-real-password', 1);
      const password = 'my-real-password';

      // When
      const promise = encryptionService.check(password, encryptedPassword);

      // Then
      return promise.catch(_ => {
        sinon.assert.fail('Should not fail');
      });
    });

  });

});

import sinon from 'sinon';

import { PasswordExpirationToken } from '../../../../../src/identity-access-management/domain/models/PasswordExpirationToken.js';
import { config } from '../../../../../src/shared/config.js';

describe('Unit | Identity Access Management | Domain | Model | PasswordExpirationToken', function () {
  beforeEach(function () {
    sinon.stub(config.authentication, 'secret').value('secret!');
    sinon.stub(config.authentication, 'passwordResetTokenLifespan').value(1000);
  });

  describe('PasswordExpirationToken.decode', function () {
    it('decodes a valid token', function () {
      // given
      const token = PasswordExpirationToken.generate({ userId: 'userId!' });

      // when
      const decoded = PasswordExpirationToken.decode(token);

      // then
      expect(decoded).to.be.instanceOf(PasswordExpirationToken);
      expect(decoded).to.deep.include({ userId: 'userId!' });
    });

    it('returns empty object for invalid token', function () {
      // given / when
      const decoded = PasswordExpirationToken.decode('invalid.token');

      // then
      expect(decoded).to.be.instanceOf(PasswordExpirationToken);
      expect(decoded.clientId).to.be.undefined;
      expect(decoded.source).to.be.undefined;
      expect(decoded.scope).to.be.undefined;
    });
  });

  describe('PasswordExpirationToken.generate', function () {
    it('builds a password expiration token', function () {
      // given / when
      const token = PasswordExpirationToken.generate({ userId: 'userId!' });

      // then
      expect(token).to.be.a('string');

      const decoded = PasswordExpirationToken.decode(token);
      expect(decoded).to.deep.include({ userId: 'userId!' });
    });
  });
});

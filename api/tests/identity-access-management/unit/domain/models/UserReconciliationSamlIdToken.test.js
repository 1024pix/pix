import sinon from 'sinon';

import { UserReconciliationSamlIdToken } from '../../../../../src/identity-access-management/domain/models/UserReconciliationSamlIdToken.js';
import { config } from '../../../../../src/shared/config.js';
import { InvalidExternalUserTokenError } from '../../../../../src/shared/domain/errors.js';

describe('Unit | Identity Access Management | Domain | Model | UserReconciliationSamlIdToken', function () {
  beforeEach(function () {
    sinon.stub(config.authentication, 'secret').value('secret!');
    sinon.stub(config.authentication, 'tokenForStudentReconciliationLifespan').value(1000);
  });

  describe('UserReconciliationSamlIdToken.decode', function () {
    it('decodes a valid token', function () {
      // given
      const token = UserReconciliationSamlIdToken.generate({
        firstName: 'John',
        lastName: 'Doe',
        samlId: 'saml-id-123',
      });

      // when
      const decoded = UserReconciliationSamlIdToken.decode(token);

      // then
      expect(decoded).to.be.instanceOf(UserReconciliationSamlIdToken);
      expect(decoded).to.deep.include({
        firstName: 'John',
        lastName: 'Doe',
        samlId: 'saml-id-123',
      });
    });

    it('throws InvalidExternalUserTokenError for invalid token', function () {
      // given / when / then
      expect(() => UserReconciliationSamlIdToken.decode('invalid.token')).to.throw(InvalidExternalUserTokenError);
    });
  });

  describe('UserReconciliationSamlIdToken.generate', function () {
    it('builds a user reconciliation token', function () {
      // given / when
      const token = UserReconciliationSamlIdToken.generate({
        firstName: 'Jane',
        lastName: 'Smith',
        samlId: 'saml-id-456',
      });

      // then
      expect(token).to.be.a('string');

      const decoded = UserReconciliationSamlIdToken.decode(token);
      expect(decoded).to.deep.include({
        firstName: 'Jane',
        lastName: 'Smith',
        samlId: 'saml-id-456',
      });
    });
  });
});

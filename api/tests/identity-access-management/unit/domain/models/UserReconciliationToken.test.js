import { UserReconciliationToken } from '../../../../../src/identity-access-management/domain/models/UserReconciliationToken.js';
import { config } from '../../../../../src/shared/config.js';
import { InvalidExternalUserTokenError } from '../../../../../src/shared/domain/errors.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | Model | UserReconciliationToken', function () {
  beforeEach(function () {
    sinon.stub(config.authentication, 'secret').value('secret!');
    sinon.stub(config.authentication, 'tokenForStudentReconciliationLifespan').value(1000);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('UserReconciliationToken.decode', function () {
    it('decodes a valid token', function () {
      // given
      const token = UserReconciliationToken.generate({
        firstName: 'John',
        lastName: 'Doe',
        samlId: 'saml-id-123',
      });

      // when
      const decoded = UserReconciliationToken.decode(token);

      // then
      expect(decoded).to.be.instanceOf(UserReconciliationToken);
      expect(decoded).to.deep.include({
        firstName: 'John',
        lastName: 'Doe',
        samlId: 'saml-id-123',
      });
    });

    it('throws InvalidExternalUserTokenError for invalid token', function () {
      // given / when / then
      expect(() => UserReconciliationToken.decode('invalid.token')).to.throw(InvalidExternalUserTokenError);
    });
  });

  describe('UserReconciliationToken.generate', function () {
    it('builds a user reconciliation token', function () {
      // given / when
      const token = UserReconciliationToken.generate({
        firstName: 'Jane',
        lastName: 'Smith',
        samlId: 'saml-id-456',
      });

      // then
      expect(token).to.be.a('string');

      const decoded = UserReconciliationToken.decode(token);
      expect(decoded).to.deep.include({
        firstName: 'Jane',
        lastName: 'Smith',
        samlId: 'saml-id-456',
      });
    });
  });
});

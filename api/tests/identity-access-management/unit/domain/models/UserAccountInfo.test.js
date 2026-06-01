import { UserAccountInfo } from '../../../../../src/identity-access-management/domain/models/UserAccountInfo.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Domain | Models | UserAccountInfo', function () {
  const restrictedOidcProvidersForEmailCreation = ['RESTRICTED_OIDC_PROVIDER_1'];

  describe('constructor', function () {
    it('creates a user account info with required properties and sets default values for optional properties', function () {
      // given
      const userAccountInfoData = {
        id: 123,
        email: 'user@example.net',
        username: 'user123',
        canSelfDeleteAccount: true,
        restrictedOidcProvidersForEmailCreation,
      };

      // when
      const userAccountInfo = new UserAccountInfo(userAccountInfoData);

      // then
      expect(userAccountInfo.id).to.equal(123);
      expect(userAccountInfo.email).to.equal('user@example.net');
      expect(userAccountInfo.username).to.equal('user123');
      expect(userAccountInfo.canSelfDeleteAccount).to.be.true;
      expect(userAccountInfo.canAddEmailConnectionMethod).to.be.false;
    });
  });

  describe('#canAddEmailConnectionMethod', function () {
    context('when user already has an email', function () {
      it('canAddEmailConnectionMethod returns false', function () {
        // given
        const userAccountInfo = new UserAccountInfo({
          id: 123,
          email: 'user@example.net',
          username: 'user123',
          canSelfDeleteAccount: true,
          restrictedOidcProvidersForEmailCreation,
          oidcAuthenticationMethods: [{ identityProvider: 'AUTHORIZED_OIDC_PARTNER' }],
        });

        // when / then
        expect(userAccountInfo.canAddEmailConnectionMethod).to.be.false;
      });
    });

    context('when user has no email', function () {
      context('when oidcAuthenticationMethods is empty', function () {
        it('canAddEmailConnectionMethod returns false', function () {
          // given
          const userAccountInfo = new UserAccountInfo({
            id: 123,
            email: null,
            username: 'user123',
            canSelfDeleteAccount: true,
            restrictedOidcProvidersForEmailCreation,
            oidcAuthenticationMethods: [],
          });

          // when / then
          expect(userAccountInfo.canAddEmailConnectionMethod).to.be.false;
        });
      });

      context('when user has one oidcAuthenticationMethod from a restricted provider', function () {
        it('canAddEmailConnectionMethod returns false', function () {
          // given
          const userAccountInfo = new UserAccountInfo({
            id: 123,
            email: null,
            username: 'user123',
            canSelfDeleteAccount: true,
            restrictedOidcProvidersForEmailCreation,
            oidcAuthenticationMethods: [{ identityProvider: 'RESTRICTED_OIDC_PROVIDER_1' }],
          });

          // when / then
          expect(userAccountInfo.canAddEmailConnectionMethod).to.be.false;
        });
      });

      context('when at least one oidcAuthenticationMethod is not a restricted SSO provider', function () {
        it('canAddEmailConnectionMethod returns true', function () {
          // given
          const userAccountInfo = new UserAccountInfo({
            id: 123,
            email: null,
            username: 'user123',
            canSelfDeleteAccount: true,
            restrictedOidcProvidersForEmailCreation,
            oidcAuthenticationMethods: [
              { identityProvider: 'OIDC_PARTNER' },
              { identityProvider: 'RESTRICTED_OIDC_PARTNER_1' },
            ],
          });

          // when / then
          expect(userAccountInfo.canAddEmailConnectionMethod).to.be.true;
        });
      });
    });
  });
});

import { addOidcProviderValidator } from '../../../../../src/authentication/domain/validators/add-oidc-provider.validator.js';
import { EntityValidationError } from '../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../test-helper.js';

describe('Unit | Authentication | Domain | Validator | AddOidcProvider', function () {
  context('when data is valid', function () {
    it('returns true', function () {
      // given
      const data = {
        identityProvider: 'GOOGLE',
        organizationName: 'Google',
        scope: 'openid profile email',
        slug: 'google',
        source: 'google',
        clientId: '__CLIENT_ID__',
        clientSecret: '__CLIENT_SECRET__',
        accessTokenLifespan: '7d',
        claimsToStore: 'email',
        enabled: false,
        enabledForPixAdmin: true,
        openidConfigurationUrl: 'https://accounts.google.com/.well-known/openid-configuration',
        redirectUri: 'https://admin.dev.pix.fr/connexion/google',
      };

      // when
      const result = addOidcProviderValidator.validate(data);

      // then
      expect(result).to.be.true;
    });
  });

  context('when missing required properties', function () {
    it('throws an EntityValidation error', function () {
      // given
      const data = {};

      // when
      const error = catchErrSync(addOidcProviderValidator.validate)(data);

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
    });
  });
});

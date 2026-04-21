import { addOidcProviderValidator } from '../../../../../src/identity-access-management/domain/validators/add-oidc-provider.validator.js';
import { EntityValidationError } from '../../../../../src/shared/domain/errors.js';

import { catchErrSync } from '../../../../tooling/test-utils/error.js';

describe('Unit | Identity Access Management | Domain | Validator | AddOidcProvider', function () {
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
        claimMapping: {
          firstName: ['given_name'],
          lastName: ['usual_name'],
          externalIdentityId: ['sub'],
        },
        claimsToStore: 'email',
        enabled: false,
        enabledForPixAdmin: true,
        openidConfigurationUrl: 'https://accounts.google.com/.well-known/openid-configuration',
        redirectUri: 'https://admin.dev.pix.fr/connexion/google',
        application: 'admin',
        applicationTld: '.fr',
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

  describe('getImportTemplate', function () {
    it('returns a JSON formatted string, containing an array with a single oidc-provider configuration', function () {
      // when
      const result = addOidcProviderValidator.getImportTemplate();

      // then
      expect(result).to.be.a.string;
      expect(() => {
        const data = JSON.parse(result);
        expect(data).to.be.an('array');
        expect(data).to.have.lengthOf(1);
        expect(data[0]).to.be.an('object');
      }).not.to.throw();
    });
  });
});

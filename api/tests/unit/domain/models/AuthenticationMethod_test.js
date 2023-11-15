import { expect } from '../../../test-helper.js';
import { ObjectValidationError } from '../../../../lib/domain/errors.js';
import { AuthenticationMethod } from '../../../../lib/domain/models/AuthenticationMethod.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../lib/domain/constants/identity-providers.js';
import * as OidcIdentityProviders from '../../../../lib/domain/constants/oidc-identity-providers.js';

describe('Unit | Domain | Models | AuthenticationMethod', function () {
  describe('buildPixAuthenticationMethod', function () {
    it('should build PixAuthenticationMethod', function () {
      // given
      const id = 1;
      const userId = 1;
      const password = 'foo';
      const shouldChangePassword = true;
      const createdAt = Date.now();
      const updatedAt = Date.now();

      // when
      const result = AuthenticationMethod.buildPixAuthenticationMethod({
        id,
        password,
        shouldChangePassword,
        createdAt,
        updatedAt,
        userId,
      });

      // then
      const authenticationComplement = new AuthenticationMethod.PixAuthenticationComplement({
        password,
        shouldChangePassword,
      });

      const expectedResult = {
        id,
        identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
        authenticationComplement,
        externalIdentifier: undefined,
        userId,
        createdAt,
        updatedAt,
      };
      expect(result).to.deep.equal(expectedResult);
    });
  });

  describe('constructor', function () {
    it('should successfully instantiate object when identityProvider is GAR and externalIdentifier is defined', function () {
      // when
      expect(
        () =>
          new AuthenticationMethod({
            identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
            externalIdentifier: 'externalIdentifier',
            userId: 1,
          }),
      ).not.to.throw(ObjectValidationError);
    });

    it('should successfully instantiate object when identityProvider is POLE_EMPLOI and externalIdentifier and authenticationComplements are defined', function () {
      // given
      const authenticationComplement = new AuthenticationMethod.PoleEmploiOidcAuthenticationComplement({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
        expiredDate: Date.now(),
      });
      // when
      expect(
        () =>
          new AuthenticationMethod({
            identityProvider: OidcIdentityProviders.POLE_EMPLOI.code,
            externalIdentifier: 'externalIdentifier',
            authenticationComplement,
            userId: 1,
          }),
      ).not.to.throw(ObjectValidationError);
    });

    it('should successfully instantiate object when identityProvider is CNAV and externalIdentifier is defined', function () {
      // given & when & then
      expect(
        () =>
          new AuthenticationMethod({
            identityProvider: OidcIdentityProviders.CNAV.code,
            externalIdentifier: 'externalIdentifier',
            userId: 1,
          }),
      ).not.to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when identityProvider is not valid', function () {
      // when
      expect(
        () =>
          new AuthenticationMethod({
            identityProvider: 'not_valid',
            externalIdentifier: 'externalIdentifier',
            userId: 1,
          }),
      ).to.throw(ObjectValidationError);
      expect(
        () =>
          new AuthenticationMethod({
            identityProvider: undefined,
            externalIdentifier: 'externalIdentifier',
            userId: 1,
          }),
      ).to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when externalIdentifier is not defined for identityProvider GAR, POLE_EMPLOI or CNAV', function () {
      // when
      expect(
        () =>
          new AuthenticationMethod({
            identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
            externalIdentifier: undefined,
            userId: 1,
          }),
      ).to.throw(ObjectValidationError);
      expect(
        () =>
          new AuthenticationMethod({
            identityProvider: OidcIdentityProviders.POLE_EMPLOI.code,
            externalIdentifier: undefined,
            userId: 1,
          }),
      ).to.throw(ObjectValidationError);
      expect(
        () =>
          new AuthenticationMethod({
            identityProvider: OidcIdentityProviders.CNAV.code,
            externalIdentifier: undefined,
            userId: 1,
          }),
      ).to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when authenticationComplement is not defined for identityProvider PIX', function () {
      // when
      expect(
        () =>
          new AuthenticationMethod({
            identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
            authenticationComplement: undefined,
            userId: 1,
          }),
      ).to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when userId is not valid', function () {
      // when
      expect(
        () =>
          new AuthenticationMethod({
            identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
            externalIdentifier: 'externalIdentifier',
            userId: 'not_valid',
          }),
      ).to.throw(ObjectValidationError);
      expect(
        () =>
          new AuthenticationMethod({
            identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
            externalIdentifier: 'externalIdentifier',
            userId: undefined,
          }),
      ).to.throw(ObjectValidationError);
    });

    context('PixAuthenticationComplement', function () {
      let validArguments;
      beforeEach(function () {
        validArguments = {
          password: 'Password123',
          shouldChangePassword: false,
        };
      });

      it('should successfully instantiate object when passing all valid arguments', function () {
        // when
        expect(() => new AuthenticationMethod.PixAuthenticationComplement(validArguments)).not.to.throw(
          ObjectValidationError,
        );
      });

      it('should throw an ObjectValidationError when password is not valid', function () {
        // when
        expect(
          () => new AuthenticationMethod.PixAuthenticationComplement({ ...validArguments, password: 1234 }),
        ).to.throw(ObjectValidationError);
        expect(
          () => new AuthenticationMethod.PixAuthenticationComplement({ ...validArguments, password: undefined }),
        ).to.throw(ObjectValidationError);
      });

      it('should throw an ObjectValidationError when shouldChangePassword is not valid', function () {
        // when
        expect(
          () =>
            new AuthenticationMethod.PixAuthenticationComplement({
              ...validArguments,
              shouldChangePassword: 'not_valid',
            }),
        ).to.throw(ObjectValidationError);
        expect(
          () =>
            new AuthenticationMethod.PixAuthenticationComplement({
              ...validArguments,
              shouldChangePassword: undefined,
            }),
        ).to.throw(ObjectValidationError);
      });
    });

    context('OidcAuthenticationComplement', function () {
      it('cannot be created without properties', function () {
        // when
        expect(() => new AuthenticationMethod.OidcAuthenticationComplement()).to.throw(ObjectValidationError);
        expect(() => new AuthenticationMethod.OidcAuthenticationComplement({})).to.throw(ObjectValidationError);
      });

      it('can hold any properties', function () {
        // given
        const properties = { family_name: 'AAAAA', given_name: 'BBBBBB' };

        // when
        const authenticationComplement = new AuthenticationMethod.OidcAuthenticationComplement(properties);

        // then
        expect(authenticationComplement).to.be.instanceOf(Object);
      });
    });

    context('PoleEmploiOidcAuthenticationComplement', function () {
      let validArguments;
      beforeEach(function () {
        validArguments = {
          accessToken: 'accessToken',
          refreshToken: 'refreshToken',
          expiredDate: Date.now(),
        };
      });

      it('should successfully instantiate object when passing all valid arguments', function () {
        // when
        expect(() => new AuthenticationMethod.PoleEmploiOidcAuthenticationComplement(validArguments)).not.to.throw(
          ObjectValidationError,
        );
      });

      it('should throw an ObjectValidationError when accessToken is not valid', function () {
        // when
        expect(
          () =>
            new AuthenticationMethod.PoleEmploiOidcAuthenticationComplement({ ...validArguments, accessToken: 1234 }),
        ).to.throw(ObjectValidationError);
        expect(
          () =>
            new AuthenticationMethod.PoleEmploiOidcAuthenticationComplement({
              ...validArguments,
              accessToken: undefined,
            }),
        ).to.throw(ObjectValidationError);
      });

      it('should throw an ObjectValidationError when refreshToken is not valid', function () {
        // when
        expect(
          () =>
            new AuthenticationMethod.PoleEmploiOidcAuthenticationComplement({ ...validArguments, refreshToken: 1234 }),
        ).to.throw(ObjectValidationError);
      });

      it('should throw an ObjectValidationError when expiredDate is not valid', function () {
        // when
        expect(
          () =>
            new AuthenticationMethod.PoleEmploiOidcAuthenticationComplement({
              ...validArguments,
              expiredDate: 'not_valid',
            }),
        ).to.throw(ObjectValidationError);
        expect(
          () =>
            new AuthenticationMethod.PoleEmploiOidcAuthenticationComplement({
              ...validArguments,
              expiredDate: undefined,
            }),
        ).to.throw(ObjectValidationError);
      });
    });

    context('GARAuthenticationComplement', function () {
      it('should successfully instantiate object when passing all valid arguments', function () {
        expect(
          () =>
            new AuthenticationMethod.GARAuthenticationComplement({
              firstName: 'Margaret',
              lastName: 'Remington',
            }),
        ).not.to.throw(ObjectValidationError);
      });

      it('should throw an ObjectValidationError when firstName is not a string', function () {
        expect(
          () =>
            new AuthenticationMethod.GARAuthenticationComplement({
              lastName: 'Remington',
              firstName: 1234,
            }),
        ).to.throw(ObjectValidationError);
      });

      it('should throw an ObjectValidationError when firstName is missing', function () {
        expect(
          () =>
            new AuthenticationMethod.GARAuthenticationComplement({
              lastName: 'Remington',
            }),
        ).to.throw(ObjectValidationError);
      });

      it('should throw an ObjectValidationError when lastName is not a string', function () {
        expect(
          () =>
            new AuthenticationMethod.GARAuthenticationComplement({
              firstName: 'Margaret',
              lastName: 4567,
            }),
        ).to.throw(ObjectValidationError);
      });

      it('should throw an ObjectValidationError when lastName is missing', function () {
        expect(
          () =>
            new AuthenticationMethod.GARAuthenticationComplement({
              firstName: 'Margaret',
            }),
        ).to.throw(ObjectValidationError);
      });
    });
  });
});

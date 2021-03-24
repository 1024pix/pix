const { expect } = require('../../../test-helper');
const { ObjectValidationError } = require('../../../../lib/domain/errors');

const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');

describe('Unit | Domain | Models | AuthenticationMethod', function() {

  describe('constructor', function() {

    it('should successfully instantiate object when identityProvider is GAR and externalIdentifier is defined', function() {
      // when
      expect(() => new AuthenticationMethod({ identityProvider: AuthenticationMethod.identityProviders.GAR, externalIdentifier: 'externalIdentifier', userId: 1 }))
        .not.to.throw(ObjectValidationError);
    });

    it('should successfully instantiate object when identityProvider is POLE_EMPLOI and externalIdentifier and authenticationComplements are defined', function() {
      // given
      const authenticationComplement = new AuthenticationMethod.PoleEmploiAuthenticationComplement({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
        expiredDate: Date.now(),
      });
      // when
      expect(() => new AuthenticationMethod({ identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI, externalIdentifier: 'externalIdentifier', authenticationComplement, userId: 1 }))
        .not.to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when identityProvider is not valid', function() {
      // when
      expect(() => new AuthenticationMethod({ identityProvider: 'not_valid', externalIdentifier: 'externalIdentifier', userId: 1 }))
        .to.throw(ObjectValidationError);
      expect(() => new AuthenticationMethod({ identityProvider: undefined, externalIdentifier: 'externalIdentifier', userId: 1 }))
        .to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when externalIdentifier is not defined for identityProvider GAR or POLE_EMPLOI', function() {
      // when
      expect(() => new AuthenticationMethod({ identityProvider: AuthenticationMethod.identityProviders.GAR, externalIdentifier: undefined, userId: 1 }))
        .to.throw(ObjectValidationError);
      expect(() => new AuthenticationMethod({ identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI, externalIdentifier: undefined, userId: 1 }))
        .to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when authenticationComplement is not defined for identityProvider PIX', function() {
      // when
      expect(() => new AuthenticationMethod({ identityProvider: AuthenticationMethod.identityProviders.PIX, authenticationComplement: undefined, userId: 1 }))
        .to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when userId is not valid', function() {
      // when
      expect(() => new AuthenticationMethod({ identityProvider: AuthenticationMethod.identityProviders.GAR, externalIdentifier: 'externalIdentifier', userId: 'not_valid' }))
        .to.throw(ObjectValidationError);
      expect(() => new AuthenticationMethod({ identityProvider: AuthenticationMethod.identityProviders.GAR, externalIdentifier: 'externalIdentifier', userId: undefined }))
        .to.throw(ObjectValidationError);
    });

    context('PixAuthenticationComplement', function() {

      let validArguments;
      beforeEach(function() {
        validArguments = {
          password: 'Password123',
          shouldChangePassword: false,
        };
      });

      it('should successfully instantiate object when passing all valid arguments', function() {
        // when
        expect(() => new AuthenticationMethod.PixAuthenticationComplement(validArguments)).not.to.throw(ObjectValidationError);
      });

      it('should throw an ObjectValidationError when password is not valid', function() {
        // when
        expect(() => new AuthenticationMethod.PixAuthenticationComplement({ ...validArguments, password: 1234 }))
          .to.throw(ObjectValidationError);
        expect(() => new AuthenticationMethod.PixAuthenticationComplement({ ...validArguments, password: undefined }))
          .to.throw(ObjectValidationError);
      });

      it('should throw an ObjectValidationError when shouldChangePassword is not valid', function() {
        // when
        expect(() => new AuthenticationMethod.PixAuthenticationComplement({ ...validArguments, shouldChangePassword: 'not_valid' }))
          .to.throw(ObjectValidationError);
        expect(() => new AuthenticationMethod.PixAuthenticationComplement({ ...validArguments, shouldChangePassword: undefined }))
          .to.throw(ObjectValidationError);
      });
    });

    context('PoleEmploiAuthenticationComplement', function() {

      let validArguments;
      beforeEach(function() {
        validArguments = {
          accessToken: 'accessToken',
          refreshToken: 'refreshToken',
          expiredDate: Date.now(),
        };
      });

      it('should successfully instantiate object when passing all valid arguments', function() {
        // when
        expect(() => new AuthenticationMethod.PoleEmploiAuthenticationComplement(validArguments)).not.to.throw(ObjectValidationError);
      });

      it('should throw an ObjectValidationError when accessToken is not valid', function() {
        // when
        expect(() => new AuthenticationMethod.PoleEmploiAuthenticationComplement({ ...validArguments, accessToken: 1234 }))
          .to.throw(ObjectValidationError);
        expect(() => new AuthenticationMethod.PoleEmploiAuthenticationComplement({ ...validArguments, accessToken: undefined }))
          .to.throw(ObjectValidationError);
      });

      it('should throw an ObjectValidationError when refreshToken is not valid', function() {
        // when
        expect(() => new AuthenticationMethod.PoleEmploiAuthenticationComplement({ ...validArguments, refreshToken: 1234 }))
          .to.throw(ObjectValidationError);
      });

      it('should throw an ObjectValidationError when expiredDate is not valid', function() {
        // when
        expect(() => new AuthenticationMethod.PoleEmploiAuthenticationComplement({ ...validArguments, expiredDate: 'not_valid' }))
          .to.throw(ObjectValidationError);
        expect(() => new AuthenticationMethod.PoleEmploiAuthenticationComplement({ ...validArguments, expiredDate: undefined }))
          .to.throw(ObjectValidationError);
      });
    });
  });
});

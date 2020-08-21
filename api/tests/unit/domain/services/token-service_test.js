const { expect } = require('../../../test-helper');
const tokenService = require('../../../../lib/domain/services/token-service');
const User = require('../../../../lib/domain/models/User');
const { InvalidTemporaryKeyError } = require('../../../../lib/domain/errors');
const settings = require('../../../../lib/config');
const jsonwebtoken = require('jsonwebtoken');
const _ = require('lodash');

describe('Unit | Domain | Service | Token Service', function() {

  describe('#createTokenForStudentReconciliation', () => {

    it('should create token with firstName, lastName, samlId', () => {
      // given
      const userAttributes = {
        IDO: 'IDO-for-adele',
        NOM: 'Lopez',
        PRE: 'Adèle',
      };
      const expectedTokenAttributes = {
        'first_name': 'Adèle',
        'last_name': 'Lopez',
        'saml_id': 'IDO-for-adele'
      };

      // when
      const token = tokenService.createTokenForStudentReconciliation({ userAttributes });

      // then
      const decodedToken = jsonwebtoken.verify(token, settings.authentication.secret);
      expect(_.omit(decodedToken, ['iat', 'exp'])).to.deep.equal(expectedTokenAttributes);
    });
  });

  describe('#extractUserId', () => {

    it('should exist', () => {
      expect(tokenService.extractUserId).to.exist.and.to.be.a('function');
    });

    it('should return userId if the token passed is valid', () => {
      // given
      const user = new User({ id: 123 });
      const token = tokenService.createTokenFromUser(user, 'pix');

      // when
      const result = tokenService.extractUserId(token);

      // then
      expect(result).to.equal(123);
    });

    it('should reject with Error if the token is invalid', () => {
      // given
      const token = 'eyJhbGciOiJIUzI1NiIsIgR5cCI6IkpXVCJ9.eyJ1c2VyX2lPIjoxMjMsImlhdCI6MTQ5OTA3Nzg2Mn0.FRAAoowTA8Bc6BOzD7wWh2viVN47VrPcGgLuHi_NmKw';

      // when
      const result = tokenService.extractUserId(token);

      // then
      expect(result).to.equal(null);
    });

  });

  describe('#extractUserIdForCampaignResults', () => {

    it('should return userId if the token passed is valid', () => {
      // given
      const userId = 123;
      const token = tokenService.createTokenForCampaignResults(userId);

      // when
      const result = tokenService.extractUserIdForCampaignResults(token);

      // then
      expect(result).to.equal(userId);
    });

    it('should reject with Error if the token is invalid', () => {
      // given
      const token = 'eyJhbGciOiJIUzI1NiIsIgR5cCI6IkpXVCJ9.eyJ1c2VyX2lPIjoxMjMsImlhdCI6MTQ5OTA3Nzg2Mn0.FRAAoowTA8Bc6BOzD7wWh2viVN47VrPcGgLuHi_NmKw';

      // when
      const result = tokenService.extractUserIdForCampaignResults(token);

      // then
      expect(result).to.equal(null);
    });

  });

  describe('#verifyValidity', () => {

    it('should throw an Invalid token error, when token is not valid', () => {
      // given
      const token = 'eyJhbGciOiJIUzI1NiIsIgR5cCI6IkpXVCJ9.eyJ1c2VyX2lPIjoxMjMsImlhdCI6MTQ5OTA3Nzg2Mn0.FRAAoowTA8Bc6BOzD7wWh2viVN47VrPcGgLuHi_NmKw';

      // when
      const promise = tokenService.verifyValidity(token);

      // then
      return promise.catch((result) => {
        expect(result).to.be.an.instanceof(InvalidTemporaryKeyError);
      });
    });

  });
});

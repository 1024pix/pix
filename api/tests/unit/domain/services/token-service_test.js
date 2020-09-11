const omit = require('lodash/omit');
const jsonwebtoken = require('jsonwebtoken');

const { catchErr, expect } = require('../../../test-helper');

const User = require('../../../../lib/domain/models/User');
const { InvalidTemporaryKeyError } = require('../../../../lib/domain/errors');
const settings = require('../../../../lib/config');

const tokenService = require('../../../../lib/domain/services/token-service');

describe('Unit | Domain | Service | Token Service', () => {

  describe('#createIdTokenForUserReconciliation', () => {

    it('should return a valid idToken with firstName, lastName, samlId', () => {
      // given
      const externalUser = {
        firstName: 'Adèle',
        lastName: 'Lopez',
        samlId: 'IDO-for-adele',
      };
      const expectedTokenAttributes = {
        'first_name': 'Adèle',
        'last_name': 'Lopez',
        'saml_id': 'IDO-for-adele',
      };

      // when
      const idToken = tokenService.createIdTokenForUserReconciliation(externalUser);

      // then
      const decodedToken = jsonwebtoken.verify(idToken, settings.authentication.secret);
      expect(omit(decodedToken, ['iat', 'exp'])).to.deep.equal(expectedTokenAttributes);
    });
  });

  describe('#extractExternalUserFromIdToken', () => {

    it('should return external user if the idToken is valid', async () => {
      // given
      const externalUser = {
        firstName: 'Saml',
        lastName: 'Jackson',
        samlId: 'SamlId',
      };

      const idToken = tokenService.createIdTokenForUserReconciliation(externalUser);

      // when
      const result = await tokenService.extractExternalUserFromIdToken(idToken);

      // then
      expect(result).to.deep.equal(externalUser);
    });

    it('should throw an InvalidTemporaryKeyError if the accessToken is invalid', async () => {
      // given
      const accessToken = 'WRONG_DATA';

      // when
      const error = await catchErr(tokenService.extractExternalUserFromIdToken)(accessToken);
      expect(error).to.be.an.instanceof(InvalidTemporaryKeyError);
    });

  });

  describe('#extractUserId', () => {

    it('should return userId if the accessToken is valid', () => {
      // given
      const user = new User({ id: 123 });
      const accessToken = tokenService.createAccessTokenFromUser(user, 'pix');

      // when
      const result = tokenService.extractUserId(accessToken);

      // then
      expect(result).to.equal(123);
    });

    it('should return null if the accessToken is invalid', () => {
      // given
      const accessToken = 'WRONG_DATA';

      // when
      const result = tokenService.extractUserId(accessToken);

      // then
      expect(result).to.equal(null);
    });
  });

  describe('#extractUserIdForCampaignResults', () => {

    it('should return userId if the accessToken is valid', () => {
      // given
      const userId = 123;
      const accessToken = tokenService.createTokenForCampaignResults(userId);

      // when
      const result = tokenService.extractUserIdForCampaignResults(accessToken);

      // then
      expect(result).to.equal(userId);
    });

    it('should return null if the accessToken is invalid', () => {
      // given
      const accessToken = 'WRONG_DATA';

      // when
      const result = tokenService.extractUserIdForCampaignResults(accessToken);

      // then
      expect(result).to.equal(null);
    });
  });

  describe('#decodeIfValid', () => {

    it('should throw an Invalid token error, when token is not valid', async () => {
      // given
      const token = 'eyJhbGciOiJIUzI1NiIsIgR5cCI6IkpXVCJ9.eyJ1c2VyX2lPIjoxMjMsImlhdCI6MTQ5OTA3Nzg2Mn0.FRAAoowTA8Bc6BOzD7wWh2viVN47VrPcGgLuHi_NmKw';

      // when
      const error = await catchErr(tokenService.decodeIfValid)(token);

      // then
      expect(error).to.be.an.instanceof(InvalidTemporaryKeyError);
    });
  });

  describe('#extractSamlId', () => {

    it('should return samlId if the idToken is valid', () => {
      // given
      const expectedSamlId = 'SAMLID';
      const userAttributes = {
        firstName: 'firstName',
        lastName: 'lastName',
        samlId: expectedSamlId,
      };
      const idToken = tokenService.createIdTokenForUserReconciliation(userAttributes);

      // when
      const samlId = tokenService.extractSamlId(idToken);

      // then
      expect(samlId).to.equal(expectedSamlId);
    });

    it('should return null if the idToken is invalid', () => {
      // given
      const invalidIdToken = 'ABCD';

      // when
      const result = tokenService.extractSamlId(invalidIdToken);

      // then
      expect(result).to.equal(null);
    });
  });
});

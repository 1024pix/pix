import lodash from 'lodash';
const { omit } = lodash;
import jsonwebtoken from 'jsonwebtoken';

import { catchErr, expect, sinon } from '../../../../test-helper.js';

import {
  InvalidTemporaryKeyError,
  InvalidExternalUserTokenError,
  InvalidResultRecipientTokenError,
  InvalidSessionResultError,
} from '../../../../../lib/domain/errors.js';

import { tokenService } from '../../../../../src/shared/domain/services/token-service.js';
import { config as settings } from '../../../../../src/shared/config.js';
import { ForbiddenAccess } from '../../../../../src/shared/domain/errors.js';

describe('Unit | Shared | Domain | Services | Token Service', function () {
  describe('#createTokenForCampaignResults', function () {
    it('should create an access token with user id and campaign id', function () {
      // given
      const generatedAccessToken = 'Valid-Access-Token';
      const userId = 123;
      const campaignId = 456;

      settings.authentication.secret = 'a secret';
      settings.authentication.tokenForCampaignResultLifespan = 10;

      sinon.stub(jsonwebtoken, 'sign').returns(generatedAccessToken);

      // when
      const accessTokenForCampaignResults = tokenService.createTokenForCampaignResults({ userId, campaignId });

      // then
      expect(accessTokenForCampaignResults).to.equal(generatedAccessToken);
      expect(jsonwebtoken.sign).to.have.been.calledWithExactly(
        { access_id: userId, campaign_id: campaignId },
        'a secret',
        {
          expiresIn: 10,
        },
      );
    });
  });

  describe('#createAccessTokenFromUser', function () {
    it('should create access token with user id and source', function () {
      // given
      const userId = 123;
      const source = 'pix';
      settings.authentication.secret = 'a secret';
      settings.authentication.accessTokenLifespanMs = 1000;
      const accessToken = 'valid access token';
      const expirationDelaySeconds = 1;
      const firstParameter = { user_id: userId, source };
      const secondParameter = 'a secret';
      const thirdParameter = { expiresIn: 1 };
      sinon.stub(jsonwebtoken, 'sign').withArgs(firstParameter, secondParameter, thirdParameter).returns(accessToken);

      // when
      const result = tokenService.createAccessTokenFromUser(userId, source);

      // then
      expect(result).to.be.deep.equal({ accessToken, expirationDelaySeconds });
    });
  });

  describe('#createIdTokenForUserReconciliation', function () {
    it('should return a valid idToken with firstName, lastName, samlId', function () {
      // given
      const externalUser = {
        firstName: 'Adèle',
        lastName: 'Lopez',
        samlId: 'IDO-for-adele',
      };
      const expectedTokenAttributes = {
        first_name: 'Adèle',
        last_name: 'Lopez',
        saml_id: 'IDO-for-adele',
      };

      // when
      const idToken = tokenService.createIdTokenForUserReconciliation(externalUser);

      // then
      const decodedToken = jsonwebtoken.verify(idToken, settings.authentication.secret);
      expect(omit(decodedToken, ['iat', 'exp'])).to.deep.equal(expectedTokenAttributes);
    });
  });

  describe('#extractExternalUserFromIdToken', function () {
    it('should return external user if the idToken is valid', async function () {
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

    it('should throw an InvalidExternalUserTokenError if the idToken is invalid', async function () {
      // given
      const idToken = 'WRONG_DATA';

      // when
      const error = await catchErr(tokenService.extractExternalUserFromIdToken)(idToken);
      expect(error).to.be.an.instanceof(InvalidExternalUserTokenError);
      expect(error.message).to.be.equal(
        'Une erreur est survenue. Veuillez réessayer de vous connecter depuis le médiacentre.',
      );
    });
  });

  describe('#extractUserId', function () {
    it('should return userId if the accessToken is valid', function () {
      // given
      const userId = 123;
      const accessToken = tokenService.createAccessTokenFromUser(userId, 'pix').accessToken;

      // when
      const result = tokenService.extractUserId(accessToken);

      // then
      expect(result).to.equal(123);
    });

    it('should return null if the accessToken is invalid', function () {
      // given
      const accessToken = 'WRONG_DATA';

      // when
      const result = tokenService.extractUserId(accessToken);

      // then
      expect(result).to.equal(null);
    });
  });

  describe('#extractCampaignResultsTokenContent', function () {
    context('valid token', function () {
      it('should return userId and campaignId if the accessToken is valid', function () {
        // given
        const accessToken = tokenService.createTokenForCampaignResults({ userId: 123, campaignId: 456 });

        // when
        const { userId, campaignId } = tokenService.extractCampaignResultsTokenContent(accessToken);

        // then
        expect(userId).to.equal(123);
        expect(campaignId).to.equal(456);
      });
    });

    context('invalid token', function () {
      it('should return null', async function () {
        // given
        const accessToken = 'WRONG_DATA';

        // when
        const error = await catchErr(tokenService.extractCampaignResultsTokenContent)(accessToken);

        // then
        expect(error).to.be.an.instanceof(ForbiddenAccess);
      });
    });
  });

  describe('#decodeIfValid', function () {
    it('should throw an Invalid token error, when token is not valid', async function () {
      // given
      const token =
        'eyJhbGciOiJIUzI1NiIsIgR5cCI6IkpXVCJ9.eyJ1c2VyX2lPIjoxMjMsImlhdCI6MTQ5OTA3Nzg2Mn0.FRAAoowTA8Bc6BOzD7wWh2viVN47VrPcGgLuHi_NmKw';

      // when
      const error = await catchErr(tokenService.decodeIfValid)(token);

      // then
      expect(error).to.be.an.instanceof(InvalidTemporaryKeyError);
    });
  });

  describe('#extractSamlId', function () {
    it('should return samlId if the idToken is valid', function () {
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

    it('should return null if the idToken is invalid', function () {
      // given
      const invalidIdToken = 'ABCD';

      // when
      const result = tokenService.extractSamlId(invalidIdToken);

      // then
      expect(result).to.equal(null);
    });
  });

  describe('#extractSessionId', function () {
    it('should return the session id if the token is valid', function () {
      // given
      const token = jsonwebtoken.sign(
        {
          session_id: 12345,
        },
        settings.authentication.secret,
        { expiresIn: '30d' },
      );

      // when
      const tokenData = tokenService.extractSessionId(token);

      // then
      expect(tokenData).to.deep.equal({
        sessionId: 12345,
      });
    });

    it('should throw if session id or result recipient email is missing', async function () {
      // given
      const invalidIdToken = jsonwebtoken.sign({}, settings.authentication.secret, { expiresIn: '30d' });

      // when
      const error = await catchErr(tokenService.extractSessionId)(invalidIdToken);

      // then
      expect(error).to.be.an.instanceof(InvalidSessionResultError);
    });

    it('should throw if token is expired', async function () {
      // given
      const invalidIdToken = jsonwebtoken.sign(
        {
          session_id: 1234,
        },
        settings.authentication.secret,
        { expiresIn: '1' },
      );

      // when
      setTimeout(async () => {
        return;
      }, 100);
      const error = await catchErr(tokenService.extractSessionId)(invalidIdToken);

      // then
      expect(error).to.be.an.instanceof(InvalidSessionResultError);
    });
  });

  describe('#extractResultRecipientEmailAndSessionId', function () {
    it('should return the session id and result recipient email if the token is valid', function () {
      // given
      const token = jsonwebtoken.sign(
        {
          result_recipient_email: 'recipientEmail@example.net',
          session_id: 12345,
        },
        settings.authentication.secret,
        { expiresIn: '30d' },
      );

      // when
      const tokenData = tokenService.extractResultRecipientEmailAndSessionId(token);

      // then
      expect(tokenData).to.deep.equal({
        resultRecipientEmail: 'recipientEmail@example.net',
        sessionId: 12345,
      });
    });

    it('should throw if session id or result recipient email is missing', async function () {
      // given
      const invalidIdToken = jsonwebtoken.sign(
        {
          result_recipient_email: 'recipientEmail@example.net',
        },
        settings.authentication.secret,
        { expiresIn: '30d' },
      );

      // when
      const error = await catchErr(tokenService.extractResultRecipientEmailAndSessionId)(invalidIdToken);

      // then
      expect(error).to.be.an.instanceof(InvalidResultRecipientTokenError);
    });

    it('should throw if token is expired', async function () {
      // given
      const invalidIdToken = jsonwebtoken.sign(
        {
          result_recipient_email: 'recipientEmail@example.net',
          session_id: 1234,
        },
        settings.authentication.secret,
        { expiresIn: '1' },
      );

      // when
      setTimeout(async () => {
        return;
      }, 100);
      const error = await catchErr(tokenService.extractResultRecipientEmailAndSessionId)(invalidIdToken);

      // then
      expect(error).to.be.an.instanceof(InvalidResultRecipientTokenError);
    });
  });

  describe('#createCertificationResultsByRecipientEmailLinkToken', function () {
    it('should return a valid token with sessionId and resultRecipientEmail', function () {
      // given
      const sessionId = 'abcd1234';
      const resultRecipientEmail = 'results@college-romain-rolland.edu';
      const daysBeforeExpiration = 30;
      const expectedTokenAttributes = {
        session_id: 'abcd1234',
        result_recipient_email: 'results@college-romain-rolland.edu',
      };

      // when
      const linkToken = tokenService.createCertificationResultsByRecipientEmailLinkToken({
        sessionId,
        resultRecipientEmail,
        daysBeforeExpiration,
      });

      // then
      const decodedToken = jsonwebtoken.verify(linkToken, settings.authentication.secret);
      expect(omit(decodedToken, ['iat', 'exp'])).to.deep.equal(expectedTokenAttributes);
    });
  });

  describe('#createCertificationResultsLinkToken', function () {
    it('should return a valid token with sessionId and resultRecipientEmail', function () {
      // given
      const sessionId = 'abcd1234';
      const daysBeforeExpiration = 30;
      const expectedTokenAttributes = {
        session_id: 'abcd1234',
      };

      // when
      const linkToken = tokenService.createCertificationResultsLinkToken({ sessionId, daysBeforeExpiration });

      // then
      const decodedToken = jsonwebtoken.verify(linkToken, settings.authentication.secret);
      expect(omit(decodedToken, ['iat', 'exp'])).to.deep.equal(expectedTokenAttributes);
    });
  });

  describe('#createPasswordResetToken', function () {
    it('should return a valid token with userId', function () {
      // given
      const userId = 1;

      // when
      const token = tokenService.createPasswordResetToken(userId);

      // then
      const decodedToken = jsonwebtoken.verify(token, settings.authentication.secret);
      expect(omit(decodedToken, ['iat', 'exp'])).to.deep.equal({ user_id: userId });
    });
  });

  describe('#createAccessTokenFromAnonymousUser', function () {
    it('should create and return an access token and an expiration delay in seconds', function () {
      // given
      const userId = 1;
      settings.authentication.secret = 'SECRET_KEY';
      settings.anonymous.accessTokenLifespanMs = 10000;
      const payload = { user_id: userId, source: 'pix' };
      const secret = 'SECRET_KEY';
      const options = { expiresIn: 10 };
      sinon.stub(jsonwebtoken, 'sign').withArgs(payload, secret, options).returns('VALID_ACCESS_TOKEN');

      // when
      const result = tokenService.createAccessTokenFromAnonymousUser(userId);

      // then
      expect(result).to.equal('VALID_ACCESS_TOKEN');
    });
  });
});

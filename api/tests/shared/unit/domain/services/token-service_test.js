import jsonwebtoken from 'jsonwebtoken';
import lodash from 'lodash';

import { UserAccessToken } from '../../../../../src/identity-access-management/domain/models/UserAccessToken.js';
import { config, config as settings } from '../../../../../src/shared/config.js';
import {
  InvalidResultRecipientTokenError,
  InvalidSessionResultTokenError,
  InvalidTemporaryKeyError,
} from '../../../../../src/shared/domain/errors.js';
import { tokenService } from '../../../../../src/shared/domain/services/token-service.js';
import { catchErr, expect } from '../../../../test-helper.js';

const { omit } = lodash;

describe('Unit | Shared | Domain | Services | Token Service', function () {
  describe('#extractUserId', function () {
    it('should return userId if the accessToken is valid', function () {
      // given
      const userId = 123;
      const audience = 'https://admin.pix.fr';
      const accessToken = UserAccessToken.generateUserToken({ userId, source: 'pix', audience }).accessToken;

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

  describe('#extractCertificationResultsLink', function () {
    context('when the scope is valid', function () {
      it('should return the session id', function () {
        // given
        const token = jsonwebtoken.sign(
          {
            session_id: 12345,
            scope: 'certificationResultsLink',
          },
          settings.authentication.secret,
          { expiresIn: config.jwtConfig.certificationResults.tokenLifespan },
        );

        // when
        const tokenData = tokenService.extractCertificationResultsLink(token);

        // then
        expect(tokenData).to.deep.equal({
          sessionId: 12345,
        });
      });
    });

    context('when the scope is invalid', function () {
      it('should throw an InvalidSessionResultTokenError', async function () {
        // given
        const invalidToken = jsonwebtoken.sign(
          {
            session_id: 12345,
          },
          settings.authentication.secret,
          { expiresIn: '30d' },
        );

        // when
        const error = await catchErr(tokenService.extractCertificationResultsLink)(invalidToken);

        // then
        expect(error).to.be.an.instanceof(InvalidSessionResultTokenError);
      });
    });

    it('should throw if session id or result recipient email is missing', async function () {
      // given
      const invalidIdToken = jsonwebtoken.sign({}, settings.authentication.secret, { expiresIn: '30d' });

      // when
      const error = await catchErr(tokenService.extractCertificationResultsLink)(invalidIdToken);

      // then
      expect(error).to.be.an.instanceof(InvalidSessionResultTokenError);
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
      const error = await catchErr(tokenService.extractCertificationResultsLink)(invalidIdToken);

      // then
      expect(error).to.be.an.instanceof(InvalidSessionResultTokenError);
    });
  });

  describe('#extractCertificationResultsByRecipientEmailLink', function () {
    context('when the scope is valid', function () {
      it('should return the session id and result recipient email if the token is valid', function () {
        // given
        const token = jsonwebtoken.sign(
          {
            result_recipient_email: 'recipientEmail@example.net',
            session_id: 12345,
            scope: 'certificationResultsByRecipientEmailLink',
          },
          settings.authentication.secret,
          { expiresIn: '30d' },
        );

        // when
        const tokenData = tokenService.extractCertificationResultsByRecipientEmailLink(token);

        // then
        expect(tokenData).to.deep.equal({
          resultRecipientEmail: 'recipientEmail@example.net',
          sessionId: 12345,
        });
      });
    });

    context('when the scope is invalid', function () {
      it('should throw an InvalidResultRecipientTokenError', async function () {
        // given
        const invalidToken = jsonwebtoken.sign(
          { result_recipient_email: 'recipientEmail@example.net', session_id: 12345 },
          settings.authentication.secret,
          { expiresIn: '30d' },
        );

        // when
        const error = await catchErr(tokenService.extractCertificationResultsByRecipientEmailLink)(invalidToken);

        // then
        expect(error).to.be.an.instanceof(InvalidResultRecipientTokenError);
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
      const error = await catchErr(tokenService.extractCertificationResultsByRecipientEmailLink)(invalidIdToken);

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
      const error = await catchErr(tokenService.extractCertificationResultsByRecipientEmailLink)(invalidIdToken);

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
        scope: 'certificationResultsByRecipientEmailLink',
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
      const expectedTokenAttributes = {
        session_id: 'abcd1234',
        scope: 'certificationResultsLink',
      };

      // when
      const linkToken = tokenService.createCertificationResultsLinkToken({ sessionId });

      // then
      const decodedToken = jsonwebtoken.verify(linkToken, settings.authentication.secret);
      expect(omit(decodedToken, ['iat', 'exp'])).to.deep.equal(expectedTokenAttributes);
    });
  });
});

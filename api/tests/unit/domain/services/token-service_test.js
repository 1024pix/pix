const omit = require('lodash/omit');
const jsonwebtoken = require('jsonwebtoken');

const { catchErr, expect } = require('../../../test-helper');

const { InvalidTemporaryKeyError, InvalidExternalUserTokenError, InvalidResultRecipientTokenError, InvalidSessionResultError } = require('../../../../lib/domain/errors');
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

    it('should throw an InvalidExternalUserTokenError if the idToken is invalid', async () => {
      // given
      const idToken = 'WRONG_DATA';

      // when
      const error = await catchErr(tokenService.extractExternalUserFromIdToken)(idToken);
      expect(error).to.be.an.instanceof(InvalidExternalUserTokenError);
      expect(error.message).to.be.equal('Une erreur est survenue. Veuillez réessayer de vous connecter depuis le médiacentre.');

    });

  });

  describe('#extractUserId', () => {

    it('should return userId if the accessToken is valid', () => {
      // given
      const userId = 123;
      const accessToken = tokenService.createAccessTokenFromUser(userId, 'pix');

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

  describe('#extractSessionId', () => {

    it('should return the session id if the token is valid', () => {
      // given
      const token = jsonwebtoken.sign({
        session_id: 12345,
      }, settings.authentication.secret, { expiresIn: '30d' });

      // when
      const tokenData = tokenService.extractSessionId(token);

      // then
      expect(tokenData).to.deep.equal({
        sessionId: 12345,
      });
    });

    it('should throw if session id or result recipient email is missing', async () => {
      // given
      const invalidIdToken = jsonwebtoken.sign({
      }, settings.authentication.secret, { expiresIn: '30d' });

      // when
      const error = await catchErr(tokenService.extractSessionId)(invalidIdToken);

      // then
      expect(error).to.be.an.instanceof(InvalidSessionResultError);
    });

    it('should throw if token is expired', async () => {
      // given
      const invalidIdToken = jsonwebtoken.sign({
        session_id: 1234,
      }, settings.authentication.secret, { expiresIn: '1' });

      // when
      setTimeout(async() => {}, 100);
      const error = await catchErr(tokenService.extractSessionId)(invalidIdToken);

      // then
      expect(error).to.be.an.instanceof(InvalidSessionResultError);
    });
  });

  describe('#extractResultRecipientEmailAndSessionId', () => {

    it('should return the session id and result recipient email if the token is valid', () => {
      // given
      const token = jsonwebtoken.sign({
        result_recipient_email: 'recipientEmail@example.net',
        session_id: 12345,
      }, settings.authentication.secret, { expiresIn: '30d' });

      // when
      const tokenData = tokenService.extractResultRecipientEmailAndSessionId(token);

      // then
      expect(tokenData).to.deep.equal({
        resultRecipientEmail: 'recipientEmail@example.net',
        sessionId: 12345,
      });
    });

    it('should throw if session id or result recipient email is missing', async () => {
      // given
      const invalidIdToken = jsonwebtoken.sign({
        result_recipient_email: 'recipientEmail@example.net',
      }, settings.authentication.secret, { expiresIn: '30d' });

      // when
      const error = await catchErr(tokenService.extractResultRecipientEmailAndSessionId)(invalidIdToken);

      // then
      expect(error).to.be.an.instanceof(InvalidResultRecipientTokenError);
    });

    it('should throw if token is expired', async () => {
      // given
      const invalidIdToken = jsonwebtoken.sign({
        result_recipient_email: 'recipientEmail@example.net',
        session_id: 1234,
      }, settings.authentication.secret, { expiresIn: '1' });

      // when
      setTimeout(async() => {}, 100);
      const error = await catchErr(tokenService.extractResultRecipientEmailAndSessionId)(invalidIdToken);

      // then
      expect(error).to.be.an.instanceof(InvalidResultRecipientTokenError);
    });
  });

  describe('#extractPayloadFromPoleEmploiIdToken', () => {

    const cert_priv = '-----BEGIN RSA PRIVATE KEY-----\nMIIEpQIBAAKCAQEAvzoCEC2rpSpJQaWZbUmlsDNwp83Jr4fi6KmBWIwnj1MZ6CUQ7rBasuLI8AcfX5/10scSfQNCsTLV2tMKQaHuvyrVfwY0dINk+nkqB74QcT2oCCH9XduJjDuwWA4xLqAKuF96FsIes52opEM50W7/W7DZCKXkC8fFPFj6QF5ZzApDw2Qsu3yMRmr7/W9uWeaTwfPx24YdY7Ah+fdLy3KN40vXv9c4xiSafVvnx9BwYL7H1Q8NiK9LGEN6+JSWfgckQCs6UUBOXSZdreNN9zbQCwyzee7bOJqXUDAuLcFARzPw1EsZAyjVtGCKIQ0/btqK+jFunT2NBC8RItanDZpptQIDAQABAoIBAQCsssO4Pra8hFMCgX7tr0x+tAYy1ewmpW8stiDFilYT33YPLKJ9HjHbSms0MwqHftwwTm8JDc/GXmW6qUui+I64gQOtIzpuW1fvyUtHEMSisI83QRMkF6fCSQm6jJ6oQAtOdZO6R/gYOPNb3gayeS8PbMilQcSRSwp6tNTVGyC33p43uUUKAKHnpvAwUSc61aVOtw2wkD062XzMhJjYpHm65i4V31AzXo8HF42NrAtZ8K/AuQZne5F/6F4QFVlMKzUoHkSUnTp60XZxX77GuyDeDmCgSc2J7xvR5o6VpjsHMo3ek0gJk5ZBnTgkHvnpbULCRxTmDfjeVPuev3NN2TBFAoGBAPxbqNEsXPOckGTvG3tUOAAkrK1hfW3TwvrW/7YXg1/6aNV4sklcvqn/40kCK0v9xJIv9FM/l0Nq+CMWcrb4sjLeGwHAa8ASfk6hKHbeiTFamA6FBkvQ//7GP5khD+y62RlWi9PmwJY21lEkn2mP99THxqvZjQiAVNiqlYdwiIc7AoGBAMH8f2Ay7Egc2KYRYU2qwa5E/Cljn/9sdvUnWM+gOzUXpc5sBi+/SUUQT8y/rY4AUVW6YaK7chG9YokZQq7ZwTCsYxTfxHK2pnG/tXjOxLFQKBwppQfJcFSRLbw0lMbQoZBkS+zb0ufZzxc2fJfXE+XeJxmKs0TS9ltQuJiSqCPPAoGBALEc84K7DBG+FGmCl1sbZKJVGwwknA90zCeYtadrIT0/VkxchWSPvxE5Ep+u8gxHcqrXFTdILjWW4chefOyF5ytkTrgQAI+xawxsdyXWUZtd5dJq8lxLtx9srD4gwjh3et8ZqtFx5kCHBCu29Fr2PA4OmBUMfrs0tlfKgV+pT2j5AoGBAKnA0Z5XMZlxVM0OTH3wvYhI6fk2Kx8TxY2Gnxsh9m3hgcD/mvJRjEaZnZto6PFoqcRBU4taSNnpRr7+kfH8sCht0k7D+l8AIutLffx3xHv9zvvGHZqQ1nHKkaEuyjqo+5kli6N8QjWNzsFbdvBQ0CLJoqGhVHsXuWnzW3Z4cBbVAoGAEtnwY1OJM7+R2u1CW0tTjqDlYU2hUNa9t1AbhyGdI2arYp+p+umAb5VoYLNsdvZhqjVFTrYNEuhTJFYCF7jAiZLYvYm0C99BqcJnJPl7JjWynoNHNKw39f6PIOE1rAmPE8Cfz/GFF5115ZKVlq+2BY8EKNxbCIy2d/vMEvisnXI=\n-----END RSA PRIVATE KEY-----';

    function generateIdToken(payload) {
      return jsonwebtoken.sign({
        ...payload,
      }, cert_priv, { algorithm: 'RS256' });
    }

    const given_name = 'givenName';
    const family_name = 'familyName';
    const nonce = 'bb041272-d6e6-457c-99fb-ff1aa02217fd';
    const idIdentiteExterne = '094b83ac-2e20-4aa8-b438-0bc91748e4a6';

    it('should return given_name, family_name, nonce, idIdentiteExterne', async () => {
      // given
      const idToken = generateIdToken({
        given_name, family_name, nonce, idIdentiteExterne,
      });

      const expectedPayload = {
        given_name,
        family_name,
        nonce,
        idIdentiteExterne,
      };

      // when
      const payload = await tokenService.extractPayloadFromPoleEmploiIdToken(idToken);

      // then
      expect(payload).to.deep.equal(expectedPayload);
    });

  });

  describe('#createCertificationResultLinkToken', () => {
    it('should return a valid token with sessionId and resultRecipientEmail', () => {
      // given
      const sessionId = 'abcd1234';
      const resultRecipientEmail = 'results@college-romain-rolland.edu';
      const daysBeforeExpiration = 30;
      const expectedTokenAttributes = {
        'session_id': 'abcd1234',
        'result_recipient_email': 'results@college-romain-rolland.edu',
      };

      // when
      const linkToken = tokenService.createCertificationResultLinkToken({ sessionId, resultRecipientEmail, daysBeforeExpiration });

      // then
      const decodedToken = jsonwebtoken.verify(linkToken, settings.authentication.secret);
      expect(omit(decodedToken, ['iat', 'exp'])).to.deep.equal(expectedTokenAttributes);
    });
  });

});

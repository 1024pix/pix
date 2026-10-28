import { expect } from 'chai';
import { parseSetCookie } from 'cookie';
import jsonwebtoken from 'jsonwebtoken';

import { config } from '../../../../../config/config.js';
import { LtiPrescriberAccessToken } from '../../../../../src/lti/domain/models/LtiPrescriberAccessToken.js';
import { InvalidInputDataError, ObjectValidationError } from '../../../../../src/shared/domain/errors.js';

describe('Unit | LTI | Domain | Model | LtiPrescriberAccessToken', function () {
  describe('constructor', function () {
    it('validates arguments', function () {
      // given
      const args = {
        organizationIds: [123, 456],
        clientId: 'Abcd1234',
        deepLinkingSettings: {},
        // missing scope
        audience: 'https://orga.dev.pix.fr',
        sessionId: '6934a1f4-45c7-4bb4-9203-bc5fbe02a244',
      };

      // when
      const call = () => new LtiPrescriberAccessToken(args);

      // then
      expect(call).to.throw(ObjectValidationError);
    });
  });

  describe('encodedForSetCookieHeader', function () {
    it('returns an encoded token for a Set-Cookie header', function () {
      // given
      const token = new LtiPrescriberAccessToken({
        organizationIds: [123, 456],
        clientId: 'Abcd1234',
        deepLinkingSettings: {},
        scope: 'lti:deep-linking',
        audience: 'https://orga.dev.pix.fr',
        sessionId: '6934a1f4-45c7-4bb4-9203-bc5fbe02a244',
      });

      // when
      const value = token.encodedForSetCookieHeader;

      // then
      const parsed = parseSetCookie(value);
      expect(parsed).to.contain({
        name: 'jwtLtiPrescriber',
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        partitioned: true,
        path: '/api/lti',
      });
      expect(parsed).to.have.property('value').that.is.a('string');

      const decodedToken = jsonwebtoken.verify(parsed.value, config.authentication.secret, { complete: true });
      expect(decodedToken.header).to.deep.equal({ alg: 'HS256', typ: 'at+jwt' });
      expect(decodedToken.payload).to.deep.contain({
        organizationIds: [123, 456],
        client_id: 'Abcd1234',
        'https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings': {},
        scope: 'lti:deep-linking',
        aud: 'https://orga.dev.pix.fr',
        sid: '6934a1f4-45c7-4bb4-9203-bc5fbe02a244',
      });
      expect(decodedToken.payload).to.have.property('iat').which.is.a('number');
      expect(decodedToken.payload).to.have.property('exp').which.is.a('number');
    });
  });

  describe('decode', function () {
    it('decodes and verifies encoded token', function () {
      // given
      const encodedToken = jsonwebtoken.sign(
        {
          organizationIds: [123, 456],
          client_id: 'Abcd1234',
          'https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings': {},
          scope: 'lti:deep-linking',
          aud: 'https://orga.dev.pix.fr',
          sid: '6934a1f4-45c7-4bb4-9203-bc5fbe02a244',
        },
        config.authentication.secret,
        { expiresIn: config.lti.prescriberAccessTokenLifespan },
      );

      // when
      const token = LtiPrescriberAccessToken.decode(encodedToken);

      // then
      expect(token).to.deepEqualInstance(
        new LtiPrescriberAccessToken({
          organizationIds: [123, 456],
          clientId: 'Abcd1234',
          deepLinkingSettings: {},
          scope: 'lti:deep-linking',
          audience: 'https://orga.dev.pix.fr',
          sessionId: '6934a1f4-45c7-4bb4-9203-bc5fbe02a244',
        }),
      );
    });

    describe('when token is invalid', function () {
      it('throws an InvalidInputDataError', function () {
        // given
        const encodedToken = 'invalid';

        // when
        const call = () => LtiPrescriberAccessToken.decode(encodedToken);

        // then
        expect(call).to.throw(InvalidInputDataError);
      });
    });

    describe('when audience does not match expected', function () {
      it('throws an InvalidInputDataError', function () {
        // given
        const expectedAudience = 'https://orga.dev.pix.fr';
        const audience = 'https://wrong.dev.pix.fr';

        const encodedToken = jsonwebtoken.sign(
          {
            organizationIds: [123, 456],
            client_id: 'Abcd1234',
            'https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings': {},
            scope: 'lti:deep-linking',
            aud: audience,
            sid: '6934a1f4-45c7-4bb4-9203-bc5fbe02a244',
          },
          config.authentication.secret,
          { expiresIn: config.lti.prescriberAccessTokenLifespan },
        );

        // when
        const call = () => LtiPrescriberAccessToken.decode(encodedToken, { expectedAudience });

        // then
        expect(call).to.throw(InvalidInputDataError);
      });
    });
  });

  describe('setCookieHeaderForClearing', function () {
    it('returns Set-Cookie header value for clearing cookie', function () {
      // when
      const value = LtiPrescriberAccessToken.setCookieHeaderForClearing();

      // then
      const parsed = parseSetCookie(value);
      expect(parsed).to.deep.equal({
        name: 'jwtLtiPrescriber',
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        partitioned: true,
        path: '/api/lti',
        value: '',
        maxAge: -1,
      });
    });
  });
});

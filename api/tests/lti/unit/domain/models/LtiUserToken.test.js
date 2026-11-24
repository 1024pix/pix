import { expect } from 'chai';
import { parseSetCookie } from 'cookie';
import jsonwebtoken from 'jsonwebtoken';
import ms from 'ms';

import { config } from '../../../../../config/config.js';
import { LtiUserToken } from '../../../../../src/lti/domain/models/LtiUserToken.js';
import { InvalidInputDataError, ObjectValidationError } from '../../../../../src/shared/domain/errors.js';

describe('Unit | LTI | Domain | Model | LtiUserToken', function () {
  describe('constructor', function () {
    it('validates clientId', function () {
      // given
      const args = {
        // missing clientId
        userSub: 'moodle-user-sub',
      };

      // when
      const call = () => new LtiUserToken(args);

      // then
      expect(call).to.throw(ObjectValidationError);
    });

    it('validates userSub', function () {
      // given
      const args = {
        clientId: 'Abcd1234',
        // missing userSub
      };

      // when
      const call = () => new LtiUserToken(args);

      // then
      expect(call).to.throw(ObjectValidationError);
    });
  });

  describe('encodedForSetCookieHeader', function () {
    it('returns an encoded token for a Set-Cookie header', function () {
      // given
      const token = new LtiUserToken({
        clientId: 'Abcd1234',
        userSub: 'moodle-user-sub',
      });

      // when
      const value = token.encodedForSetCookieHeader;

      // then
      const parsed = parseSetCookie(value);
      expect(parsed).to.contain({
        name: 'ltiUser',
        secure: true,
        httpOnly: true,
        sameSite: 'strict',
        path: '/api/campaign-participations',
        maxAge: 600,
      });
      expect(parsed).to.have.property('value').that.is.a('string');

      const decodedToken = jsonwebtoken.verify(parsed.value, config.authentication.secret, { complete: true });
      expect(decodedToken.header).to.deep.equal({ alg: 'HS256', typ: 'lti-user+jwt' });
      expect(decodedToken.payload).to.deep.contain({
        'https://pix.org/claims/lti-client-id': 'Abcd1234',
        'https://pix.org/claims/lti-sub': 'moodle-user-sub',
      });
      expect(decodedToken.payload).to.have.property('iat').which.is.a('number');
      expect(decodedToken.payload).to.have.property('exp').which.is.a('number');
    });
  });

  describe('encoded', function () {
    it('returns an encoded token typed as LTI user token', function () {
      // given
      const token = new LtiUserToken({
        clientId: 'Abcd1234',
        userSub: 'moodle-user-sub',
      });

      // when
      const encodedToken = token.encoded;

      // then
      const decodedToken = jsonwebtoken.verify(encodedToken, config.authentication.secret, { complete: true });
      expect(decodedToken.header).to.deep.equal({ alg: 'HS256', typ: 'lti-user+jwt' });

      const { iat, exp, ...claims } = decodedToken.payload;
      expect(claims).to.deep.equal({
        'https://pix.org/claims/lti-client-id': 'Abcd1234',
        'https://pix.org/claims/lti-sub': 'moodle-user-sub',
      });
      expect(iat).to.be.a('number');
      expect(exp - iat).to.equal(ms(config.lti.ltiUserTokenLifespan) / 1000);
    });
  });

  describe('decode', function () {
    it('decodes and verifies encoded token', function () {
      // given
      const encodedToken = jsonwebtoken.sign(
        {
          'https://pix.org/claims/lti-client-id': 'Abcd1234',
          'https://pix.org/claims/lti-sub': 'moodle-user-sub',
        },
        config.authentication.secret,
        { expiresIn: config.lti.ltiUserTokenLifespan, header: { typ: 'lti-user+jwt' } },
      );

      // when
      const token = LtiUserToken.decode(encodedToken);

      // then
      expect(token).to.deepEqualInstance(
        new LtiUserToken({
          clientId: 'Abcd1234',
          userSub: 'moodle-user-sub',
        }),
      );
    });

    it('decodes a token produced by encoded', function () {
      // given
      const token = new LtiUserToken({
        clientId: 'Abcd1234',
        userSub: 'moodle-user-sub',
      });

      // when
      const decodedToken = LtiUserToken.decode(token.encoded);

      // then
      expect(decodedToken).to.deepEqualInstance(token);
    });

    describe('when token is invalid', function () {
      it('throws an InvalidInputDataError', function () {
        // given
        const encodedToken = 'invalid';

        // when
        const call = () => LtiUserToken.decode(encodedToken);

        // then
        expect(call).to.throw(InvalidInputDataError);
      });
    });

    describe('when token type is not lti-user+jwt', function () {
      it('throws an InvalidInputDataError', function () {
        // given
        const encodedToken = jsonwebtoken.sign(
          {
            'https://pix.org/claims/lti-client-id': 'Abcd1234',
            'https://pix.org/claims/lti-sub': 'moodle-user-sub',
          },
          config.authentication.secret,
          { expiresIn: config.lti.ltiUserTokenLifespan, header: { typ: 'at+jwt' } },
        );

        // when
        const call = () => LtiUserToken.decode(encodedToken);

        // then
        expect(call).to.throw(InvalidInputDataError);
      });
    });

    describe('when token is expired', function () {
      it('throws an InvalidInputDataError', function () {
        // given
        const encodedToken = jsonwebtoken.sign(
          {
            'https://pix.org/claims/lti-client-id': 'Abcd1234',
            'https://pix.org/claims/lti-sub': 'moodle-user-sub',
          },
          config.authentication.secret,
          { expiresIn: -1, header: { typ: 'lti-user+jwt' } },
        );

        // when
        const call = () => LtiUserToken.decode(encodedToken);

        // then
        expect(call).to.throw(InvalidInputDataError);
      });
    });

    describe('when token is signed with another secret', function () {
      it('throws an InvalidInputDataError', function () {
        // given
        const encodedToken = jsonwebtoken.sign(
          {
            'https://pix.org/claims/lti-client-id': 'Abcd1234',
            'https://pix.org/claims/lti-sub': 'moodle-user-sub',
          },
          'another-secret',
          { expiresIn: config.lti.ltiUserTokenLifespan, header: { typ: 'lti-user+jwt' } },
        );

        // when
        const call = () => LtiUserToken.decode(encodedToken);

        // then
        expect(call).to.throw(InvalidInputDataError);
      });
    });

    describe('when a claim is missing', function () {
      it('throws an ObjectValidationError', function () {
        // given
        const encodedToken = jsonwebtoken.sign(
          {
            'https://pix.org/claims/lti-client-id': 'Abcd1234',
            // missing lti-sub claim
          },
          config.authentication.secret,
          { expiresIn: config.lti.ltiUserTokenLifespan, header: { typ: 'lti-user+jwt' } },
        );

        // when
        const call = () => LtiUserToken.decode(encodedToken);

        // then
        expect(call).to.throw(ObjectValidationError);
      });
    });
  });

  describe('setCookieHeaderForClearing', function () {
    it('returns Set-Cookie header value for clearing cookie', function () {
      // when
      const value = LtiUserToken.setCookieHeaderForClearing();

      // then
      const parsed = parseSetCookie(value);
      expect(parsed).to.deep.equal({
        name: 'ltiUser',
        secure: true,
        httpOnly: true,
        sameSite: 'strict',
        path: '/api/campaign-participations',
        value: '',
        maxAge: -1,
      });
    });
  });
});

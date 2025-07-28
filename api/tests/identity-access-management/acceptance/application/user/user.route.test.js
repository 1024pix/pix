import lodash from 'lodash';

import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../src/identity-access-management/domain/constants/identity-providers.js';
import { anonymousUserTokenRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/anonymous-user-token.repository.js';
import { emailValidationDemandRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/email-validation-demand.repository.js';
import * as userRepository from '../../../../../src/identity-access-management/infrastructure/repositories/user.repository.js';
import { userEmailRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/user-email.repository.js';
import { constants } from '../../../../../src/shared/domain/constants.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { featureToggles } from '../../../../../src/shared/infrastructure/feature-toggles/index.js';
import {
  createServer,
  databaseBuilder,
  domainBuilder,
  expect,
  generateAuthenticatedUserRequestHeaders,
  knex,
  sinon,
} from '../../../../test-helper.js';

const { pick } = lodash;

describe('Acceptance | Identity Access Management | Application | Route | User', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/users', function () {
    const options = {
      method: 'POST',
      url: '/api/users',
      payload: {
        data: {
          type: 'users',
          attributes: {
            password: 'Password123',
            cgu: true,
          },
          relationships: {},
        },
      },
    };

    let user;

    context('user is valid', function () {
      beforeEach(function () {
        user = domainBuilder.buildUser({ username: null });

        options.payload.data.attributes = {
          ...options.payload.data.attributes,
          'first-name': user.firstName,
          'last-name': user.lastName,
          email: user.email,
        };
      });

      it('returns status 201 with user', async function () {
        // given
        const pickedUserAttributes = ['first-name', 'last-name', 'email', 'username', 'cgu'];
        const expectedAttributes = {
          'first-name': user.firstName,
          'last-name': user.lastName,
          email: user.email,
          username: user.username,
          cgu: user.cgu,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.data.type).to.equal('users');
        expect(response.result.data.attributes['last-terms-of-service-validated-at']).to.be.instanceOf(Date);
        const userAttributes = pick(response.result.data.attributes, pickedUserAttributes);
        expect(userAttributes).to.deep.equal(expectedAttributes);
      });

      it('creates user in Database', async function () {
        // given
        const pickedUserAttributes = ['firstName', 'lastName', 'email', 'username', 'cgu'];
        const expectedUser = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          cgu: user.cgu,
        };

        // when
        await server.inject(options);

        // then
        const userFound = await userRepository.getByUsernameOrEmailWithRolesAndPassword(user.email);
        expect(pick(userFound, pickedUserAttributes)).to.deep.equal(expectedUser);
        expect(userFound.authenticationMethods[0].authenticationComplement.password).to.exist;
      });
    });

    context('when a "locale" cookie is present', function () {
      it('creates a user with a locale in database', async function () {
        // given
        const locale = 'fr';
        const userAttributes = {
          'first-name': 'John',
          'last-name': 'DoDoe',
          email: 'john.dodoe@example.net',
          cgu: true,
          password: 'Password123',
        };

        const options = {
          method: 'POST',
          url: '/api/users',
          headers: {
            cookie: `locale=${locale}`,
          },
          payload: {
            data: {
              type: 'users',
              attributes: userAttributes,
              relationships: {},
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        const createdUser = await userRepository.getByUsernameOrEmailWithRolesAndPassword(userAttributes.email);
        expect(createdUser.locale).to.equal(locale);
        expect(response.statusCode).to.equal(201);
      });
    });

    context('user is invalid', function () {
      const validUserAttributes = {
        'first-name': 'John',
        'last-name': 'DoDoe',
        email: 'john.doe@example.net',
        password: 'Ab124B2C3#!',
        cgu: true,
      };

      it('returns Unprocessable Entity (HTTP_422) with offending properties', async function () {
        const invalidUserAttributes = { ...validUserAttributes, 'must-validate-terms-of-service': 'not_a_boolean' };

        const options = {
          method: 'POST',
          url: '/api/users',
          payload: {
            data: {
              type: 'users',
              attributes: invalidUserAttributes,
              relationships: {},
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(422);
        expect(response.result.errors[0].title).to.equal('Invalid data attribute "mustValidateTermsOfService"');
      });
    });
  });

  describe('PATCH /api/users/{id}', function () {
    const email = 'john.doe@example.net';
    const firstName = 'John';
    const lastName = 'Doe';
    const password = 'P@ssW0rd';

    let userId;
    let anonymousToken;
    let requestPayload;

    beforeEach(async function () {
      const user = databaseBuilder.factory.buildUser.anonymous();
      userId = user.id;
      anonymousToken = await anonymousUserTokenRepository.save(userId);
      await databaseBuilder.commit();

      requestPayload = {
        data: {
          type: 'users',
          id: userId,
          attributes: {
            'first-name': firstName,
            'last-name': lastName,
            email,
            password,
            cgu: true,
            'anonymous-user-token': anonymousToken,
          },
        },
      };
    });

    it('upgrades anonymous user to real user', async function () {
      // when
      const response = await server.inject({
        method: 'PATCH',
        url: `/api/users/${userId}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        payload: requestPayload,
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.type).to.equal('users');
      expect(response.result.data.id).to.equal(String(userId));

      const attributes = response.result.data.attributes;
      expect(attributes['first-name']).to.equal(firstName);
      expect(attributes['last-name']).to.equal(lastName);
      expect(attributes.email).to.equal(email);
      expect(attributes.cgu).to.be.true;
      expect(attributes.locale);
      expect(attributes['is-anonymous']).to.be.false;
    });

    it('fails with 401 if user is not authenticated', async function () {
      // when
      const response = await server.inject({
        method: 'PATCH',
        url: `/api/users/${userId}`,
        payload: requestPayload,
      });

      // then
      expect(response.statusCode).to.equal(401);
    });

    it('fails with 401 if anonymousUserToken is invalid', async function () {
      // given
      const invalidPayload = {
        ...requestPayload,
        data: {
          ...requestPayload.data,
          attributes: {
            ...requestPayload.data.attributes,
            'anonymous-user-token': 'invalid-token',
          },
        },
      };

      // when
      const response = await server.inject({
        method: 'PATCH',
        url: `/api/users/${userId}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        payload: invalidPayload,
      });

      // then
      expect(response.statusCode).to.equal(401);
    });
  });

  describe('GET /api/users/me', function () {
    let options;
    let user;
    let expectedCode;

    beforeEach(async function () {
      user = databaseBuilder.factory.buildUser();
      const campaign = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION', code: 'SOMECODE' });
      const assessmentCampaign = databaseBuilder.factory.buildCampaign({ type: 'ASSESSMENT' });
      expectedCode = campaign.code;
      const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: 'TO_SHARE',
        userId: user.id,
      });
      databaseBuilder.factory.buildAssessment({
        campaignParticipationId: campaignParticipationId,
        type: Assessment.types.CAMPAIGN,
        userId: user.id,
      });
      const participation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: assessmentCampaign.id,
        userId: user.id,
      });
      databaseBuilder.factory.buildAssessment({
        campaignParticipationId: participation.id,
        type: Assessment.types.CAMPAIGN,
        userId: user.id,
      });
      const { id: trainingId } = databaseBuilder.factory.buildTraining();
      databaseBuilder.factory.buildUserRecommendedTraining({ userId: user.id, trainingId, campaignParticipationId });

      options = {
        method: 'GET',
        url: '/api/users/me',
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
      };

      return databaseBuilder.commit();
    });

    it('returns found user with 200 HTTP status code', async function () {
      // given
      sinon.stub(constants, 'AUTONOMOUS_COURSES_ORGANIZATION_ID').value(777);

      const expectedUserJSONApi = {
        data: {
          type: 'users',
          id: user.id.toString(),
          attributes: {
            'first-name': user.firstName,
            'last-name': user.lastName,
            email: user.email.toLowerCase(),
            'email-confirmed': false,
            username: user.username,
            cgu: user.cgu,
            lang: 'fr',
            'is-anonymous': false,
            'anonymous-user-token': null,
            'last-terms-of-service-validated-at': user.lastTermsOfServiceValidatedAt,
            'must-validate-terms-of-service': user.mustValidateTermsOfService,
            'has-seen-assessment-instructions': user.hasSeenAssessmentInstructions,
            'has-seen-new-dashboard-info': user.hasSeenNewDashboardInfo,
            'has-seen-focused-challenge-tooltip': user.hasSeenFocusedChallengeTooltip,
            'has-seen-other-challenges-tooltip': user.hasSeenOtherChallengesTooltip,
            'has-assessment-participations': true,
            'code-for-last-profile-to-share': expectedCode,
            'has-recommended-trainings': true,
            'should-see-data-protection-policy-information-banner': true,
            'last-data-protection-policy-seen-at': null,
          },
          relationships: {
            'account-info': {
              links: {
                related: '/api/users/my-account',
              },
            },
            profile: {
              links: {
                related: `/api/users/${user.id}/profile`,
              },
            },
            'is-certifiable': {
              links: {
                related: `/api/users/${user.id}/is-certifiable`,
              },
            },
            trainings: {
              links: {
                related: `/api/users/${user.id}/trainings`,
              },
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedUserJSONApi);
    });
  });

  describe('GET /api/users/my-account', function () {
    it('returns 200 HTTP status code', async function () {
      // given
      await featureToggles.set('isSelfAccountDeletionEnabled', false);
      const user = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/users/my-account',
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          type: 'account-infos',
          id: user.id.toString(),
          attributes: {
            'can-self-delete-account': false,
            email: user.email,
            username: user.username,
          },
        },
      });
    });
  });

  describe('GET /api/users/{id}/authentication-methods', function () {
    it('returns 200 HTTP status code', async function () {
      // given
      const user = databaseBuilder.factory.buildUser({});
      const garAuthenticationMethod = databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
        userId: user.id,
      });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/users/${user.id}/authentication-methods`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      const expectedJson = {
        data: [
          {
            type: 'authentication-methods',
            id: garAuthenticationMethod.id.toString(),
            attributes: {
              'identity-provider': NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
            },
          },
        ],
      };

      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedJson);
    });
  });

  describe('PATCH /api/users/{id}/password-update', function () {
    const temporaryKey = 'good-temporary-key';
    let options, user;

    beforeEach(async function () {
      user = databaseBuilder.factory.buildUser.withRawPassword({
        email: 'harry.cover@truc.so',
        rawPassword: 'Password2020',
      });
      await databaseBuilder.commit();
      await _insertPasswordResetDemand(temporaryKey, user.email);
    });

    describe('Error case', function () {
      context('when temporary key is invalid', function () {
        it('replies with an error', async function () {
          // given
          options = {
            method: 'PATCH',
            url: `/api/users/${user.id}/password-update?temporary-key=bad-temporary-key`,
            payload: {
              data: {
                id: user.id,
                attributes: {
                  password: 'Password2021',
                },
              },
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
        });
      });
    });

    describe('Success case', function () {
      const newPassword = 'Password2021';

      beforeEach(function () {
        options = {
          method: 'PATCH',
          url: `/api/users/${user.id}/password-update?temporary-key=${temporaryKey}`,
          payload: {
            data: {
              id: user.id,
              attributes: {
                password: newPassword,
              },
            },
          },
        };
      });

      context('when password is updated', function () {
        it('replies with 204 status code', async function () {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(204);
        });
      });
    });
  });

  describe('PATCH /api/users/{id}/pix-terms-of-service-acceptance', function () {
    let user;
    let options;

    beforeEach(async function () {
      user = databaseBuilder.factory.buildUser({ mustValidateTermsOfService: true });

      options = {
        method: 'PATCH',
        url: `/api/users/${user.id}/pix-terms-of-service-acceptance`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
      };

      return databaseBuilder.commit();
    });

    describe('Error cases', function () {
      it('responds with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('responds with a 403 - forbidden access - if requested user is not the same as authenticated user', async function () {
        // given
        const otherUserId = 9999;
        options.headers = generateAuthenticatedUserRequestHeaders({ userId: otherUserId });

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('Success case', function () {
      it('returns the user with pixTermsOfServiceAccepted', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.attributes['must-validate-terms-of-service']).to.be.false;
        expect(response.result.data.attributes['last-terms-of-service-validated-at']).to.exist;
      });
    });
  });

  describe('PATCH /api/users/{id}/pix-orga-terms-of-service-acceptance', function () {
    let user;
    let options;

    beforeEach(async function () {
      user = databaseBuilder.factory.buildUser();

      options = {
        method: 'PATCH',
        url: `/api/users/${user.id}/pix-orga-terms-of-service-acceptance`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
      };

      return databaseBuilder.commit();
    });

    describe('Error cases', function () {
      it('responds with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('responds with a 403 - forbidden access - if requested user is not the same as authenticated user', async function () {
        // given
        const otherUserId = 9999;
        options.headers = generateAuthenticatedUserRequestHeaders({ userId: otherUserId });

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('Success case', function () {
      it('replies with 204 status code', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });
  });

  describe('PATCH /api/users/{id}/pix-certif-terms-of-service-acceptance', function () {
    let user;
    let options;

    beforeEach(async function () {
      user = databaseBuilder.factory.buildUser({ pixCertifTermsOfServiceAccepted: false });

      options = {
        method: 'PATCH',
        url: `/api/users/${user.id}/pix-certif-terms-of-service-acceptance`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
      };

      return databaseBuilder.commit();
    });

    describe('Error cases', function () {
      it('responds with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('responds with a 403 - forbidden access - if requested user is not the same as authenticated user', async function () {
        // given
        const otherUserId = 9999;
        options.headers = generateAuthenticatedUserRequestHeaders({ userId: otherUserId });

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('Success case', function () {
      it('returns a response with HTTP status code 204', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });
  });

  describe('PATCH /api/users/{id}/lang/{lang}', function () {
    let user;
    let options;
    const newLang = 'en';

    beforeEach(async function () {
      user = databaseBuilder.factory.buildUser({ lang: 'fr' });

      options = {
        method: 'PATCH',
        url: `/api/users/${user.id}/lang/${newLang}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
      };

      return databaseBuilder.commit();
    });

    describe('Resource access management', function () {
      it('responds with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('responds with a 403 - forbidden access - if requested user is not the same as authenticated user', async function () {
        // given
        const otherUserId = 9999;
        options.headers = generateAuthenticatedUserRequestHeaders({ userId: otherUserId });

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('responds with a 400 where the langage is not correct', async function () {
        // given
        options.url = `/api/users/${user.id}/lang/jp`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    describe('Success case', function () {
      it('returns the user with new lang', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.attributes['lang']).to.equal(newLang);
      });
    });
  });

  describe('PATCH /api/users/{id}/has-seen-last-data-protection-policy-information', function () {
    describe('Success case', function () {
      let clock;
      const now = new Date('2022-12-07');

      beforeEach(async function () {
        clock = sinon.useFakeTimers({
          now,
          toFake: ['Date'],
        });
      });

      afterEach(function () {
        clock.restore();
      });

      it('returns a response with HTTP status code 200', async function () {
        // given
        const user = databaseBuilder.factory.buildUser({ lastDataProtectionPolicySeenAt: null });
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: `/api/users/${user.id}/has-seen-last-data-protection-policy-information`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        });

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.attributes['last-data-protection-policy-seen-at']).to.deep.equal(now);
      });
    });
  });

  describe('PATCH /api/users/{id}/has-seen-challenge-tooltip/{challengeType}', function () {
    let challengeType, user, options;

    describe('Error cases', function () {
      beforeEach(function () {
        challengeType = 'focused';
        user = databaseBuilder.factory.buildUser({ hasSeenFocusedChallengeTooltip: false });

        options = {
          method: 'PATCH',
          url: `/api/users/${user.id}/has-seen-challenge-tooltip/${challengeType}`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        };

        return databaseBuilder.commit();
      });

      it('responds with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('responds with a 403 - forbidden access - if requested user is not the same as authenticated user', async function () {
        // given
        const otherUserId = 9999;
        options.headers = generateAuthenticatedUserRequestHeaders({ userId: otherUserId });

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('Success cases', function () {
      it('returns the user with has seen challenge tooltip', async function () {
        // given
        challengeType = 'focused';
        user = databaseBuilder.factory.buildUser({ hasSeenFocusedChallengeTooltip: false });

        options = {
          method: 'PATCH',
          url: `/api/users/${user.id}/has-seen-challenge-tooltip/${challengeType}`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        };

        await databaseBuilder.commit();
        // when
        const response = await server.inject(options);

        // then
        expect(response.result.data.attributes['has-seen-focused-challenge-tooltip']).to.be.true;
      });

      it('returns the user with has seen other challenges tooltip', async function () {
        // given
        challengeType = 'other';
        user = databaseBuilder.factory.buildUser({ hasSeenFocusedChallengeTooltip: false });

        options = {
          method: 'PATCH',
          url: `/api/users/${user.id}/has-seen-challenge-tooltip/${challengeType}`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        };

        await databaseBuilder.commit();
        // when
        const response = await server.inject(options);

        // then
        expect(response.result.data.attributes['has-seen-other-challenges-tooltip']).to.be.true;
      });
    });
  });

  describe('GET /api/users/validate-email', function () {
    let user, token;

    beforeEach(async function () {
      user = databaseBuilder.factory.buildUser();
      token = await emailValidationDemandRepository.save(user.id);
      return databaseBuilder.commit();
    });

    describe('Success cases', function () {
      it('redirects after email validation', async function () {
        // given
        const options = {
          method: 'GET',
          url: `/api/users/validate-email?token=${token}&redirect_url=https://this.is.redirecting.com`,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(302);
        expect(response.headers['location']).to.equal('https://this.is.redirecting.com');
      });
    });
  });

  describe('PUT /api/users/{id}/email/verification-code', function () {
    it('returns 204 HTTP status code', async function () {
      // given
      const server = await createServer();

      const newEmail = 'new_email@example.net';
      const locale = 'fr-fr';
      const rawPassword = 'Password123';
      const user = databaseBuilder.factory.buildUser.withRawPassword({
        email: 'judy.howl@example.net',
        rawPassword,
      });

      await databaseBuilder.commit();

      const payload = {
        data: {
          type: 'email-verification-codes',
          attributes: {
            'new-email': newEmail,
            password: rawPassword,
          },
        },
      };

      const options = {
        method: 'PUT',
        url: `/api/users/${user.id}/email/verification-code`,
        payload,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id, acceptLanguage: locale }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('returns 422 if email already exists', async function () {
      // given
      const server = await createServer();

      const locale = 'fr-fr';
      const rawPassword = 'Password123';
      const user = databaseBuilder.factory.buildUser.withRawPassword({
        email: 'judy.howl@example.net',
        rawPassword,
      });

      await databaseBuilder.commit();

      const payload = {
        data: {
          type: 'email-verification-codes',
          attributes: {
            'new-email': user.email,
            password: rawPassword,
          },
        },
      };

      const options = {
        method: 'PUT',
        url: `/api/users/${user.id}/email/verification-code`,
        payload,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id, acceptLanguage: locale }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(422);
      expect(response.result.errors[0].detail).to.equal('INVALID_OR_ALREADY_USED_EMAIL');
    });

    it('returns 403 if requested user is not the same as authenticated user', async function () {
      // given
      const server = await createServer();

      const locale = 'fr-fr';
      const rawPassword = 'Password123';
      const user = databaseBuilder.factory.buildUser.withRawPassword({
        id: 2000,
        email: 'judy.howl@example.net',
        rawPassword,
      });

      await databaseBuilder.commit();

      const payload = {
        data: {
          type: 'email-verification-codes',
          attributes: {
            'new-email': user.email,
            password: rawPassword,
          },
        },
      };

      const options = {
        method: 'PUT',
        url: '/api/users/999/email/verification-code',
        payload,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id, acceptLanguage: locale }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result.errors[0].detail).to.equal('Missing or insufficient permissions.');
    });

    it('returns 400 if password is not valid', async function () {
      // given
      const server = await createServer();

      const locale = 'fr-fr';
      const newEmail = 'new_email@example.net';
      const rawPassword = 'Password123';
      const user = databaseBuilder.factory.buildUser.withRawPassword({
        email: 'judy.howl@example.net',
        rawPassword,
      });

      await databaseBuilder.commit();

      const payload = {
        data: {
          type: 'email-verification-codes',
          attributes: {
            'new-email': newEmail,
            password: 'WRONG-PASSWORD',
          },
        },
      };

      const options = {
        method: 'PUT',
        url: `/api/users/${user.id}/email/verification-code`,
        payload,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id, acceptLanguage: locale }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(400);
      expect(response.result.errors[0].detail).to.equal('Le mot de passe que vous avez saisi est invalide.');
    });
  });

  describe('POST /api/users/{id}/update-email', function () {
    it('returns 200 HTTP status code', async function () {
      // given
      const server = await createServer();

      const code = '999999';
      const newEmail = 'judy.new_email@example.net';
      const user = databaseBuilder.factory.buildUser.withRawPassword({
        email: 'judy.howl@example.net',
      });
      await databaseBuilder.commit();

      await userEmailRepository.saveEmailModificationDemand({ userId: user.id, code, newEmail });

      const payload = {
        data: {
          type: 'email-verification-codes',
          attributes: {
            code,
          },
        },
      };

      const options = {
        method: 'POST',
        url: `/api/users/${user.id}/update-email`,
        payload,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('DELETE /api/users/me', function () {
    let userId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
    });

    it('anonymizes the user and returns a 204 HTTP status code', async function () {
      // given
      const options = {
        method: 'DELETE',
        url: '/api/users/me',
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);

      const user = await knex('users').select().where({ id: userId }).first();
      expect(user.hasBeenAnonymised).to.be.true;
    });
  });

  describe('GET /api/certification-point-of-contacts/me', function () {
    it('returns a 200 HTTP status code', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ externalId: 'EX123' }).id;
      const certificationCenterMembershipId = databaseBuilder.factory.buildCertificationCenterMembership({
        userId,
        certificationCenterId,
      }).id;
      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification();
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: complementaryCertification.id,
      });

      await databaseBuilder.commit();
      const options = {
        method: 'GET',
        url: '/api/certification-point-of-contacts/me',
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.id).to.equal(userId.toString());
      expect(response.result.data.attributes.lang).to.equal('fr');

      expect(response.result.data.relationships).to.deep.include({
        'certification-center-memberships': {
          data: [
            {
              id: certificationCenterMembershipId.toString(),
              type: 'certification-center-membership',
            },
          ],
        },
      });

      expect(response.result.included).to.deep.have.members([
        {
          attributes: {
            'external-id': 'EX123',
            habilitations: [
              {
                id: complementaryCertification.id,
                label: complementaryCertification.label,
                key: complementaryCertification.key,
              },
            ],
            'is-access-blocked-aefe': false,
            'is-access-blocked-agri': false,
            'is-access-blocked-college': false,
            'is-access-blocked-lycee': false,
            'is-related-to-managing-students-organization': false,
            name: 'some name',
            'pix-certif-sco-blocked-access-date-college': null,
            'pix-certif-sco-blocked-access-date-lycee': null,
            'related-organization-tags': [],
            type: 'SUP',
          },
          id: certificationCenterId.toString(),
          type: 'allowed-certification-center-access',
        },
        {
          id: certificationCenterMembershipId.toString(),
          type: 'certification-center-membership',
          attributes: {
            'certification-center-id': certificationCenterId,
            'user-id': userId,
            role: 'MEMBER',
          },
        },
      ]);
    });
  });
});

function _insertPasswordResetDemand(temporaryKey, email) {
  const resetDemandRaw = { email, temporaryKey };
  return knex('reset-password-demands').insert(resetDemandRaw);
}

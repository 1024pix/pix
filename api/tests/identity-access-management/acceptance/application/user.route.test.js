import lodash from 'lodash';

import { constants } from '../../../../lib/domain/constants.js';
import * as userRepository from '../../../../src/identity-access-management/infrastructure/repositories/user.repository.js';
import {
  createServer,
  databaseBuilder,
  domainBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  knex,
  nock,
  sinon,
} from '../../../test-helper.js';

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
        nock('https://www.google.com').post('/recaptcha/api/siteverify').query(true).reply(200, {
          success: true,
        });

        user = domainBuilder.buildUser({ username: null });

        options.payload.data.attributes = {
          ...options.payload.data.attributes,
          'first-name': user.firstName,
          'last-name': user.lastName,
          email: user.email,
        };
      });

      afterEach(async function () {
        nock.cleanAll();
      });

      it('should return status 201 with user', async function () {
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
        expect(response.result.data.attributes['recaptcha-token']).to.be.undefined;
        expect(response.result.data.attributes['last-terms-of-service-validated-at']).to.be.instanceOf(Date);
        const userAttributes = pick(response.result.data.attributes, pickedUserAttributes);
        expect(userAttributes).to.deep.equal(expectedAttributes);
      });

      it('should create user in Database', async function () {
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
        const localeFromCookie = 'fr';
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
            cookie: `locale=${localeFromCookie}`,
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
        expect(createdUser.locale).to.equal(localeFromCookie);
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

      it('should return Unprocessable Entity (HTTP_422) with offending properties', async function () {
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
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: assessmentCampaign.id,
        userId: user.id,
      });
      const { id: trainingId } = databaseBuilder.factory.buildTraining();
      databaseBuilder.factory.buildUserRecommendedTraining({ userId: user.id, trainingId, campaignParticipationId });

      options = {
        method: 'GET',
        url: '/api/users/me',
        payload: {},
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
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
            'last-terms-of-service-validated-at': user.lastTermsOfServiceValidatedAt,
            'must-validate-terms-of-service': user.mustValidateTermsOfService,
            'pix-orga-terms-of-service-accepted': user.pixOrgaTermsOfServiceAccepted,
            'pix-certif-terms-of-service-accepted': user.pixCertifTermsOfServiceAccepted,
            'has-seen-assessment-instructions': user.hasSeenAssessmentInstructions,
            'has-seen-new-dashboard-info': user.hasSeenNewDashboardInfo,
            'has-seen-focused-challenge-tooltip': user.hasSeenFocusedChallengeTooltip,
            'has-seen-other-challenges-tooltip': user.hasSeenOtherChallengesTooltip,
            'has-seen-level-seven-info': false,
            'has-assessment-participations': true,
            'code-for-last-profile-to-share': expectedCode,
            'has-recommended-trainings': true,
            'should-see-data-protection-policy-information-banner': true,
            'last-data-protection-policy-seen-at': null,
          },
          relationships: {
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
        it('replies with 200 status code', async function () {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(204);
        });
      });
    });
  });
});

function _insertPasswordResetDemand(temporaryKey, email) {
  const resetDemandRaw = { email, temporaryKey };
  return knex('reset-password-demands').insert(resetDemandRaw);
}

import { userController } from '../../../../../src/identity-access-management/application/user/user.controller.js';
import { User } from '../../../../../src/identity-access-management/domain/models/User.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { getI18n } from '../../../../../src/shared/infrastructure/i18n/i18n.js';
import * as requestResponseUtils from '../../../../../src/shared/infrastructure/utils/request-response-utils.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Application | Controller | User', function () {
  let userSerializer;

  beforeEach(function () {
    userSerializer = {
      deserialize: sinon.stub(),
      serialize: sinon.stub(),
    };
  });

  describe('#acceptPixCertifTermsOfService', function () {
    it('accepts pix certif terms of service', async function () {
      // given
      const userId = 1;
      sinon.stub(usecases, 'acceptPixCertifTermsOfService');

      // when
      await userController.acceptPixCertifTermsOfService(
        {
          auth: { credentials: { userId } },
          params: { id: userId },
        },
        hFake,
      );

      // then
      sinon.assert.calledWith(usecases.acceptPixCertifTermsOfService, { userId: 1 });
    });
  });

  describe('#acceptPixLastTermsOfService', function () {
    let request;
    const userId = 1;

    beforeEach(function () {
      request = {
        auth: { credentials: { userId } },
        params: { id: userId },
      };

      sinon.stub(usecases, 'acceptPixLastTermsOfService');
    });

    it('accepts pix terms of service', async function () {
      // given
      usecases.acceptPixLastTermsOfService.withArgs({ userId }).resolves({});
      const stubSerializedObject = 'ok';
      userSerializer.serialize.withArgs({}).returns(stubSerializedObject);

      // when
      const response = await userController.acceptPixLastTermsOfService(request, hFake, { userSerializer });

      // then
      expect(response).to.be.equal(stubSerializedObject);
    });
  });

  describe('#acceptPixOrgaTermsOfService', function () {
    let request;
    const userId = 1;

    beforeEach(function () {
      request = {
        auth: { credentials: { userId } },
        params: { id: userId },
      };

      sinon.stub(usecases, 'acceptPixOrgaTermsOfService');
    });

    it('accepts pix orga terms of service', async function () {
      // given
      usecases.acceptPixOrgaTermsOfService.withArgs({ userId }).resolves();

      // when
      const response = await userController.acceptPixOrgaTermsOfService(request, hFake);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('#changeUserLanguage', function () {
    let request;
    const userId = 1;
    const lang = 'en';

    beforeEach(function () {
      request = {
        auth: { credentials: { userId } },
        params: { id: userId, lang },
      };

      sinon.stub(usecases, 'changeUserLanguage');
    });

    it('updates user language', async function () {
      // given
      usecases.changeUserLanguage.resolves({});
      userSerializer.serialize.withArgs({}).returns('ok');

      // when
      await userController.changeUserLanguage(request, hFake, { userSerializer });

      // then
      sinon.assert.calledWith(usecases.changeUserLanguage, { userId, language: lang });
    });
  });

  describe('#getCurrentUser', function () {
    it('gets the current user', async function () {
      // given
      const request = { auth: { credentials: { userId: 1 } } };
      const currentUser = Symbol('current-user');
      const getCurrentUserStub = sinon.stub(usecases, 'getCurrentUser');
      const userWithActivitySerializer = { serialize: sinon.stub() };

      usecases.getCurrentUser.withArgs({ authenticatedUserId: 1 }).resolves(currentUser);
      userWithActivitySerializer.serialize.withArgs(currentUser).returns('ok');

      // when
      const response = await userController.getCurrentUser(request, hFake, { userWithActivitySerializer });

      // then
      expect(response).to.be.equal('ok');
      expect(getCurrentUserStub).to.have.been.calledWithExactly({ authenticatedUserId: 1 });
      expect(userWithActivitySerializer.serialize).to.have.been.calledWithExactly(currentUser);
    });
  });

  describe('#getUserAuthenticationMethods', function () {
    it('calls the usecase to find user authentication methods', async function () {
      // given
      const user = domainBuilder.buildUser();
      const authenticationMethods = [
        domainBuilder.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({ userId: user.id }),
      ];

      const responseSerialized = Symbol('an response serialized');
      sinon.stub(usecases, 'findUserAuthenticationMethods');
      const authenticationMethodsSerializer = { serialize: sinon.stub() };

      usecases.findUserAuthenticationMethods.withArgs({ userId: user.id }).resolves(authenticationMethods);
      authenticationMethodsSerializer.serialize.withArgs(authenticationMethods).returns(responseSerialized);

      const request = {
        auth: {
          credentials: {
            userId: user.id,
          },
        },
        params: {
          id: user.id,
        },
      };

      // when
      const response = await userController.getUserAuthenticationMethods(request, hFake, {
        authenticationMethodsSerializer,
      });

      // then
      expect(response).to.deep.equal(responseSerialized);
    });
  });

  describe('#rememberUserHasSeenLastDataProtectionPolicyInformation', function () {
    it('remembers user has seen last data protection policy information', async function () {
      // given
      sinon.stub(usecases, 'rememberUserHasSeenLastDataProtectionPolicyInformation');
      usecases.rememberUserHasSeenLastDataProtectionPolicyInformation.resolves({});
      const userSerializer = { serialize: sinon.stub() };
      userSerializer.serialize.withArgs({}).returns('ok');

      // when
      await userController.rememberUserHasSeenLastDataProtectionPolicyInformation(
        {
          auth: { credentials: { userId: 1 } },
          params: { id: 1 },
        },
        hFake,
        { userSerializer },
      );

      // then
      sinon.assert.calledWith(usecases.rememberUserHasSeenLastDataProtectionPolicyInformation, { userId: 1 });
    });
  });

  describe('#save', function () {
    const email = 'to-be-free@ozone.airplane';
    const password = 'Password123';

    const deserializedUser = new User();
    const savedUser = new User({ email });
    let dependencies;

    beforeEach(function () {
      userSerializer.deserialize.returns(deserializedUser);

      const cryptoService = {
        hashPassword: sinon.stub(),
      };
      const localeService = {
        getCanonicalLocale: sinon.stub(),
      };

      dependencies = {
        userSerializer,
        cryptoService,
        localeService,
        requestResponseUtils,
      };

      sinon.stub(usecases, 'createUser').returns(savedUser);
    });

    describe('when request is valid', function () {
      describe('when there is no locale cookie', function () {
        it('returns a serialized user and a 201 status code', async function () {
          // given
          const expectedSerializedUser = { message: 'serialized user' };
          userSerializer.serialize.returns(expectedSerializedUser);

          // when
          const response = await userController.createUser(
            {
              payload: {
                data: {
                  attributes: {
                    'first-name': 'John',
                    'last-name': 'DoDoe',
                    email: 'john.dodoe@example.net',
                    cgu: true,
                    password,
                  },
                },
              },
            },
            hFake,
            dependencies,
          );

          // then
          expect(dependencies.userSerializer.serialize).to.have.been.calledWithExactly(savedUser);
          expect(dependencies.localeService.getCanonicalLocale).to.not.have.been.called;
          expect(response.source).to.deep.equal(expectedSerializedUser);
          expect(response.statusCode).to.equal(201);
        });
      });

      describe('when there is a locale cookie', function () {
        it('returns a serialized user with "locale" attribute and a 201 status code', async function () {
          // given
          const localeFromHeader = 'fr-fr';
          const locale = 'fr-FR';
          const expectedSerializedUser = { message: 'serialized user', locale };
          const savedUser = new User({ email, locale });

          const useCaseParameters = {
            user: { ...deserializedUser, locale },
            password,
            locale: localeFromHeader,
            redirectionUrl: null,
            i18n: undefined,
          };

          dependencies.localeService.getCanonicalLocale.returns(locale);
          dependencies.userSerializer.serialize.returns(expectedSerializedUser);
          usecases.createUser.resolves(savedUser);

          // when
          const response = await userController.createUser(
            {
              payload: {
                data: {
                  attributes: {
                    'first-name': 'John',
                    'last-name': 'DoDoe',
                    email: 'john.dodoe@example.net',
                    cgu: true,
                    password,
                  },
                },
              },
              state: {
                locale,
              },
            },
            hFake,
            dependencies,
          );

          // then
          expect(usecases.createUser).to.have.been.calledWithExactly(useCaseParameters);
          expect(dependencies.localeService.getCanonicalLocale).to.have.been.calledWithExactly(locale);
          expect(dependencies.userSerializer.serialize).to.have.been.calledWithExactly(savedUser);
          expect(response.statusCode).to.equal(201);
        });
      });
    });
  });

  describe('#upgradeToRealUser', function () {
    const email = 'john.doe@example.net';
    const firstName = 'John';
    const lastName = 'Doe';
    const password = 'P@ssW0rd';
    const anonymousUserToken = 'anonymous-token';
    const language = 'fr';
    const locale = 'fr-FR';
    const userId = 1;

    const realUser = new User({ id: userId, email, firstName, lastName, locale });
    const expectedSerializedUser = { message: 'serialized user' };

    let dependencies;

    beforeEach(function () {
      sinon.stub(usecases, 'upgradeToRealUser').resolves(realUser);

      const userSerializer = {
        serialize: sinon.stub().returns(expectedSerializedUser),
      };

      const requestResponseUtils = {
        extractLocaleFromRequest: sinon.stub().returns(language),
      };

      const localeService = {
        getCanonicalLocale: sinon.stub().returns(locale),
      };

      dependencies = { userSerializer, requestResponseUtils, localeService };
    });

    afterEach(function () {
      sinon.restore();
    });

    it('calls usecase and serializes upgraded user ', async function () {
      // when
      const response = await userController.upgradeToRealUser(
        {
          auth: { credentials: { userId } },
          state: { locale },
          payload: {
            data: {
              attributes: {
                'first-name': firstName,
                'last-name': lastName,
                email,
                password,
                cgu: true,
                'anonymous-user-token': anonymousUserToken,
              },
            },
          },
        },
        hFake,
        dependencies,
      );

      // then
      expect(dependencies.localeService.getCanonicalLocale).to.have.been.calledWithExactly(locale);
      expect(dependencies.requestResponseUtils.extractLocaleFromRequest).to.have.been.called;
      expect(usecases.upgradeToRealUser).to.have.been.calledWithExactly({
        userId,
        userAttributes: {
          firstName,
          lastName,
          email,
          locale,
          cgu: true,
        },
        password,
        anonymousUserToken,
        language,
      });
      expect(dependencies.userSerializer.serialize).to.have.been.calledWithExactly(realUser);
      expect(response.source).to.deep.equal(expectedSerializedUser);
    });
  });

  describe('#sendVerificationCode', function () {
    it('calls the usecase to send verification code with code, email and locale', async function () {
      // given
      sinon.stub(usecases, 'sendVerificationCode');
      usecases.sendVerificationCode.resolves();
      const i18n = getI18n();
      const userId = 1;
      const locale = 'fr';
      const newEmail = 'user@example.net';
      const password = 'Password123';

      const request = {
        headers: { 'accept-language': locale },
        i18n,
        auth: {
          credentials: {
            userId,
          },
        },
        params: {
          id: userId,
        },
        payload: {
          data: {
            type: 'users',
            attributes: {
              newEmail,
              password,
            },
          },
        },
      };

      // when
      await userController.sendVerificationCode(request, hFake);

      // then
      expect(usecases.sendVerificationCode).to.have.been.calledWithExactly({
        i18n,
        locale,
        newEmail,
        password,
        userId,
      });
    });
  });

  describe('#updatePassword', function () {
    const userId = 7;
    const userPassword = 'Pix2017!';
    const userTemporaryKey = 'good-temporary-key';
    const payload = {
      data: {
        attributes: {
          password: userPassword,
        },
      },
    };
    const request = {
      params: {
        id: userId,
      },
      query: {
        'temporary-key': userTemporaryKey,
      },
      payload,
    };

    beforeEach(function () {
      sinon.stub(usecases, 'updateUserPassword');
    });

    it('updates password', async function () {
      // given
      usecases.updateUserPassword
        .withArgs({
          userId,
          password: userPassword,
          temporaryKey: userTemporaryKey,
        })
        .resolves({});

      // when
      const response = await userController.updatePassword(request, hFake);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('#updateUserEmailWithValidation', function () {
    it('calls the usecase to update user email', async function () {
      // given
      const userId = 1;
      const updatedEmail = 'new-email@example.net';
      const code = '999999';

      const responseSerialized = Symbol('an response serialized');
      sinon.stub(usecases, 'updateUserEmailWithValidation');
      usecases.updateUserEmailWithValidation.withArgs({ code, userId }).resolves(updatedEmail);
      const updateEmailSerializer = { serialize: sinon.stub() };
      updateEmailSerializer.serialize.withArgs(updatedEmail).returns(responseSerialized);

      const request = {
        auth: {
          credentials: {
            userId,
          },
        },
        params: {
          id: userId,
        },
        payload: {
          data: {
            type: 'users',
            attributes: {
              code,
            },
          },
        },
      };

      // when
      const response = await userController.updateUserEmailWithValidation(request, hFake, { updateEmailSerializer });

      // then
      expect(usecases.updateUserEmailWithValidation).to.have.been.calledWithExactly({
        code,
        userId,
      });
      expect(response).to.deep.equal(responseSerialized);
    });
  });

  describe('#validateUserAccountEmail', function () {
    const request = {
      query: {
        token: 'XXX-XXX-XXX',
        redirect_url: 'https://it.is.redirecting.com',
      },
    };

    beforeEach(function () {
      sinon.stub(usecases, 'validateUserAccountEmail');
    });

    it('validates the email and redirect to the given URI', async function () {
      // given
      usecases.validateUserAccountEmail.resolves(request.query.redirect_url);

      // when
      const response = await userController.validateUserAccountEmail(request, hFake);

      // then
      expect(usecases.validateUserAccountEmail).to.have.been.calledWith({
        token: 'XXX-XXX-XXX',
        redirectUrl: 'https://it.is.redirecting.com',
      });
      expect(response.statusCode).to.equal(302);
      expect(response.headers['location']).to.have.string('https://it.is.redirecting.com');
    });
  });

  describe('#getCertificationPointOfContact', function () {
    beforeEach(function () {
      sinon.stub(usecases, 'getCertificationPointOfContact');
    });

    it('returns a serialized CertificationPointOfContact', async function () {
      // given
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
        id: 123,
        name: 'Sunnydale Center',
        externalId: 'BUFFY_SLAYER',
        type: 'PRO',
        isRelatedToManagingStudentsOrganization: false,
        relatedOrganizationTags: [],
      });

      const certificationCenterMemberships = [
        {
          id: '1231',
          certificationCenterId: 123,
          userId: 789,
          role: 'MEMBER',
        },
      ];

      const certificationPointOfContact = domainBuilder.buildCertificationPointOfContact({
        id: 789,
        firstName: 'Buffy',
        lastName: 'Summers',
        email: 'buffy.summers@example.net',
        pixCertifTermsOfServiceAccepted: true,
        allowedCertificationCenterAccesses: [allowedCertificationCenterAccess],
        certificationCenterMemberships,
      });

      const request = {
        auth: {
          credentials: { userId: 123 },
        },
      };

      usecases.getCertificationPointOfContact.withArgs({ userId: 123 }).resolves(certificationPointOfContact);

      // when
      const response = await userController.getCertificationPointOfContact(request, hFake);

      // then
      expect(response).to.deep.equal({
        data: {
          id: '789',
          type: 'certification-point-of-contact',
          attributes: {
            'first-name': 'Buffy',
            'last-name': 'Summers',
            email: 'buffy.summers@example.net',
            lang: 'fr',
            'pix-certif-terms-of-service-accepted': true,
          },
          relationships: {
            'allowed-certification-center-accesses': {
              data: [
                {
                  id: '123',
                  type: 'allowed-certification-center-access',
                },
              ],
            },
            'certification-center-memberships': {
              data: [
                {
                  id: '1231',
                  type: 'certification-center-membership',
                },
              ],
            },
          },
        },
        included: [
          {
            id: '123',
            type: 'allowed-certification-center-access',
            attributes: {
              name: 'Sunnydale Center',
              'external-id': 'BUFFY_SLAYER',
              type: 'PRO',
              'is-access-blocked-college': false,
              'is-access-blocked-lycee': false,
              'is-access-blocked-aefe': false,
              'is-access-blocked-agri': false,
              'is-related-to-managing-students-organization': false,
              'pix-certif-sco-blocked-access-date-college': null,
              'pix-certif-sco-blocked-access-date-lycee': null,
              'related-organization-tags': [],
              habilitations: [],
            },
          },
          {
            id: '1231',
            type: 'certification-center-membership',
            attributes: {
              'certification-center-id': 123,
              'user-id': 789,
              role: 'MEMBER',
            },
          },
        ],
      });
    });
  });

  describe('#rememberUserHasSeenChallengeTooltip', function () {
    let request;
    const userId = 1;
    let challengeType;

    beforeEach(function () {
      sinon.stub(usecases, 'rememberUserHasSeenChallengeTooltip');
    });

    it('remembers user has seen focused challenge tooltip', async function () {
      // given
      challengeType = 'focused';
      request = {
        auth: { credentials: { userId } },
        params: { id: userId, challengeType },
      };

      usecases.rememberUserHasSeenChallengeTooltip.withArgs({ userId, challengeType }).resolves({});
      userSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await userController.rememberUserHasSeenChallengeTooltip(request, hFake, { userSerializer });

      // then
      expect(response).to.be.equal('ok');
    });

    it('remembers user has seen other challenges tooltip', async function () {
      // given
      challengeType = 'other';
      request = {
        auth: { credentials: { userId } },
        params: { id: userId, challengeType },
      };

      usecases.rememberUserHasSeenChallengeTooltip.withArgs({ userId, challengeType }).resolves({});
      userSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await userController.rememberUserHasSeenChallengeTooltip(request, hFake, { userSerializer });

      // then
      expect(response).to.be.equal('ok');
    });
  });
});

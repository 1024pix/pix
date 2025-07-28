import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../src/identity-access-management/domain/constants/identity-providers.js';
import {
  MissingOrInvalidCredentialsError,
  PixAdminLoginFromPasswordDisabledError,
  UserShouldChangePasswordError,
} from '../../../../../src/identity-access-management/domain/errors.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { RequestedApplication } from '../../../../../src/identity-access-management/infrastructure/utils/network.js';
import { config } from '../../../../../src/shared/config.js';
import { ForbiddenAccess } from '../../../../../src/shared/domain/errors.js';
import { databaseBuilder, expect, knex, sinon } from '../../../../test-helper.js';

describe('Integration | Identity Access Management | Domain | UseCase | authenticate-user', function () {
  beforeEach(function () {
    config.authentication.permitPixAdminLoginFromPassword = true;
  });

  context('when authentication succeeds', function () {
    let clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now: new Date('2001-01-01'), toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('returns a valid JWT Access Token', async function () {
      // given
      const email = 'user_exists@example.net';
      const password = 'some password';
      databaseBuilder.factory.buildUser.withRawPassword({ email, rawPassword: password });
      await databaseBuilder.commit();

      const audience = 'https://app.pix.fr';
      const requestedApplication = RequestedApplication.fromOrigin(audience);

      // when
      const result = await usecases.authenticateUser({ username: email, password, requestedApplication, audience });

      // then
      expect(result).to.be.an.instanceOf(Object);
      expect(result).to.have.all.keys('accessToken', 'refreshToken', 'expirationDelaySeconds');
      expect(result.accessToken).to.be.a.string;
      expect(result.refreshToken).to.be.a.string;
      expect(result.expirationDelaySeconds).to.be.a('number');
    });

    it('saves the last dates of login', async function () {
      // given
      const email = 'user_will_have_last_date_of_login@example.net';
      const password = 'some password';
      const userId = databaseBuilder.factory.buildUser.withRawPassword({ email, rawPassword: password }).id;
      await databaseBuilder.commit();

      const audience = 'https://app.pix.fr';
      const requestedApplication = RequestedApplication.fromOrigin(audience);

      // when
      await usecases.authenticateUser({ username: email, password, requestedApplication, audience });

      // then
      const userLogin = await knex('user-logins').where({ userId }).first();
      expect(userLogin).to.exist;
      expect(userLogin.lastLoggedAt).to.deep.equal(new Date('2001-01-01'));

      const authenticationMethod = await knex('authentication-methods')
        .where({ userId, identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code })
        .first();
      expect(authenticationMethod).to.exist;
      expect(authenticationMethod.lastLoggedAt).to.deep.equal(new Date('2001-01-01'));

      const lastUserApplicationConnection = await knex('last-user-application-connections')
        .where({ userId, application: requestedApplication.applicationName })
        .first();
      expect(lastUserApplicationConnection).to.exist;
      expect(lastUserApplicationConnection.lastLoggedAt).to.deep.equal(new Date('2001-01-01'));
    });

    context('when user should change password', function () {
      it('throws UserShouldChangePasswordError', async function () {
        // given
        const email = 'user_should_change_password@example.net';
        const password = 'some password';
        databaseBuilder.factory.buildUser.withRawPassword({ email, rawPassword: password, shouldChangePassword: true });
        await databaseBuilder.commit();

        const audience = 'https://app.pix.fr';
        const requestedApplication = RequestedApplication.fromOrigin(audience);

        // when & then
        await expect(
          usecases.authenticateUser({ username: email, password, requestedApplication, audience }),
        ).to.be.rejectedWith(UserShouldChangePasswordError);
      });
    });

    describe('user locale', function () {
      context('when user has a locale', function () {
        it('does not update the user locale', async function () {
          // given
          const email = 'user_with_a_locale@example.net';
          const password = 'some password';
          const initialLocale = 'fr-BE';
          const userId = databaseBuilder.factory.buildUser.withRawPassword({
            email,
            rawPassword: password,
            locale: initialLocale,
          }).id;
          await databaseBuilder.commit();

          const locale = 'nl-BE';
          const audience = 'https://app.pix.fr';
          const requestedApplication = RequestedApplication.fromOrigin(audience);

          // when
          await usecases.authenticateUser({
            username: email,
            password,
            locale,
            requestedApplication,
            audience,
          });

          // then
          const user = await knex('users').where({ id: userId }).first();
          expect(user.locale).to.equal(initialLocale);
        });
      });

      context('when user does not have a locale', function () {
        context('when there is a locale cookie ', function () {
          it('updates the user locale with the formatted value', async function () {
            // given
            const email = 'user_with_no_locale@example.net';
            const password = 'some password';
            const userId = databaseBuilder.factory.buildUser.withRawPassword({ email, rawPassword: password }).id;
            await databaseBuilder.commit();

            const locale = 'nl-BE';
            const audience = 'https://app.pix.fr';
            const requestedApplication = RequestedApplication.fromOrigin(audience);

            // when
            await usecases.authenticateUser({
              username: email,
              password,
              locale,
              requestedApplication,
              audience,
            });

            // then
            const user = await knex('users').where({ id: userId }).first();
            expect(user.locale).to.equal('nl-BE');
          });
        });

        context('when there is no locale cookie', function () {
          it('does not update the user locale', async function () {
            // given
            const email = 'user_with_no_locale@example.net';
            const password = 'some password';
            const userId = databaseBuilder.factory.buildUser.withRawPassword({ email, rawPassword: password }).id;
            await databaseBuilder.commit();

            const audience = 'https://app.pix.fr';
            const requestedApplication = RequestedApplication.fromOrigin(audience);

            // when
            await usecases.authenticateUser({ username: email, password, requestedApplication, audience });

            // then
            const user = await knex('users').where({ id: userId }).first();
            expect(user.locale).to.be.null;
          });
        });
      });
    });

    describe('connection warning email', function () {
      context('when user has connected beyond the connection warning period', function () {
        context('when user has an email', function () {
          it('sends a connection warning email', async function () {
            // given
            const email = 'user_last_connection_too_far@example.net';
            const password = 'some password';
            const userId = databaseBuilder.factory.buildUser.withRawPassword({ email, rawPassword: password }).id;
            databaseBuilder.factory.buildUserLogin({ userId, lastLoggedAt: new Date('1991-01-01') });
            await databaseBuilder.commit();

            const audience = 'https://app.pix.fr';
            const requestedApplication = RequestedApplication.fromOrigin(audience);

            // when
            await usecases.authenticateUser({ username: email, password, requestedApplication, audience });

            // then
            await expect('SendEmailJob').to.have.been.performed.withJobsCount(1);
          });
        });

        context('when user has no email', function () {
          it('does not send a connection warning email', async function () {
            // given
            const email = null;
            const username = 'user_last_connection_too_far';
            const password = 'some password';
            const userId = databaseBuilder.factory.buildUser.withRawPassword({
              email,
              username,
              rawPassword: password,
            }).id;
            databaseBuilder.factory.buildUserLogin({ userId, lastLoggedAt: new Date('1991-01-01') });
            await databaseBuilder.commit();

            const audience = 'https://app.pix.fr';
            const requestedApplication = RequestedApplication.fromOrigin(audience);

            // when
            await usecases.authenticateUser({ username, password, requestedApplication, audience });

            // then
            await expect('SendEmailJob').to.have.been.performed.withJobsCount(0);
          });
        });
      });

      context('when user has connected within the connection warning period', function () {
        it('does not send a connection warning email', async function () {
          // given
          const email = 'user_last_connection_recent@example.net';
          const password = 'some password';
          const userId = databaseBuilder.factory.buildUser.withRawPassword({ email, rawPassword: password }).id;
          databaseBuilder.factory.buildUserLogin({ userId, lastLoggedAt: new Date() });
          await databaseBuilder.commit();

          const audience = 'https://app.pix.fr';
          const requestedApplication = RequestedApplication.fromOrigin(audience);

          // when
          await usecases.authenticateUser({ username: email, password, requestedApplication, audience });

          // then
          await expect('SendEmailJob').to.have.been.performed.withJobsCount(0);
        });
      });
    });
  });

  describe('error cases', function () {
    context('when given username/email does not exist', function () {
      it('throws a MissingOrInvalidCredentialsError', async function () {
        // given
        const unknownUserEmail = 'unknown_user_email@example.net';
        const password = 'some password';
        const audience = 'https://app.pix.fr';

        // when & then
        await expect(usecases.authenticateUser({ username: unknownUserEmail, password, audience })).to.be.rejectedWith(
          MissingOrInvalidCredentialsError,
        );
      });
    });

    context('when given password does not match', function () {
      it('throws a MissingOrInvalidCredentialsError', async function () {
        // given
        const email = 'user_exists@example.net';
        const password = 'some password';
        databaseBuilder.factory.buildUser.withRawPassword({ email, rawPassword: password });
        await databaseBuilder.commit();

        const wrongPassword = 'a wrong password';
        const audience = 'https://app.pix.fr';

        // when & then
        await expect(
          usecases.authenticateUser({ username: email, password: wrongPassword, audience }),
        ).to.be.rejectedWith(MissingOrInvalidCredentialsError);
      });
    });

    context('when authentication from pix admin is disabled', function () {
      beforeEach(function () {
        config.authentication.permitPixAdminLoginFromPassword = false;
      });

      it('throws a PixAdmiLoginFromPasswordDisabledError', async function () {
        // given
        const email = 'user_exists@example.net';
        const password = 'some password';
        databaseBuilder.factory.buildUser.withRawPassword({ email, rawPassword: password });
        await databaseBuilder.commit();

        const audience = 'https://admin.pix.fr';
        const requestedApplication = RequestedApplication.fromOrigin(audience);

        // when & then
        await expect(
          usecases.authenticateUser({ username: email, password, requestedApplication, audience }),
        ).to.be.rejectedWith(PixAdminLoginFromPasswordDisabledError);
      });
    });

    describe('user access to applications', function () {
      context('when requestedApplication is Pix Orga', function () {
        context('when user is not linked to any organization', function () {
          it('throws a ForbiddenAccess', async function () {
            // given
            const email = 'user_wants_to_go_to_orga@example.net';
            const password = 'some password';
            databaseBuilder.factory.buildUser.withRawPassword({ email, rawPassword: password });
            await databaseBuilder.commit();

            const audience = 'https://orga.pix.fr';
            const requestedApplication = RequestedApplication.fromOrigin(audience);

            // when & then
            await expect(
              usecases.authenticateUser({ username: email, password, requestedApplication, audience }),
            ).to.be.rejectedWith(ForbiddenAccess);
          });
        });
      });

      context('when requestedApplication is Pix Admin', function () {
        context('when user has no admin member role', function () {
          it('throws a ForbiddenAccess', async function () {
            // given
            const email = 'user_wants_to_go_to_admin@example.net';
            const password = 'some password';
            databaseBuilder.factory.buildUser.withRawPassword({ email, rawPassword: password });
            await databaseBuilder.commit();

            const audience = 'https://admin.pix.fr';
            const requestedApplication = RequestedApplication.fromOrigin(audience);

            // when & then
            await expect(
              usecases.authenticateUser({ username: email, password, requestedApplication, audience }),
            ).to.be.rejectedWith(ForbiddenAccess);
          });
        });

        context('when user has an admin member role', function () {
          context('when user admin member role is disabled', function () {
            it('throws a ForbiddenAccess', async function () {
              // given
              const email = 'user_is_admin_member_but_disabled@example.net';
              const password = 'some password';
              databaseBuilder.factory.buildUser.withRole({ email, rawPassword: password, disabledAt: new Date() });
              await databaseBuilder.commit();

              const audience = 'https://admin.pix.fr';
              const requestedApplication = RequestedApplication.fromOrigin(audience);

              // when & then
              await expect(
                usecases.authenticateUser({ username: email, password, requestedApplication, audience }),
              ).to.be.rejectedWith(ForbiddenAccess);
            });
          });
        });
      });
    });
  });
});

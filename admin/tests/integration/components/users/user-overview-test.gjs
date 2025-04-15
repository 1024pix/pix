import { clickByName, render, waitFor } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { triggerEvent } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import UserOverview from 'pix-admin/components/users/user-overview';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | users | user-overview', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when the admin member has access to users actions scope', function (hooks) {
    class AccessControlStub extends Service {
      hasAccessToUsersActionsScope = true;
    }

    hooks.beforeEach(function () {
      this.owner.register('service:access-control', AccessControlStub);
    });

    module('when the admin looks at user details', function () {
      module('when the user is anonymised', function () {
        module('when the user has self deleted his account', function () {
          test('displays the dedicated deletion message', async function (assert) {
            // given

            const store = this.owner.lookup('service:store');
            const user = store.createRecord('user', {
              id: '123',
              firstName: '(anonymised)',
              lastName: '(anonymised)',
              email: null,
              username: null,
              hasBeenAnonymised: true,
              hasBeenAnonymisedBy: 123,
              anonymisedByFullName: '(anonymised) (anonymised)',
            });

            // when
            const screen = await render(<template><UserOverview @user={{user}} /></template>);

            // then
            assert
              .dom(screen.getByText(t('pages.user-details.overview.anonymisation.self-anonymisation-message')))
              .exists();
          });
        });

        module("when the user's account has been deleted by an admin member", function () {
          test("displays the deletion message with the admin member's full name", async function (assert) {
            // given
            const store = this.owner.lookup('service:store');
            const fullName = 'Laurent Bobine';
            const user = store.createRecord('user', {
              id: '123',
              firstName: '(anonymised)',
              lastName: '(anonymised)',
              email: null,
              username: null,
              hasBeenAnonymised: true,
              hasBeenAnonymisedBy: 456,
              anonymisedByFullName: fullName,
            });

            // when
            const screen = await render(<template><UserOverview @user={{user}} /></template>);

            // then

            assert
              .dom(
                screen.getByText(
                  t('pages.user-details.overview.anonymisation.user-anonymised-by-admin-message', { fullName }),
                ),
              )
              .exists();
          });
        });
      });

      test('displays the update button', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const user = {
          firstName: 'John',
          lastName: 'Harry',
          email: 'john.harry@example.net',
          username: 'john.harry0102',
        };
        user.authenticationMethods = [await store.createRecord('authentication-method', { identityProvider: 'abc' })];

        // when
        const screen = await render(<template><UserOverview @user={{user}} /></template>);

        // then
        assert.dom(screen.getByRole('button', { name: 'Modifier' })).exists();
      });

      test('displays user’s information', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const user = store.createRecord('user', {
          firstName: 'John',
          lastName: 'Snow',
          email: 'john.snow@winterfell.got',
          username: 'kingofthenorth',
          lang: 'fr',
          locale: 'fr-FR',
          createdAt: new Date('2021-12-10'),
          lastLoggedAt: new Date('2023-12-10'),
        });

        // when
        const screen = await render(<template><UserOverview @user={{user}} /></template>);
        // then
        assert.dom(screen.getByText(`Prénom : ${user.firstName}`)).exists();
        assert.dom(screen.getByText(`Nom : ${user.lastName}`)).exists();
        assert.dom(screen.getByText(`Adresse e-mail : ${user.email}`)).exists();
        assert.dom(screen.getByText(`Identifiant : ${user.username}`)).exists();
        assert.dom(screen.getByText('Langue : fr')).exists();
        assert.dom(screen.getByText('Locale : fr-FR')).exists();
        assert.dom(screen.getByText('Date de création : 10/12/2021')).exists();
      });

      [
        { locale: 'en', lang: 'en' },
        { locale: 'fr', lang: 'fr' },
        { locale: 'fr-BE', lang: 'fr' },
        { locale: 'fr-FR', lang: 'fr' },
        { locale: 'nl-BE', lang: 'nl' },
      ].forEach((expected) => {
        test("displays user's information without creation date", async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const user = store.createRecord('user', {
            firstName: 'John',
            lastName: 'Snow',
            email: 'john.snow@winterfell.got',
            username: 'kingofthenorth',
            lang: expected.lang,
            locale: expected.locale,
          });

          // when
          const screen = await render(<template><UserOverview @user={{user}} /></template>);

          // then
          assert.dom(screen.getByText(`Prénom : ${user.firstName}`)).exists();
          assert.dom(screen.getByText(`Nom : ${user.lastName}`)).exists();
          assert.dom(screen.getByText(`Adresse e-mail : ${user.email}`)).exists();
          assert.dom(screen.getByText(`Identifiant : ${user.username}`)).exists();
          assert.dom(screen.getByText(`Langue : ${expected.lang}`)).exists();
          assert.dom(screen.getByText(`Locale : ${expected.locale}`)).exists();
          assert.dom(screen.getByText('Date de création :')).exists();
        });
      });

      module('copy feature', function () {
        module('when information is provided', function () {
          test('displays copy button after the user e-mail', async function (assert) {
            // given
            const email = 'pat.ate@example.net';
            const store = this.owner.lookup('service:store');
            const user = store.createRecord('user', {
              firstName: 'Pat',
              lastName: 'Ate',
              email,
              lang: 'fr',
              locale: 'fr-FR',
              createdAt: new Date('2021-12-10'),
            });

            // when
            const screen = await render(<template><UserOverview @user={{user}} /></template>);

            // then
            assert.ok(
              screen
                .getByRole('button', {
                  name: t('components.users.user-detail-personal-information.actions.copy-email'),
                })
                .hasAttribute('data-clipboard-text', email),
            );
          });

          test('displays tooltip on copy user e-mail button hover', async function (assert) {
            // given
            const email = 'pat.ate@example.net';
            const store = this.owner.lookup('service:store');
            const user = store.createRecord('user', {
              firstName: 'Pat',
              lastName: 'Ate',
              email,
              lang: 'fr',
              locale: 'fr-FR',
              createdAt: new Date('2021-12-10'),
            });

            // when
            const screen = await render(<template><UserOverview @user={{user}} /></template>);
            const copyButton = await screen.getByRole('button', {
              name: t('components.users.user-detail-personal-information.actions.copy-email'),
            });
            await triggerEvent(copyButton, 'mouseenter');

            // then
            assert
              .dom(screen.getByText(t('components.users.user-detail-personal-information.actions.copy-email')))
              .exists();
          });

          test('displays copy button after the user ID', async function (assert) {
            // given
            const username = 'mouss.tique';
            const store = this.owner.lookup('service:store');
            const user = store.createRecord('user', {
              firstName: 'Mouss',
              lastName: 'Tique',
              username,
              lang: 'fr',
              locale: 'fr-FR',
              createdAt: new Date('2021-12-10'),
            });

            // when
            const screen = await render(<template><UserOverview @user={{user}} /></template>);

            // then
            assert.ok(
              screen
                .getByRole('button', {
                  name: t('components.users.user-detail-personal-information.actions.copy-username'),
                })
                .hasAttribute('data-clipboard-text', username),
            );
          });

          test('displays tooltip on copy username button hover', async function (assert) {
            // given
            const username = 'mouss.tique';
            const store = this.owner.lookup('service:store');
            const user = store.createRecord('user', {
              firstName: 'Mouss',
              lastName: 'Tique',
              username,
              lang: 'fr',
              locale: 'fr-FR',
              createdAt: new Date('2021-12-10'),
            });

            // when
            const screen = await render(<template><UserOverview @user={{user}} /></template>);
            const copyButton = await screen.getByRole('button', {
              name: t('components.users.user-detail-personal-information.actions.copy-username'),
            });
            await triggerEvent(copyButton, 'mouseenter');

            // then
            assert
              .dom(screen.getByText(t('components.users.user-detail-personal-information.actions.copy-username')))
              .exists();
          });
        });

        module('when information is not provided', function () {
          test('does not display copy button after the user e-mail', async function (assert) {
            // given
            const store = this.owner.lookup('service:store');
            const user = store.createRecord('user', {
              firstName: 'Pat',
              lastName: 'Ate',
              username: 'pat.ate',
              lang: 'fr',
              locale: 'fr-FR',
              createdAt: new Date('2021-12-10'),
            });

            // when
            const screen = await render(<template><UserOverview @user={{user}} /></template>);

            // then
            assert
              .dom(
                screen.queryByRole('button', {
                  name: t('components.users.user-detail-personal-information.actions.copy-email'),
                }),
              )
              .doesNotExist();
          });

          test('does not display copy button after the user ID', async function (assert) {
            // given
            const store = this.owner.lookup('service:store');
            const user = store.createRecord('user', {
              firstName: 'Mouss',
              lastName: 'Tique',
              email: 'mouss.tique@example.net',
              lang: 'fr',
              locale: 'fr-FR',
              createdAt: new Date('2021-12-10'),
            });

            // when
            const screen = await render(<template><UserOverview @user={{user}} /></template>);

            // then
            assert
              .dom(
                screen.queryByRole('button', {
                  name: t('components.users.user-detail-personal-information.actions.copy-username'),
                }),
              )
              .doesNotExist();
          });
        });
      });

      module('login information', function (hooks) {
        let clock;
        const now = new Date('2022-11-28T12:00:00Z');

        hooks.beforeEach(function () {
          clock = sinon.useFakeTimers({ now });
        });

        hooks.afterEach(function () {
          clock.restore();
        });

        test('displays failure count if user is not blocked', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const userLogin = store.createRecord('user-login', {
            blockedAt: null,
            temporaryBlockedUntil: null,
            failureCount: 0,
          });
          const user = store.createRecord('user', { userLogin });

          // when
          const screen = await render(<template><UserOverview @user={{user}} /></template>);

          // then
          assert.dom(screen.queryByText('Utilisateur totalement bloqué le :')).doesNotExist();
          assert.dom(screen.queryByText("Utilisateur temporairement bloqué jusqu'au :")).doesNotExist();
          assert.dom(screen.getByText('Nombre de tentatives de connexion en erreur : 0')).exists();
        });

        test('displays dates when user is temporarily blocked', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const userLogin = store.createRecord('user-login', {
            blockedAt: null,
            temporaryBlockedUntil: new Date('2022-12-10T16:00:00Z'),
            failureCount: 50,
          });
          const user = store.createRecord('user', { userLogin });

          // when
          const screen = await render(<template><UserOverview @user={{user}} /></template>);

          // then
          assert.dom(screen.getByText('Nombre de tentatives de connexion en erreur : 50')).exists();
          assert
            .dom(screen.getByText("Utilisateur temporairement bloqué jusqu'au : 10/12/2022", { exact: false }))
            .exists();
          assert.dom(screen.queryByText('Utilisateur totalement bloqué le :')).doesNotExist();
        });

        test('displays dates when user is blocked', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const userLogin = store.createRecord('user-login', {
            blockedAt: new Date('2021-02-01T03:00:00Z'),
            temporaryBlockedUntil: null,
            failureCount: 50,
          });
          const user = store.createRecord('user', { userLogin });

          // when
          const screen = await render(<template><UserOverview @user={{user}} /></template>);

          // then
          assert.dom(screen.getByText('Nombre de tentatives de connexion en erreur : 50')).exists();
          assert.dom(screen.getByText('Utilisateur totalement bloqué le : 01/02/2021', { exact: false })).exists();
          assert.dom(screen.queryByText("Utilisateur temporairement bloqué jusqu'au :")).doesNotExist();
        });

        module('displays last global connection', function () {
          test(`displays user's last login date when he has one`, async function (assert) {
            // given
            const store = this.owner.lookup('service:store');

            const user = store.createRecord('user', { lastLoggedAt: new Date('2022-11-28T10:00:00Z') });

            // when
            const screen = await render(<template><UserOverview @user={{user}} /></template>);

            // then
            const globalLastLogin = t('components.users.user-overview.global-last-login');

            assert.dom(screen.getByText(`${globalLastLogin} 28/11/2022`)).exists();
          });

          test('displays default last login date when user has no last login date', async function (assert) {
            // given
            const store = this.owner.lookup('service:store');

            const user = store.createRecord('user', {
              firstName: 'John',
              lastName: 'Snow',
              email: 'john.snow@winterfell.got',
              username: 'kingofthenorth',
              lang: 'fr',
              locale: 'fr-FR',
              createdAt: new Date('2021-12-10'),
            });

            // when
            const screen = await render(<template><UserOverview @user={{user}} /></template>);

            // then
            const globalLastLogin = t('components.users.user-overview.global-last-login');
            const lastLoginDefaultDate = t('components.users.user-overview.no-last-connection-date-info');

            assert.dom(screen.getByText(`Prénom : ${user.firstName}`)).exists();
            assert.dom(screen.getByText(`Nom : ${user.lastName}`)).exists();
            assert.dom(screen.getByText(`Adresse e-mail : ${user.email}`)).exists();
            assert.dom(screen.getByText(`Identifiant : ${user.username}`)).exists();
            assert.dom(screen.getByText('Langue : fr')).exists();
            assert.dom(screen.getByText('Locale : fr-FR')).exists();
            assert.dom(screen.getByText('Date de création : 10/12/2021')).exists();
            assert.dom(screen.queryByText(`${globalLastLogin} ${lastLoginDefaultDate}`)).exists();
          });
        });
      });
    });

    module('When the admin member click to update user details', function () {
      test('displays the edit and cancel buttons', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const user = {
          firstName: 'John',
          lastName: 'Harry',
          email: 'john.harry@example.net',
          username: null,
          lang: null,
        };
        user.authenticationMethods = [await store.createRecord('authentication-method', { identityProvider: 'abc' })];

        // when
        const screen = await render(<template><UserOverview @user={{user}} /></template>);
        await clickByName('Modifier');

        // then
        assert.dom(screen.getByRole('button', { name: 'Modifier' })).exists();
        assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
      });

      test('displays user’s first name and last name with available languages and locales in edit mode', async function (assert) {
        // given
        const user = EmberObject.create({
          lastName: 'Harry',
          firstName: 'John',
          email: 'john.harry@gmail.com',
          username: null,
          authenticationMethods: [],
        });

        // when
        const screen = await render(<template><UserOverview @user={{user}} /></template>);
        await clickByName('Modifier');

        // then
        assert.dom(screen.getByRole('textbox', { name: 'Prénom *' })).hasValue(user.firstName);
        assert.dom(screen.getByRole('textbox', { name: 'Nom *' })).hasValue(user.lastName);

        await clickByName('Langue');
        await screen.findByRole('listbox');
        assert.dom(screen.getByRole('option', { name: 'Français' })).exists();
        assert.dom(screen.getByRole('option', { name: 'Anglais' })).exists();
        assert.dom(screen.getByRole('option', { name: 'Néerlandais' })).exists();

        await clickByName('Locale');
        await waitFor(async () => {
          await screen.findByRole('listbox');
          assert.dom(screen.getByRole('option', { name: 'en' })).exists();
          assert.dom(screen.getByRole('option', { name: 'fr' })).exists();
          assert.dom(screen.getByRole('option', { name: 'fr-BE' })).exists();
          assert.dom(screen.getByRole('option', { name: 'fr-FR' })).exists();
          assert.dom(screen.getByRole('option', { name: 'nl-BE' })).exists();
        });
      });

      test('does not display user’s terms of service', async function (assert) {
        // given
        const user = EmberObject.create({
          lastName: 'Harry',
          firstName: 'John',
          email: 'john.harry@gmail.com',
          username: null,
          authenticationMethods: [],
        });

        // when
        const screen = await render(<template><UserOverview @user={{user}} /></template>);
        await clickByName('Modifier');

        // then
        assert.dom(screen.queryByText('CGU Pix Orga validé :')).doesNotExist();
        assert.dom(screen.queryByText('CGU Pix Certif validé :')).doesNotExist();
      });

      module('when user has an email only', function () {
        test('displays user’s email in edit mode', async function (assert) {
          // given
          const user = EmberObject.create({
            lastName: 'Harry',
            firstName: 'John',
            email: 'john.harry@gmail.com',
            username: null,
            authenticationMethods: [],
          });

          // when
          const screen = await render(<template><UserOverview @user={{user}} /></template>);
          await clickByName('Modifier');

          // then
          assert.dom(screen.getByRole('textbox', { name: 'Adresse e-mail *' })).hasValue(user.email);
        });

        test('does not display username in edit mode', async function (assert) {
          // given
          const user = EmberObject.create({
            lastName: 'Harry',
            firstName: 'John',
            email: 'john.harry@gmail.com',
            username: null,
            authenticationMethods: [],
          });

          // when
          const screen = await render(<template><UserOverview @user={{user}} /></template>);
          await clickByName('Modifier');

          // then
          assert.dom(screen.queryByRole('textbox', { name: 'Identifiant *' })).doesNotExist();
        });
      });

      module('when user has a username only', function () {
        test('displays user’s username in edit mode', async function (assert) {
          // given
          const user = EmberObject.create({
            lastName: 'Harry',
            firstName: 'John',
            email: null,
            username: 'user.name1212',
            authenticationMethods: [],
          });

          // when
          const screen = await render(<template><UserOverview @user={{user}} /></template>);
          await clickByName('Modifier');

          // then
          assert.dom(screen.getByRole('textbox', { name: 'Identifiant *' })).hasValue(user.username);
        });

        test('displays not required email', async function (assert) {
          // given
          const user = EmberObject.create({
            lastName: 'Harry',
            firstName: 'John',
            email: null,
            username: 'user.name1212',
            authenticationMethods: [],
          });

          // when
          const screen = await render(<template><UserOverview @user={{user}} /></template>);
          await clickByName('Modifier');

          // then
          const emailInput = screen.getByRole('textbox', { name: 'Adresse e-mail' });
          assert.dom(emailInput).exists();
          assert.dom(emailInput).hasNoAttribute('required');
        });
      });

      module('when user has no username and no email', function () {
        test('does not display email', async function (assert) {
          // given
          const user = EmberObject.create({
            lastName: 'Harry',
            firstName: 'John',
            email: null,
            username: undefined,
            authenticationMethods: [],
          });

          // when
          const screen = await render(<template><UserOverview @user={{user}} /></template>);
          await clickByName('Modifier');

          // then
          assert.dom(screen.queryByRole('textbox', { name: 'Adresse e-mail *' })).doesNotExist();
        });
      });
    });

    module('when the admin member click on anonymize button', function () {
      test('shows modal', async function (assert) {
        // given
        const user = EmberObject.create({
          lastName: 'Harry',
          firstName: 'John',
          email: 'john.harry@gmail.com',
          username: null,
          authenticationMethods: [],
        });

        const screen = await render(<template><UserOverview @user={{user}} /></template>);

        // when
        await clickByName('Anonymiser cet utilisateur');

        await screen.findByRole('dialog');
        // then
        assert.dom(screen.getByRole('heading', { name: 'Merci de confirmer' })).exists();
        assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
        assert.dom(screen.getByRole('button', { name: 'Confirmer' })).exists();
        assert
          .dom(screen.getByText('Êtes-vous sûr de vouloir anonymiser cet utilisateur ? Ceci n’est pas réversible.'))
          .exists();
      });

      // TODO Fix aria-hidden PixUI Modal before this test pass
      test.skip('closes the modal to cancel action', async function (assert) {
        // given
        const user = EmberObject.create({
          lastName: 'Harry',
          firstName: 'John',
          email: 'john.harry@gmail.com',
          username: null,
          authenticationMethods: [],
        });

        const screen = await render(<template><UserOverview @user={{user}} /></template>);
        await clickByName('Anonymiser cet utilisateur');

        await screen.findByRole('dialog');
        // when
        await clickByName('Annuler');

        // then
        assert.dom(screen.queryByRole('heading', { name: 'Merci de confirmer' })).doesNotExist();
        assert.dom(screen.queryByRole('button', { name: 'Confirmer' })).doesNotExist();
        assert.dom(screen.queryByRole('button', { name: 'Annuler' })).doesNotExist();
      });

      test('displays an anonymisation message with the full name of the admin member', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const fullName = 'Laurent Gina';
        const user = store.createRecord('user', { hasBeenAnonymised: true, anonymisedByFullName: fullName });

        // when
        const screen = await render(<template><UserOverview @user={{user}} /></template>);

        // then
        assert
          .dom(
            screen.getByText(
              t('pages.user-details.overview.anonymisation.user-anonymised-by-admin-message', { fullName }),
            ),
          )
          .exists();
      });

      test('disables action buttons "Modifier" and "Anonymiser cet utilisateur"', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const fullName = 'Laurent Gina';
        const user = store.createRecord('user', { hasBeenAnonymised: true, anonymisedByFullName: fullName });

        // when
        const screen = await render(<template><UserOverview @user={{user}} /></template>);

        // then
        assert.dom(screen.getByRole('button', { name: 'Modifier' })).hasAttribute('disabled');
        assert.dom(screen.getByRole('button', { name: 'Anonymiser cet utilisateur' })).hasAttribute('disabled');
      });

      module('When the admin member who anonymised the user is not set in database', function () {
        test('displays an anonymisation message', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const user = store.createRecord('user', { hasBeenAnonymised: true, anonymisedByFullName: null });

          // when
          const screen = await render(<template><UserOverview @user={{user}} /></template>);

          // then
          assert
            .dom(screen.getByText(t('pages.user-details.overview.anonymisation.default-anonymised-user-message')))
            .exists();
        });
      });
    });

    module('when the displayed user is a Pix agent', function () {
      test('shows the anonymize button as disabled', async function (assert) {
        const user = EmberObject.create({
          lastName: 'Harry',
          firstName: 'John',
          email: 'john.harry@gmail.com',
          isPixAgent: true,
          authenticationMethods: [],
        });

        // when
        const screen = await render(<template><UserOverview @user={{user}} /></template>);

        // then
        const anonymizeButton = await screen.findByRole('button', { name: 'Anonymiser cet utilisateur' });
        assert.dom(anonymizeButton).isDisabled();

        const anonymizationDisabledTooltip = await screen.getByText(
          "Vous ne pouvez pas anonymiser le compte d'un agent Pix.",
        );
        assert.dom(anonymizationDisabledTooltip).exists();
      });
    });

    module('Displays SSO information', function (hooks) {
      class OidcIdentityProvidersStub extends Service {
        get list() {
          return [
            {
              code: 'SUNLIGHT_NAVIGATIONS',
              organizationName: 'Sunlight Navigations',
            },
          ];
        }
      }

      hooks.beforeEach(function () {
        this.owner.register('service:oidc-identity-providers', OidcIdentityProvidersStub);
      });

      test('When user has not SSO authentication method', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const user = {
          firstName: 'John',
          lastName: 'Harry',
          email: 'john.harry@example.net',
          username: 'john.harry0102',
        };
        user.authenticationMethods = [await store.createRecord('authentication-method', { identityProvider: 'abc' })];

        // when
        const screen = await render(<template><UserOverview @user={{user}} /></template>);

        // then
        assert.dom(screen.getByText('SSO : Non')).exists();
      });

      test('When user has OIDC authentication method', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const user = {
          firstName: 'John',
          lastName: 'Harry',
          email: 'john.harry@example.net',
          username: 'john.harry0102',
        };
        user.authenticationMethods = [
          await store.createRecord('authentication-method', { identityProvider: 'SUNLIGHT_NAVIGATIONS' }),
        ];

        // when
        const screen = await render(<template><UserOverview @user={{user}} /></template>);

        // then
        assert.dom(screen.getByText('SSO : Oui')).exists();
      });

      test('When user has GAR authentication method', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const user = {
          firstName: 'John',
          lastName: 'Harry',
          email: 'john.harry@example.net',
          username: 'john.harry0102',
        };
        user.authenticationMethods = [await store.createRecord('authentication-method', { identityProvider: 'GAR' })];

        // when
        const screen = await render(<template><UserOverview @user={{user}} /></template>);

        // then
        assert.dom(screen.getByText('SSO : Oui')).exists();
      });
    });
  });

  module('When the admin member does not have access to users actions scope', function () {
    test('does not display the action buttons "Modifier" and "Anonymiser cet utilisateur"', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      class AccessControlStub extends Service {
        hasAccessToUsersActionsScope = false;
      }

      const user = {
        firstName: 'John',
        lastName: 'Harry',
        email: 'john.harry@example.net',
        username: 'john.harry0102',
      };
      user.authenticationMethods = [await store.createRecord('authentication-method', { identityProvider: 'abc' })];
      this.owner.register('service:access-control', AccessControlStub);

      // when
      const screen = await render(<template><UserOverview @user={{user}} /></template>);

      // then
      assert.dom(screen.queryByRole('button', { name: 'Modifier' })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Anonymiser cet utilisateur' })).doesNotExist();
    });
  });
});

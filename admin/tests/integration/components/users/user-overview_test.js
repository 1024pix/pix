import { clickByName, render, waitFor } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
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

    module('when the admin look at user details', function () {
      test('displays the update button', async function (assert) {
        // given
        this.set('user', {
          firstName: 'John',
          lastName: 'Harry',
          email: 'john.harry@example.net',
          username: 'john.harry0102',
        });

        // when
        const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);

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
        });
        this.set('user', user);

        // when
        const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);

        // then
        assert.dom(screen.getByText(`Prénom : ${this.user.firstName}`)).exists();
        assert.dom(screen.getByText(`Nom : ${this.user.lastName}`)).exists();
        assert.dom(screen.getByText(`Adresse e-mail : ${this.user.email}`)).exists();
        assert.dom(screen.getByText(`Identifiant : ${this.user.username}`)).exists();
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
          this.set('user', user);

          // when
          const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);

          // then
          assert.dom(screen.getByText(`Prénom : ${this.user.firstName}`)).exists();
          assert.dom(screen.getByText(`Nom : ${this.user.lastName}`)).exists();
          assert.dom(screen.getByText(`Adresse e-mail : ${this.user.email}`)).exists();
          assert.dom(screen.getByText(`Identifiant : ${this.user.username}`)).exists();
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
            this.set('user', user);

            // when
            const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);

            // then
            assert.ok(
              screen
                .getByRole('button', {
                  name: this.intl.t('components.users.user-detail-personal-information.actions.copy-email'),
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
            this.set('user', user);

            // when
            const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);
            const copyButton = await screen.getByRole('button', {
              name: this.intl.t('components.users.user-detail-personal-information.actions.copy-email'),
            });
            await triggerEvent(copyButton, 'mouseenter');

            // then
            assert
              .dom(
                screen.getByText(this.intl.t('components.users.user-detail-personal-information.actions.copy-email')),
              )
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
            this.set('user', user);

            // when
            const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);

            // then
            assert.ok(
              screen
                .getByRole('button', {
                  name: this.intl.t('components.users.user-detail-personal-information.actions.copy-username'),
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
            this.set('user', user);

            // when
            const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);
            const copyButton = await screen.getByRole('button', {
              name: this.intl.t('components.users.user-detail-personal-information.actions.copy-username'),
            });
            await triggerEvent(copyButton, 'mouseenter');

            // then
            assert
              .dom(
                screen.getByText(
                  this.intl.t('components.users.user-detail-personal-information.actions.copy-username'),
                ),
              )
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
            this.set('user', user);

            // when
            const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);

            // then
            assert
              .dom(
                screen.queryByRole('button', {
                  name: this.intl.t('components.users.user-detail-personal-information.actions.copy-email'),
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
            this.set('user', user);

            // when
            const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);

            // then
            assert
              .dom(
                screen.queryByRole('button', {
                  name: this.intl.t('components.users.user-detail-personal-information.actions.copy-username'),
                }),
              )
              .doesNotExist();
          });
        });
      });

      module('terms of service', function () {
        module('displays yes by application', function () {
          test('displays "OUI" with date when user accepted Pix App terms of service', async function (assert) {
            // given
            this.set('user', { cgu: true, lastTermsOfServiceValidatedAt: new Date('2021-12-10') });

            // when
            const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);

            // then
            assert.dom(screen.getByText('CGU Pix App validé : OUI, le 10/12/2021')).exists();
          });

          test('displays "OUI" with date when user accepted Pix Orga terms of service', async function (assert) {
            // given
            this.set('user', {
              pixOrgaTermsOfServiceAccepted: true,
              lastPixOrgaTermsOfServiceValidatedAt: new Date('2021-12-14'),
            });

            // when
            const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);

            // then
            assert.dom(screen.getByText('CGU Pix Orga validé : OUI, le 14/12/2021')).exists();
          });

          test('displays "OUI" with date when user accepted Pix Certif terms of service', async function (assert) {
            // given
            this.set('user', {
              pixCertifTermsOfServiceAccepted: true,
              lastPixCertifTermsOfServiceValidatedAt: new Date('2021-12-14'),
            });

            // when
            const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);

            // then
            assert.dom(screen.getByText('CGU Pix Certif validé : OUI, le 14/12/2021')).exists();
          });
        });

        test('displays "NON" when user not accepted Pix App terms of service', async function (assert) {
          // given
          this.set('user', { pixCertifTermsOfServiceAccepted: true, pixOrgaTermsOfServiceAccepted: true, cgu: false });

          // when
          const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);

          // then
          assert.dom(screen.getByText('CGU Pix App validé : NON')).exists();
        });

        test('displays "NON" when user not accepted Pix Orga terms of service', async function (assert) {
          // given
          this.set('user', { pixCertifTermsOfServiceAccepted: true, pixOrgaTermsOfServiceAccepted: false, cgu: true });

          // when
          const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);

          // then
          assert.dom(screen.getByText('CGU Pix Orga validé : NON')).exists();
        });

        test('displays "NON" when user not accepted Pix Certif terms of service and "OUI" with no date when terms of service for an app are validated but no date provided', async function (assert) {
          // given
          this.set('user', { pixCertifTermsOfServiceAccepted: false, pixOrgaTermsOfServiceAccepted: true, cgu: true });

          // when
          const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);

          // then
          assert.dom(screen.getByText('CGU Pix Certif validé : NON')).exists();
          assert.dom(screen.getByText('CGU Pix Orga validé : OUI')).exists();
          assert.dom(screen.getByText('CGU Pix App validé : OUI')).exists();
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
          this.set('user', user);

          // when
          const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);

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
          this.set('user', user);

          // when
          const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);

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
          this.set('user', user);

          // when
          const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);

          // then
          assert.dom(screen.getByText('Nombre de tentatives de connexion en erreur : 50')).exists();
          assert.dom(screen.getByText('Utilisateur totalement bloqué le : 01/02/2021', { exact: false })).exists();
          assert.dom(screen.queryByText("Utilisateur temporairement bloqué jusqu'au :")).doesNotExist();
        });
      });
    });

    module('When the admin member click to update user details', function (hooks) {
      let user = null;

      hooks.beforeEach(function () {
        user = EmberObject.create({
          lastName: 'Harry',
          firstName: 'John',
          email: 'john.harry@gmail.com',
          username: null,
        });
      });

      test('displays the edit and cancel buttons', async function (assert) {
        // given
        this.set('user', {
          firstName: 'John',
          lastName: 'Harry',
          email: 'john.harry@example.net',
          username: null,
          lang: null,
        });

        // when
        const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);
        await clickByName('Modifier');

        // then
        assert.dom(screen.getByRole('button', { name: 'Modifier' })).exists();
        assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
      });

      test('displays user’s first name and last name with available languages and locales in edit mode', async function (assert) {
        // given
        this.set('user', user);

        // when
        const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);
        await clickByName('Modifier');

        // then
        assert.dom(screen.getByRole('textbox', { name: 'Prénom :' })).hasValue(this.user.firstName);
        assert.dom(screen.getByRole('textbox', { name: 'Nom :' })).hasValue(this.user.lastName);

        await clickByName('Langue :');
        await screen.findByRole('listbox');
        assert.dom(screen.getByRole('option', { name: 'Français' })).exists();
        assert.dom(screen.getByRole('option', { name: 'Anglais' })).exists();
        assert.dom(screen.getByRole('option', { name: 'Néerlandais' })).exists();

        await clickByName('Locale :');
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
        this.set('user', user);

        // when
        const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);
        await clickByName('Modifier');

        // then
        assert.dom(screen.queryByText('CGU Pix Orga validé :')).doesNotExist();
        assert.dom(screen.queryByText('CGU Pix Certif validé :')).doesNotExist();
      });

      module('when user has an email only', function () {
        test('displays user’s email in edit mode', async function (assert) {
          // given
          this.set('user', user);

          // when
          const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);
          await clickByName('Modifier');

          // then
          assert.dom(screen.getByRole('textbox', { name: 'Adresse e-mail :' })).hasValue(this.user.email);
        });

        test('does not display username in edit mode', async function (assert) {
          // given
          this.set('user', user);

          // when
          const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);
          await clickByName('Modifier');

          // then
          assert.dom(screen.queryByRole('textbox', { name: 'Identifiant :' })).doesNotExist();
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
          });
          this.set('user', user);

          // when
          const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);
          await clickByName('Modifier');

          // then
          assert.dom(screen.getByRole('textbox', { name: 'Identifiant :' })).hasValue(this.user.username);
        });

        test('displays email', async function (assert) {
          // given
          const user = EmberObject.create({
            lastName: 'Harry',
            firstName: 'John',
            email: null,
            username: 'user.name1212',
          });
          this.set('user', user);

          // when
          const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);
          await clickByName('Modifier');

          // then
          assert.dom(screen.getByRole('textbox', { name: 'Adresse e-mail :' })).exists();
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
          });
          this.set('user', user);

          // when
          const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);
          await clickByName('Modifier');

          // then
          assert.dom(screen.queryByRole('textbox', { name: 'Adresse e-mail :' })).doesNotExist();
        });
      });
    });

    module('when the admin member click on anonymize button', function (hooks) {
      let user = null;

      hooks.beforeEach(function () {
        user = EmberObject.create({
          lastName: 'Harry',
          firstName: 'John',
          email: 'john.harry@gmail.com',
          username: null,
        });
      });

      test('shows modal', async function (assert) {
        // given
        this.set('user', user);
        const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);

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
        this.set('user', user);
        const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);
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
        const user = store.createRecord('user', { hasBeenAnonymised: true, anonymisedByFullName: 'Laurent Gina' });
        this.set('user', user);

        // when
        const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);

        // then
        assert.dom(screen.getByText('Utilisateur anonymisé par Laurent Gina.')).exists();
      });

      test('disables action buttons "Modifier" and "Anonymiser cet utilisateur"', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const user = store.createRecord('user', { hasBeenAnonymised: true, anonymisedByFullName: 'Laurent Gina' });
        this.set('user', user);

        // when
        const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);

        // then
        assert.dom(screen.getByRole('button', { name: 'Modifier' })).hasAttribute('disabled');
        assert.dom(screen.getByRole('button', { name: 'Anonymiser cet utilisateur' })).hasAttribute('disabled');
      });

      module('When the admin member who anonymised the user is not set in database', function () {
        test('displays an anonymisation message', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const user = store.createRecord('user', { hasBeenAnonymised: true, anonymisedByFullName: null });
          this.set('user', user);

          // when
          const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);

          // then
          assert.dom(screen.getByText('Utilisateur anonymisé.')).exists();
        });
      });
    });
  });

  module('When the admin member does not have access to users actions scope', function () {
    test('does not display the action buttons "Modifier" and "Anonymiser cet utilisateur"', async function (assert) {
      // given
      class AccessControlStub extends Service {
        hasAccessToUsersActionsScope = false;
      }

      this.set('user', {
        firstName: 'John',
        lastName: 'Harry',
        email: 'john.harry@example.net',
        username: 'john.harry0102',
      });
      this.owner.register('service:access-control', AccessControlStub);

      // when
      const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);

      // then
      assert.dom(screen.queryByRole('button', { name: 'Modifier' })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Anonymiser cet utilisateur' })).doesNotExist();
    });
  });
});

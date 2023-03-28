import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import { clickByName, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';

module('Integration | Component | users | user-overview', function (hooks) {
  setupRenderingTest(hooks);

  module('When the admin member has access to users actions scope', function (hooks) {
    class AccessControlStub extends Service {
      hasAccessToUsersActionsScope = true;
    }

    hooks.beforeEach(function () {
      this.owner.register('service:access-control', AccessControlStub);
    });

    module('When the admin look at user details', function () {
      test('should display the update button', async function (assert) {
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

      test('should display user’s information', async function (assert) {
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
        assert.dom(screen.getByText(this.user.firstName)).exists();
        assert.dom(screen.getByText(this.user.lastName)).exists();
        assert.dom(screen.getByText(this.user.email)).exists();
        assert.dom(screen.getByText(this.user.username)).exists();
        assert.dom(screen.getByText('FR')).exists();
        assert.dom(screen.getByText('fr-FR')).exists();
        assert.dom(screen.getByText('10/12/2021')).exists();
      });

      module('terms of service', function () {
        test('should display "OUI" with date when user accepted Pix App terms of service', async function (assert) {
          // given
          this.set('user', { cgu: true, lastTermsOfServiceValidatedAt: new Date('2021-12-10') });

          // when
          const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);

          // then
          assert.dom(screen.getByText('CGU Pix App validé :')).exists();
          assert.dom(screen.getByText('OUI, le 10/12/2021')).exists();
        });

        test('should display "NON" when user not accepted Pix App terms of service', async function (assert) {
          // given
          this.set('user', { pixCertifTermsOfServiceAccepted: true, pixOrgaTermsOfServiceAccepted: true, cgu: false });

          // when
          const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);

          // then
          assert.dom(screen.getByText('NON')).exists();
        });

        test('should display "OUI" with date when user accepted Pix Orga terms of service', async function (assert) {
          // given
          this.set('user', {
            pixOrgaTermsOfServiceAccepted: true,
            lastPixOrgaTermsOfServiceValidatedAt: new Date('2021-12-14'),
          });

          // when
          const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);

          // then
          assert.dom(screen.getByText('CGU Pix Orga validé :')).exists();
          assert.dom(screen.getByText('OUI, le 14/12/2021')).exists();
        });

        test('should display "NON" when user not accepted Pix Orga terms of service', async function (assert) {
          // given
          this.set('user', { pixCertifTermsOfServiceAccepted: true, pixOrgaTermsOfServiceAccepted: false, cgu: true });

          // when
          const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);

          // then
          assert.dom(screen.getByText('NON')).exists();
        });

        test('should display "OUI" with date when user accepted Pix Certif terms of service', async function (assert) {
          // given
          this.set('user', {
            pixCertifTermsOfServiceAccepted: true,
            lastPixCertifTermsOfServiceValidatedAt: new Date('2021-12-14'),
          });

          // when
          const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);

          // then
          assert.dom(screen.getByText('CGU Pix Certif validé :')).exists();
          assert.dom(screen.getByText('OUI, le 14/12/2021')).exists();
        });

        test('should display "NON" when user not accepted Pix Certif terms of service', async function (assert) {
          // given
          this.set('user', { pixCertifTermsOfServiceAccepted: false, pixOrgaTermsOfServiceAccepted: true, cgu: true });

          // when
          const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);

          // then
          assert.dom(screen.getByText('NON')).exists();
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

        test('should only display failure count if user is not blocked', async function (assert) {
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
          assert.dom(screen.getByText('Nombre de tentatives de connexion en erreur :')).exists();
          assert.dom(screen.getByText('0')).exists();
        });

        test('should display dates when user is temporarily blocked', async function (assert) {
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
          assert.dom(screen.getByText('Nombre de tentatives de connexion en erreur :')).exists();
          assert.dom(screen.getByText('50')).exists();
          assert.dom(screen.getByText("Utilisateur temporairement bloqué jusqu'au :")).exists();
          assert.dom(screen.getByText('28/11/2022', { exact: false })).exists();
          assert.dom(screen.queryByText('Utilisateur totalement bloqué le :')).doesNotExist();
        });

        test('should display dates when user is blocked', async function (assert) {
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
          assert.dom(screen.getByText('Nombre de tentatives de connexion en erreur :')).exists();
          assert.dom(screen.getByText('50')).exists();
          assert.dom(screen.getByText('Utilisateur totalement bloqué le :')).exists();
          assert.dom(screen.getByText('01/02/2021', { exact: false })).exists();
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

      test('should display the edit and cancel buttons', async function (assert) {
        // given
        this.set('user', {
          firstName: 'John',
          lastName: 'Harry',
          email: 'john.harry@example.net',
          username: null,
        });

        // when
        const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);
        await clickByName('Modifier');

        // then
        assert.dom(screen.getByRole('button', { name: 'Editer' })).exists();
        assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
      });

      test('should display user’s language, first name and last name in edit mode', async function (assert) {
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
      });
      module('when user has an email only', function () {
        test('should display user’s email in edit mode', async function (assert) {
          // given
          this.set('user', user);

          // when
          const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);
          await clickByName('Modifier');

          // then
          assert.dom(screen.getByRole('textbox', { name: 'Adresse e-mail :' })).hasValue(this.user.email);
        });

        test('should not display username in edit mode', async function (assert) {
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
        test('should display user’s username in edit mode', async function (assert) {
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

        test('should display email', async function (assert) {
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
        test('should not display email', async function (assert) {
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

      test('should not display user’s terms of service', async function (assert) {
        // given
        this.set('user', user);

        // when
        const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);
        await clickByName('Modifier');

        // then
        assert.dom(screen.queryByText('CGU Pix Orga validé :')).doesNotExist();
        assert.dom(screen.queryByText('CGU Pix Certif validé :')).doesNotExist();
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

      test('should show modal', async function (assert) {
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

      // TODO Fix arai-hidden PixUI Modal before this test pass
      test.skip('should close the modal to cancel action', async function (assert) {
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

      test('should display an anonymisation message with the full name of the admin member', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const user = store.createRecord('user', { hasBeenAnonymised: true, anonymisedByFullName: 'Laurent Gina' });
        this.set('user', user);

        // when
        const screen = await render(hbs`<Users::UserOverview @user={{this.user}} />`);

        // then
        assert.dom(screen.getByText('Utilisateur anonymisé par Laurent Gina.')).exists();
      });

      test('should disable action buttons "Modifier" and "Anonymiser cet utilisateur"', async function (assert) {
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
        test('should display an anonymisation message', async function (assert) {
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
    test('it should not be able to see action buttons "Modifier" and "Anonymiser cet utilisateur"', async function (assert) {
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

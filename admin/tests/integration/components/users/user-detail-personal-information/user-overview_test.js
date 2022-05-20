import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import { clickByName, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';

module('Integration | Component | users | user-detail-personal-information/user-overview', function (hooks) {
  setupRenderingTest(hooks);

  module('When the admin member has access to users actions scope', function () {
    class AccessControlStub extends Service {
      hasAccessToUsersActionsScope = true;
    }

    module('When the admin member click on user details', function () {
      module('update button', function () {
        test('should display the update button', async function (assert) {
          // given
          this.set('user', {
            firstName: 'John',
            lastName: 'Harry',
            email: 'john.harry@example.net',
            username: 'john.harry0102',
          });
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

          // then
          assert.dom(screen.getByRole('button', { name: 'Modifier' })).exists();
        });
      });

      module('user authentication', function () {
        test('should display user’s first name', async function (assert) {
          // given
          this.set('user', { firstName: 'John' });
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

          // then
          assert.dom(screen.getByText(this.user.firstName)).exists();
        });

        test('should display user’s last name', async function (assert) {
          // given
          this.set('user', { lastName: 'Snow' });
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

          // then
          assert.dom(screen.getByText(this.user.lastName)).exists();
        });

        test('should display user’s email', async function (assert) {
          // given
          this.set('user', { email: 'john.snow@winterfell.got' });
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

          // then
          assert.dom(screen.getByText(this.user.email)).exists();
        });

        test('should display user’s username', async function (assert) {
          // given
          this.set('user', { username: 'kingofthenorth' });
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

          // then
          assert.dom(screen.getByText(this.user.username)).exists();
        });
      });

      module('terms of service', function () {
        test('should display "OUI" when user accepted Pix App terms of service', async function (assert) {
          // given
          this.set('user', { cgu: true });
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

          // then
          assert.dom(screen.getByText('OUI')).exists();
        });

        test('should display "NON" when user not accepted Pix App terms of service', async function (assert) {
          // given
          this.set('user', { pixCertifTermsOfServiceAccepted: true, pixOrgaTermsOfServiceAccepted: true, cgu: false });
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

          // then
          assert.dom(screen.getByText('NON')).exists();
        });

        test('should display "OUI" when user accepted Pix Orga terms of service', async function (assert) {
          // given
          this.set('user', { pixOrgaTermsOfServiceAccepted: true });
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

          // then
          assert.dom(screen.getByText('OUI')).exists();
        });

        test('should display "NON" when user not accepted Pix Orga terms of service', async function (assert) {
          // given
          this.set('user', { pixCertifTermsOfServiceAccepted: true, pixOrgaTermsOfServiceAccepted: false, cgu: true });
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

          // then
          assert.dom(screen.getByText('NON')).exists();
        });

        test('should display "OUI" when user accepted Pix Certif terms of service', async function (assert) {
          // given
          this.set('user', { pixCertifTermsOfServiceAccepted: true });
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

          // then
          assert.dom(screen.getByText('OUI')).exists();
        });

        test('should display "NON" when user not accepted Pix Certif terms of service', async function (assert) {
          // given
          this.set('user', { pixCertifTermsOfServiceAccepted: false, pixOrgaTermsOfServiceAccepted: true, cgu: true });
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

          // then
          assert.dom(screen.getByText('NON')).exists();
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
        this.owner.register('service:access-control', AccessControlStub);

        // when
        const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}} />`);
        await clickByName('Modifier');

        // then
        assert.dom(screen.getByRole('button', { name: 'Editer' })).exists();
        assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
      });

      test('should display user’s first name and last name in edit mode', async function (assert) {
        // given
        this.set('user', user);
        this.owner.register('service:access-control', AccessControlStub);

        // when
        const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);
        await clickByName('Modifier');

        // then
        assert.dom(screen.getByRole('textbox', { name: 'Prénom :' })).hasValue(this.user.firstName);
        assert.dom(screen.getByRole('textbox', { name: 'Nom :' })).hasValue(this.user.lastName);
      });

      module('when user has an email only', function () {
        test('should display user’s email in edit mode', async function (assert) {
          // given
          this.set('user', user);
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);
          await clickByName('Modifier');

          // then
          assert.dom(screen.getByRole('textbox', { name: 'Adresse e-mail :' })).hasValue(this.user.email);
        });

        test('should not display username in edit mode', async function (assert) {
          // given
          this.set('user', user);
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);
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
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}} />`);
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
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}} />`);
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
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}} />`);
          await clickByName('Modifier');

          // then
          assert.dom(screen.queryByRole('textbox', { name: 'Adresse e-mail :' })).doesNotExist();
        });
      });

      test('should not display user’s terms of service', async function (assert) {
        // given
        this.set('user', user);
        this.owner.register('service:access-control', AccessControlStub);

        // when
        const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);
        await clickByName('Modifier');

        // then
        assert.dom(screen.queryByText('CGU Pix Orga validé :')).doesNotExist();
        assert.dom(screen.queryByText('CGU Pix Certif validé :')).doesNotExist();
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
      const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

      // then
      assert.dom(screen.queryByRole('button', { name: 'Modifier' })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Anonymiser cet utilisateur' })).doesNotExist();
    });
  });
});

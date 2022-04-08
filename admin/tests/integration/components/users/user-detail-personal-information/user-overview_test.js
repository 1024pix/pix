import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import { clickByName, render } from '@1024pix/ember-testing-library';

module('Integration | Component | users | user-detail-personal-information/user-overview', function (hooks) {
  setupRenderingTest(hooks);

  module('When the administrator click on user details', function () {
    module('update button', function () {
      test('should display the update button', async function (assert) {
        // given
        this.set('user', {
          firstName: 'John',
          lastName: 'Harry',
          email: 'john.harry@example.net',
          username: 'john.harry0102',
        });

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

        // when
        const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

        // then
        assert.dom(screen.getByText(this.user.firstName)).exists();
      });

      test('should display user’s last name', async function (assert) {
        // given
        this.set('user', { lastName: 'Snow' });

        // when
        const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

        // then
        assert.dom(screen.getByText(this.user.lastName)).exists();
      });

      test('should display user’s email', async function (assert) {
        // given
        this.set('user', { email: 'john.snow@winterfell.got' });

        // when
        const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

        // then
        assert.dom(screen.getByText(this.user.email)).exists();
      });

      test('should display user’s username', async function (assert) {
        // given
        this.set('user', { username: 'kingofthenorth' });

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

        // when
        const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

        // then
        assert.dom(screen.getByText('OUI')).exists();
      });

      test('should display "NON" when user not accepted Pix App terms of service', async function (assert) {
        // given
        this.set('user', { pixCertifTermsOfServiceAccepted: true, pixOrgaTermsOfServiceAccepted: true, cgu: false });

        // when
        const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

        // then
        assert.dom(screen.getByText('NON')).exists();
      });

      test('should display "OUI" when user accepted Pix Orga terms of service', async function (assert) {
        // given
        this.set('user', { pixOrgaTermsOfServiceAccepted: true });

        // when
        const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

        // then
        assert.dom(screen.getByText('OUI')).exists();
      });

      test('should display "NON" when user not accepted Pix Orga terms of service', async function (assert) {
        // given
        this.set('user', { pixCertifTermsOfServiceAccepted: true, pixOrgaTermsOfServiceAccepted: false, cgu: true });

        // when
        const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

        // then
        assert.dom(screen.getByText('NON')).exists();
      });

      test('should display "OUI" when user accepted Pix Certif terms of service', async function (assert) {
        // given
        this.set('user', { pixCertifTermsOfServiceAccepted: true });

        // when
        const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

        // then
        assert.dom(screen.getByText('OUI')).exists();
      });

      test('should display "NON" when user not accepted Pix Certif terms of service', async function (assert) {
        // given
        this.set('user', { pixCertifTermsOfServiceAccepted: false, pixOrgaTermsOfServiceAccepted: true, cgu: true });

        // when
        const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

        // then
        assert.dom(screen.getByText('NON')).exists();
      });
    });
  });

  module('When the administrator click to update user details', function (hooks) {
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
      const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}} />`);
      await clickByName('Modifier');

      // then
      assert.dom(screen.getByRole('button', { name: 'Editer' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
    });

    test('should display user’s first name and last name in edit mode', async function (assert) {
      // given
      this.set('user', user);

      // when
      await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);
      await clickByName('Modifier');

      // then
      assert.dom('.user-edit-form__first-name').hasValue(this.user.firstName);
      assert.dom('.user-edit-form__last-name').hasValue(this.user.lastName);
    });

    module('when user has an email only', function () {
      test('should display user’s email in edit mode', async function (assert) {
        // given
        this.set('user', user);

        // when
        await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);
        await clickByName('Modifier');

        // then
        assert.dom('.user-edit-form__email').hasValue(this.user.email);
      });

      test('should not display username in edit mode', async function (assert) {
        // given
        this.set('user', user);

        // when
        const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);
        await clickByName('Modifier');

        // then
        assert.dom(screen.queryByText('Identifiant :')).doesNotExist();
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
        await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}} />`);
        await clickByName('Modifier');

        // then
        assert.dom('.user-edit-form__username').hasValue(this.user.username);
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
        const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}} />`);
        await clickByName('Modifier');

        // then
        assert.dom(screen.getByText('Adresse e-mail :')).exists();
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
        const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}} />`);
        await clickByName('Modifier');

        // then
        assert.dom(screen.queryByText('Adresse e-mail :')).doesNotExist();
      });
    });

    test('should not display user’s terms of service', async function (assert) {
      // given
      this.set('user', user);

      // when
      const screen = await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);
      await clickByName('Modifier');

      // then
      assert.dom(screen.queryByText('CGU Pix Orga validé :')).doesNotExist();
      assert.dom(screen.queryByText('CGU Pix Certif validé :')).doesNotExist();
    });
  });
});

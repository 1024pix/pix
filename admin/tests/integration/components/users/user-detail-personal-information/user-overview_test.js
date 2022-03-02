import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import { clickByName } from '@1024pix/ember-testing-library';

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
        await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

        // then
        assert.contains('Modifier');
      });
    });

    module('user authentication', function () {
      test('should display user’s first name', async function (assert) {
        // given
        this.set('user', { firstName: 'John' });

        // when
        await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

        // then
        assert.contains(this.user.firstName);
      });

      test('should display user’s last name', async function (assert) {
        // given
        this.set('user', { lastName: 'Snow' });

        // when
        await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

        // then
        assert.contains(this.user.lastName);
      });

      test('should display user’s email', async function (assert) {
        // given
        this.set('user', { email: 'john.snow@winterfell.got' });

        // when
        await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

        // then
        assert.contains(this.user.email);
      });

      test('should display user’s username', async function (assert) {
        // given
        this.set('user', { username: 'kingofthenorth' });

        // when
        await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

        // then
        assert.contains(this.user.username);
      });
    });

    module('terms of service', function () {
      test('should display "OUI" when user accepted Pix App terms of service', async function (assert) {
        // given
        this.set('user', { cgu: true });

        // when
        await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

        // then
        assert.contains('OUI');
      });

      test('should display "NON" when user not accepted Pix App terms of service', async function (assert) {
        // given
        this.set('user', { cgu: false });

        // when
        await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

        // then
        assert.contains('NON');
      });

      test('should display "OUI" when user accepted Pix Orga terms of service', async function (assert) {
        // given
        this.set('user', { pixOrgaTermsOfServiceAccepted: true });

        // when
        await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

        // then
        assert.contains('OUI');
      });

      test('should display "NON" when user not accepted Pix Orga terms of service', async function (assert) {
        // given
        this.set('user', { pixOrgaTermsOfServiceAccepted: false });

        // when
        await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

        // then
        assert.contains('NON');
      });

      test('should display "OUI" when user accepted Pix Certif terms of service', async function (assert) {
        // given
        this.set('user', { pixCertifTermsOfServiceAccepted: true });

        // when
        await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

        // then
        assert.contains('OUI');
      });

      test('should display "NON" when user not accepted Pix Certif terms of service', async function (assert) {
        // given
        this.set('user', { pixCertifTermsOfServiceAccepted: false });

        // when
        await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);

        // then
        assert.contains('NON');
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
      await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}} />`);
      await clickByName('Modifier');

      // then
      assert.contains('Editer');
      assert.contains('Annuler');
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
        await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);
        await clickByName('Modifier');

        // then
        assert.notContains('Identifiant :');
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
        await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}} />`);
        await clickByName('Modifier');

        // then
        assert.contains('Adresse e-mail :');
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
        await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}} />`);
        await clickByName('Modifier');

        // then
        assert.notContains('Adresse e-mail :');
      });
    });

    test('should not display user’s terms of service', async function (assert) {
      // given
      this.set('user', user);

      // when
      await render(hbs`<Users::UserDetailPersonalInformation::UserOverview @user={{this.user}}/>`);
      await clickByName('Modifier');

      // then
      assert.notContains('CGU Pix Orga validé :');
      assert.notContains('CGU Pix Certif validé :');
    });
  });
});

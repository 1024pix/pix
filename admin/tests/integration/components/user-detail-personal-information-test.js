import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';

module('Integration | Component | user-detail-personal-information', function(hooks) {
  setupRenderingTest(hooks);

  module('should display by default the form in read only mode', async function() {

    test('should display the update button', async function(assert) {
      this.set('user', { firstName: 'John' });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('button[aria-label=\'Modifier\'').exists();

    });

    test('should display user’s first name in read only mode', async function(assert) {
      this.set('user', { firstName: 'John' });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('.user__first-name').hasText(this.user.firstName);

    });

    test('should display user’s last name in read only mode', async function(assert) {
      this.set('user', { lastName: 'Snow' });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('.user__last-name').hasText(this.user.lastName);
    });

    test('should display user’s email in read only mode', async function(assert) {
      this.set('user', { email: 'john.snow@winterfell.got' });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('.user__email').hasText(this.user.email);
    });

    test('should display user’s username in read only mode', async function(assert) {
      this.set('user', { username: 'kingofthenorth' });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('.user__username').hasText(this.user.username);
    });

    test('should display "OUI" when user accepted Pix App terms of service in read only mode', async function(assert) {
      this.set('user', { cgu: true });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('.user__cgu').hasText('OUI');
    });

    test('should display "NON" when user not accepted Pix App terms of service in read only mode', async function(assert) {
      this.set('user', { cgu: false });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('.user__cgu').hasText('NON');
    });

    test('should display "OUI" when user accepted Pix Orga terms of service in read only mode', async function(assert) {
      this.set('user', { pixOrgaTermsOfServiceAccepted: true });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('.user__pix-orga-terms-of-service-accepted').hasText('OUI');
    });

    test('should display "NON" when user not accepted Pix Orga terms of service in read only mode', async function(assert) {
      this.set('user', { pixOrgaTermsOfServiceAccepted: false });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('.user__pix-orga-terms-of-service-accepted').hasText('NON');
    });

    test('should display "OUI" when user accepted Pix Certif terms of service in read only mode', async function(assert) {
      this.set('user', { pixCertifTermsOfServiceAccepted: true });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('.user__pix-certif-terms-of-service-accepted').hasText('OUI');
    });

    test('should display "NON" when user not accepted Pix Certif terms of service in read only mode', async function(assert) {
      this.set('user', { pixCertifTermsOfServiceAccepted: false });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('.user__pix-certif-terms-of-service-accepted').hasText('NON');
    });

    test('should display that user is authenticated from GAR in read only mode', async function(assert) {
      this.set('user', { isAuthenticatedFromGAR: true });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('.user__is-authenticated-from-gar').hasText('NON');
    });

    test('should display that user is not authenticated from GAR in read only mode', async function(assert) {
      this.set('user', { isAuthenticatedFromGAR: false });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('.user__is-authenticated-from-gar').hasText('NON');
    });

    test('should display the edit and cancel buttons when click on update button', async function(assert) {

      this.set('user', { email: 'john.snow@winterfell.got' });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      await click('button[aria-label=\'Modifier\'');

      assert.dom('button[aria-label=\'Editer\'').exists();
      assert.dom('button[aria-label=\'Annuler\'').exists();
    });
  });

  module('should display the form in editable mode when admin click on update user details', async function() {

    module('should display only fields allowed for update', async function() {

      let user = null;

      hooks.beforeEach(function() {
        user = EmberObject.create({ lastName: 'harry', firstName: 'John', email: 'john.harry@gmail.com' });
      });

      test('should display display the edit and cancel buttons when click on update button', async function(assert) {

        this.set('user', user);

        await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

        await click('button[aria-label=\'Modifier\'');

        // then
        assert.dom('button[aria-label=\'Editer\'').exists();
        assert.dom('button[aria-label=\'Annuler\'').exists();
      });

      test('should display user’s first name in edit mode', async function(assert) {

        this.set('user', user);

        await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

        await click('button[aria-label=\'Modifier\'');

        assert.dom('.user-edit-form__first-name').hasValue(this.user.firstName);

      });

      test('should display user’s last name in edit mode', async function(assert) {

        this.set('user', user);

        await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

        await click('button[aria-label=\'Modifier\'');

        assert.dom('.user-edit-form__last-name').hasValue(this.user.lastName);
      });

      test('should display user’s email in edit mode', async function(assert) {

        this.set('user', user);

        await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

        await click('button[aria-label=\'Modifier\'');

        assert.dom('.user-edit-form__email').hasValue(this.user.email);
      });

    });

    module('should not display fields not allowed for update', async function() {

      let user = null;

      hooks.beforeEach(function() {
        user = EmberObject.create({ lastName: 'harry', firstName: 'John', email: 'john.harry@gmail.com' });
      });

      test('should not display user’s username in edit mode', async function(assert) {

        this.set('user', user);

        await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

        await click('button[aria-label=\'Modifier\'');

        assert.dom('.user-edit-form__first-name').hasValue(this.user.firstName);

      });

      test('should not display user’s authenticated-from-gar in edit mode', async function(assert) {

        this.set('user', user);

        await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

        await click('button[aria-label=\'Modifier\'');

        assert.dom('.user-edit-form__last-name').hasValue(this.user.lastName);
      });

      test('should not display user’s cgu in edit mode', async function(assert) {

        this.set('user', user);

        await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

        await click('button[aria-label=\'Modifier\'');

        assert.dom('.user__cgu').doesNotExist();
      });

      test('should not display user’s pix-orga-terms-of-service-accepted in edit mode', async function(assert) {

        this.set('user', user);

        await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

        await click('button[aria-label=\'Modifier\'');

        assert.dom('.user__pix-orga-terms-of-service-accepted').doesNotExist();
      });

      test('should not display user’s pix-certif-terms-of-service-accepted in edit mode', async function(assert) {

        this.set('user', user);

        await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

        await click('button[aria-label=\'Modifier\'');

        assert.dom('.user__pix-certif-terms-of-service-accepted').doesNotExist();
      });

    });

  });

  module('should change the edition mode when admin click on update, edit and cancel buttons', async function() {

    let user = null;

    hooks.beforeEach(function() {
      user = EmberObject.create({ lastName: 'harry', firstName: 'John', email: 'john.harry@gmail.com' });
    });

    test('should display the update button when admin cancel modification ', async function(assert) {

      this.set('user', user);

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      await click('button[aria-label=\'Annuler\'');

      // then
      assert.dom('button[aria-label=\'Modifier\'').exists();
      assert.dom('button[aria-label=\'Editer\'').doesNotExist();
      assert.dom('button[aria-label=\'Annuler\'').doesNotExist();
    });

    test('should display the update button when admin click on edit button ', async function(assert) {

      this.set('user', user);

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      await click('button[aria-label=\'Editer\'');

      assert.dom('button[aria-label=\'Modifier\'').exists();
      assert.dom('button[aria-label=\'Editer\'').doesNotExist();
      assert.dom('button[aria-label=\'Annuler\'').doesNotExist();
    });

  });

});


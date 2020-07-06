import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';

module('Integration | Component | user-detail-personal-information', function(hooks) {
  setupRenderingTest(hooks);

  module('When the administrator click on user details', async function() {

    test('should display the update button when user is connected by email only', async function(assert) {
      this.set('user', {
        firstName: 'John',
        lastName: 'Harry',
        email: 'john.harry@example.net',
        username: null,
        isAuthenticatedFromGAR: false
      });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('button[aria-label=\'Modifier\'').exists();

    });

    test('should not display the update button when user is connected from GAR only', async function(assert) {
      this.set('user', {
        firstName: 'John',
        lastName: 'Harry',
        email: null,
        username: null,
        isAuthenticatedFromGAR: true
      });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('button[aria-label=\'Modifier\'').doesNotExist();

    });

    test('should not display the update button when user is connected with username only', async function(assert) {
      this.set('user', {
        firstName: 'John',
        lastName: 'Harry',
        email: null,
        username: 'john.harry2018',
        isAuthenticatedFromGAR: false,
      });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('button[aria-label=\'Modifier\'').doesNotExist();

    });

    test('should not display the update button when user is connected with username,email', async function(assert) {
      this.set('user', {
        firstName: 'John',
        lastName: 'Harry',
        email: 'john.harry@example.net',
        username: 'john.harry2018',
        isAuthenticatedFromGAR: false
      });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('button[aria-label=\'Modifier\'').doesNotExist();

    });

    test('should not display the update button when user is connected with email and GAR', async function(assert) {
      this.set('user', {
        firstName: 'John',
        lastName: 'Harry',
        email: 'john.harry@example.net',
        username: null,
        isAuthenticatedFromGAR: true
      });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('button[aria-label=\'Modifier\'').doesNotExist();

    });

    test('should not display the update button when user is connected with username and GAR', async function(assert) {
      this.set('user', {
        firstName: 'John',
        lastName: 'Harry',
        email: null,
        username: 'john.harry2018',
        isAuthenticatedFromGAR: true
      });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('button[aria-label=\'Modifier\'').doesNotExist();

    });

    test('should not display the update button when user is connected with username, email and GAR', async function(assert) {
      this.set('user', {
        firstName: 'John',
        lastName: 'Harry',
        email: 'john.harry@example.net',
        username: 'john.harry2018',
        isAuthenticatedFromGAR: true
      });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('button[aria-label=\'Modifier\'').doesNotExist();

    });

    test('should display user’s first name ', async function(assert) {
      this.set('user', { firstName: 'John' });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('.user__first-name').hasText(this.user.firstName);

    });

    test('should display user’s last name ', async function(assert) {
      this.set('user', { lastName: 'Snow' });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('.user__last-name').hasText(this.user.lastName);
    });

    test('should display user’s email ', async function(assert) {
      this.set('user', { email: 'john.snow@winterfell.got' });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('.user__email').hasText(this.user.email);
    });

    test('should display user’s username ', async function(assert) {
      this.set('user', { username: 'kingofthenorth' });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('.user__username').hasText(this.user.username);
    });

    test('should display "OUI" when user accepted Pix App terms of service ', async function(assert) {
      this.set('user', { cgu: true });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('.user__cgu').hasText('OUI');
    });

    test('should display "NON" when user not accepted Pix App terms of service ', async function(assert) {
      this.set('user', { cgu: false });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('.user__cgu').hasText('NON');
    });

    test('should display "OUI" when user accepted Pix Orga terms of service ', async function(assert) {
      this.set('user', { pixOrgaTermsOfServiceAccepted: true });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('.user__pix-orga-terms-of-service-accepted').hasText('OUI');
    });

    test('should display "NON" when user not accepted Pix Orga terms of service ', async function(assert) {
      this.set('user', { pixOrgaTermsOfServiceAccepted: false });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('.user__pix-orga-terms-of-service-accepted').hasText('NON');
    });

    test('should display "OUI" when user accepted Pix Certif terms of service ', async function(assert) {
      this.set('user', { pixCertifTermsOfServiceAccepted: true });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('.user__pix-certif-terms-of-service-accepted').hasText('OUI');
    });

    test('should display "NON" when user not accepted Pix Certif terms of service ', async function(assert) {
      this.set('user', { pixCertifTermsOfServiceAccepted: false });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('.user__pix-certif-terms-of-service-accepted').hasText('NON');
    });

    test('should display that user is authenticated from GAR ', async function(assert) {
      this.set('user', { isAuthenticatedFromGAR: true });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('.user__is-authenticated-from-gar').hasText('OUI');
    });

    test('should display that user is not authenticated from GAR ', async function(assert) {
      this.set('user', { isAuthenticatedFromGAR: false });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      assert.dom('.user__is-authenticated-from-gar').hasText('NON');
    });

  });

  module('When the administrator click to update user details', async function() {

    let user = null;

    hooks.beforeEach(function() {
      user = EmberObject.create({
        lastName: 'Harry',
        firstName: 'John',
        email: 'john.harry@gmail.com',
        username: null,
        isAuthenticatedFromGAR: false
      });
    });

    test('should display the edit and cancel buttons', async function(assert) {

      this.set('user', {
        firstName: 'John',
        lastName: 'Harry',
        email: 'john.harry@example.net',
        username: null,
        isAuthenticatedFromGAR: false
      });

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      await click('button[aria-label=\'Modifier\'');

      assert.dom('button[aria-label=\'Editer\'').exists();
      assert.dom('button[aria-label=\'Annuler\'').exists();
    });

    test('should display user’s first name,last name and email in edit mode', async function(assert) {

      this.set('user', user);

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      await click('button[aria-label=\'Modifier\'');

      assert.dom('.user-edit-form__first-name').hasValue(this.user.firstName);
      assert.dom('.user-edit-form__last-name').hasValue(this.user.lastName);
      assert.dom('.user-edit-form__email').hasValue(this.user.email);

    });

    test('should not display user’s terms of service', async function(assert) {

      this.set('user', user);

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      await click('button[aria-label=\'Modifier\'');

      assert.dom('.user__cgu').doesNotExist();
      assert.dom('.user__pix-orga-terms-of-service-accepted').doesNotExist();
      assert.dom('.user__pix-certif-terms-of-service-accepted').doesNotExist();

    });

  });

  module('when the administrator click on anonymize button', async function() {
    let user = null;

    hooks.beforeEach(function() {
      user = EmberObject.create({
        lastName: 'Harry',
        firstName: 'John',
        email: 'john.harry@gmail.com',
        username: null,
        isAuthenticatedFromGAR: false
      });
    });

    test('should show modal', async function(assert) {
      this.set('user', user);
      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      await click('button[aria-label=\'Anonymiser\']');

      assert.dom('.modal-dialog').exists();
      assert.contains('Êtes-vous sûr de vouloir anonymiser cet utilisateur ? Ceci n’est pas réversible.');
    });

    test('should close the modal to cancel action', async function(assert) {
      this.set('user', user);
      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);
      await click('button[aria-label=\'Anonymiser\']');

      await click('.modal-dialog .btn-secondary');

      assert.dom('.modal-dialog').doesNotExist();
    });
  });
});

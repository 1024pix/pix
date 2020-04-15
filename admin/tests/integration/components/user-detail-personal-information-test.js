import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | user-detail-personal-information', function(hooks) {
  setupRenderingTest(hooks);

  test('should display user’s id', async function(assert) {
    this.set('user', { id: '1234' });

    await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

    assert.dom('.user__id').hasText(this.user.id);
  });

  test('should display user’s first name', async function(assert) {
    this.set('user', { firstName: 'John' });

    await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

    assert.dom('.user__first-name').hasText(this.user.firstName);
  });

  test('should display user’s last name', async function(assert) {
    this.set('user', { lastName: 'Snow' });

    await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

    assert.dom('.user__last-name').hasText(this.user.lastName);
  });

  test('should display user’s email', async function(assert) {
    this.set('user', { email: 'john.snow@winterfell.got' });

    await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

    assert.dom('.user__email').hasText(this.user.email);
  });

  test('should display user’s username', async function(assert) {
    this.set('user', { username: 'kingofthenorth' });

    await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

    assert.dom('.user__username').hasText(this.user.username);
  });

  test('should display "OUI" when user accepted Pix App terms of service', async function(assert) {
    this.set('user', { isPixTermsOfServiceAccepted: true });

    await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

    assert.dom('.user__cgu').hasText('OUI');
  });

  test('should display "NON" when user not accepted Pix App terms of service', async function(assert) {
    this.set('user', { isPixTermsOfServiceAccepted: false });

    await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

    assert.dom('.user__cgu').hasText('NON');
  });

  test('should display "OUI" when user accepted Pix Orga terms of service', async function(assert) {
    this.set('user', { isPixOrgaTermsOfServiceAccepted: true });

    await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

    assert.dom('.user__pix-orga-terms-of-service-accepted').hasText('OUI');
  });

  test('should display "NON" when user not accepted Pix Orga terms of service', async function(assert) {
    this.set('user', { isPixOrgaTermsOfServiceAccepted: false });

    await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

    assert.dom('.user__pix-orga-terms-of-service-accepted').hasText('NON');
  });

  test('should display "OUI" when user accepted Pix Certif terms of service', async function(assert) {
    this.set('user', { isPixCertifTermsOfServiceAccepted: true });

    await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

    assert.dom('.user__pix-certif-terms-of-service-accepted').hasText('OUI');
  });

  test('should display "NON" when user not accepted Pix Certif terms of service', async function(assert) {
    this.set('user', { isPixCertifTermsOfServiceAccepted: false });

    await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

    assert.dom('.user__pix-certif-terms-of-service-accepted').hasText('NON');
  });

});


import { module, test } from 'qunit';
import { currentURL, click, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

import clickByLabel from '../helpers/extended-ember-test-helpers/click-by-label';

module('Acceptance | User details personal information', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user = null;

  hooks.beforeEach(async function() {
    const schoolingRegistration = this.server.create('schooling-registration', { firstName: 'John' });
    const pixAuthenticationMethod = this.server.create('authentication-method', { identityProvider: 'PIX' });
    const garAuthenticationMethod = this.server.create('authentication-method', { identityProvider: 'GAR' });
    user = this.server.create('user', {
      'first-name': 'john',
      'last-name': 'harry',
      username: null,
      'is-authenticated-from-gar': false,
    });
    user.schoolingRegistrations = [schoolingRegistration];
    user.authenticationMethods = [pixAuthenticationMethod, garAuthenticationMethod];
    user.save();
    await createAuthenticateSession({ userId: user.id });
  });

  test('visiting /users/:id', async function(assert) {
    // when
    await visit(`/users/${user.id}`);

    // then
    assert.equal(currentURL(), `/users/${user.id}`);
  });

  module('when administrator click to edit users details', function() {

    test('should update user firstName, lastName and email', async function(assert) {
      // given
      await visit(`/users/${user.id}`);
      await clickByLabel('Modifier');

      // when
      await fillIn('#firstName', 'john');
      await fillIn('#lastName', 'doe');
      await fillIn('#email', 'john.doe@example.net');

      await clickByLabel('Editer');

      // then
      assert.dom('.user__first-name').hasText('john');
      assert.dom('.user__last-name').hasText('doe');
      assert.dom('.user__email').hasText('john.doe@example.net');
    });

    test('should update user firstName, lastName and username', async function(assert) {
      // given
      const schoolingRegistration = this.server.create('schooling-registration', { firstName: 'John' });
      user = this.server.create('user', {
        'first-name': 'john',
        'last-name': 'harry',
        username: 'john.hary0101',
      });
      user.schoolingRegistrations = [schoolingRegistration];
      user.save();
      await createAuthenticateSession({ userId: user.id });

      await visit(`/users/${user.id}`);
      await clickByLabel('Modifier');

      // when
      await fillIn('#firstName', 'john');
      await fillIn('#lastName', 'doe');
      await fillIn('#username', 'john.doe0101');

      await clickByLabel('Editer');

      // then
      assert.dom('.user__first-name').hasText('john');
      assert.dom('.user__last-name').hasText('doe');
      assert.dom('.user__username').hasText('john.doe0101');
    });
  });

  module('when administrator click on anonymize button and confirm modal', function() {

    test('should anonymize the user', async function(assert) {
      // given
      await visit(`/users/${user.id}`);
      await clickByLabel('Anonymiser cet utilisateur');

      // when
      await clickByLabel('Confirmer');

      // then
      assert.contains(`prenom_${user.id}`);
      assert.contains(`nom_${user.id}`);
      assert.contains(`email_${user.id}@example.net`);
    });
  });

  module('when administrator click on dissociate button', function() {

    test('should not display registration any more', async function(assert) {
      // given
      const organizationName = 'Organisation_to_dissociate_of';
      const schoolingRegistrationToDissociate = this.server.create('schooling-registration', {
        id: 10,
        organizationName,
      });
      user.schoolingRegistrations.models.push(schoolingRegistrationToDissociate);
      user.save();

      await visit(`/users/${user.id}`);
      await click('button[data-test-dissociate-schooling-registration="10"]');

      // when
      await clickByLabel('Oui, je dissocie');

      // then
      assert.equal(currentURL(), `/users/${user.id}`);
      assert.notContains(organizationName);
    });
  });

  module('when administrator click on remove authentication method button', function() {

    test('should not display remove link and display unchecked icon', async function(assert) {
      // given
      await visit(`/users/${user.id}`);

      // when
      await click('button[data-test-remove-email]');
      await click('.modal-dialog .btn-primary');

      // then
      assert.dom('div[data-test-email] > div > svg').hasClass('user-authentication-method-item__uncheck');
      assert.dom('div[data-test-email] > div > button[data-test-remove-email]').notExists;
    });
  });

});

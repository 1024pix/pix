import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { currentSession } from 'ember-simple-auth/test-support';
import {
  createUserWithMembershipAndTermsOfServiceNotAccepted,
  createUserWithMembershipAndTermsOfServiceAccepted,
  authenticateSession,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | terms-of-service', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  test('it should redirect user to login page if not logged in', async function(assert) {
    // when
    await visit('/cgu');

    // then
    assert.equal(currentURL(), '/connexion');
    assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is still unauthenticated');
  });

  module('When user is authenticated and has not yet accepted terms of service', function(hooks) {

    hooks.beforeEach(async () => {
      user = createUserWithMembershipAndTermsOfServiceNotAccepted();

      await authenticateSession(user.id);
    });

    test('it should send request for saving Pix-certif terms of service acceptation when submitting', async function(assert) {
      // given
      const previousPixCertifTermsOfServiceVal = user.pixCertifTermsOfServiceAccepted;
      await visit('/cgu');

      // when
      await click('button[type=submit]');

      // then
      user.reload();
      const actualPixCertifTermsOfServiceVal = user.pixCertifTermsOfServiceAccepted;
      assert.equal(actualPixCertifTermsOfServiceVal, true);
      assert.equal(previousPixCertifTermsOfServiceVal, false);
    });

    test('it should redirect to session list after saving terms of service acceptation', async function(assert) {
      // given
      await visit('/cgu');

      // when
      await click('button[type=submit]');

      // then
      assert.equal(currentURL(), '/sessions/liste');
    });

    test('it should not be possible to visit another page if cgu are not accepted', async function(assert) {
      // given
      await visit('/cgu');

      // when
      await visit('/campagnes');

      // then
      assert.equal(currentURL(), '/cgu');
    });
  });

  module('When user has already accepted terms of service', function(hooks) {

    hooks.beforeEach(async () => {
      user = createUserWithMembershipAndTermsOfServiceAccepted();

      await authenticateSession(user.id);
    });

    test('it should redirect to session list', async function(assert) {
      // when
      await visit('/cgu');

      // then
      assert.equal(currentURL(), '/sessions/liste');
    });
  });
});

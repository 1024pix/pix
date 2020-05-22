import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import {
  authenticateSession,
  currentSession
} from 'ember-simple-auth/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

import { createPrescriberWithPixOrgaTermsOfService } from '../helpers/test-init';

module('Acceptance | terms-of-service', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let prescriber;

  test('it should redirect user to login page if not logged in', async function(assert) {
    // when
    await visit('/cgu');

    // then
    assert.equal(currentURL(), '/connexion');
    assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is still unauthenticated');
  });

  module('When prescriber has not accepted terms of service yet', function(hooks) {

    hooks.beforeEach(async () => {
      prescriber = createPrescriberWithPixOrgaTermsOfService({ pixOrgaTermsOfServiceAccepted: false });

      await authenticateSession({
        user_id: prescriber.id,
        access_token: 'aaa.' + btoa(`{"user_id":${prescriber.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        expires_in: 3600,
        token_type: 'Bearer token type',
      });
    });

    test('it should redirect to campaign list after saving terms of service acceptation', async function(assert) {
      // given
      await visit('/cgu');

      // when
      await click('button[type=submit]');

      // then
      assert.equal(currentURL(), '/campagnes');
    });

    test('it should logout when user clicks on cancel button', async function(assert) {
      // given
      await visit('/cgu');

      // when
      await click('#terms-of-service-cancel-button');

      // then
      assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is still authenticated');
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

  module('When prescriber has already accepted terms of service', function(hooks) {

    hooks.beforeEach(async () => {
      prescriber = createPrescriberWithPixOrgaTermsOfService({ pixOrgaTermsOfServiceAccepted: true });

      await authenticateSession({
        user_id: prescriber.id,
        access_token: 'aaa.' + btoa(`{"user_id":${prescriber.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        expires_in: 3600,
        token_type: 'Bearer token type',
      });
    });

    test('it should redirect to campaign list', async function(assert) {
      // when
      await visit('/cgu');

      // then
      assert.equal(currentURL(), '/campagnes');
    });
  });
});

import { clickByName } from '@1024pix/ember-testing-library';
import { currentURL, visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupApplicationTest } from 'ember-qunit';
import { currentSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import authenticateSession from '../helpers/authenticate-session';
import { createPrescriberWithPixOrgaTermsOfService } from '../helpers/test-init';

module('Acceptance | terms-of-service', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let prescriber;

  test('redirects user to login page if not logged in', async function (assert) {
    // when
    await visit('/cgu');

    // then
    assert.strictEqual(currentURL(), '/connexion');
    assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is still unauthenticated');
  });

  module('When prescriber has not accepted terms of service yet', function (hooks) {
    hooks.beforeEach(async () => {
      prescriber = createPrescriberWithPixOrgaTermsOfService({ pixOrgaTermsOfServiceAccepted: false });

      await authenticateSession(prescriber.id);
    });

    test('redirects to campaign list after saving terms of service acceptation', async function (assert) {
      // given
      await visit('/cgu');

      // when
      await clickByName('J’accepte les conditions d’utilisation');

      // then
      assert.strictEqual(currentURL(), '/campagnes/les-miennes');
    });

    test('blocks the visit of another page if cgu are not accepted', async function (assert) {
      // given
      await visit('/cgu');

      // when
      await visit('/campagnes');

      // then
      assert.strictEqual(currentURL(), '/cgu');
    });
  });

  module('When prescriber has already accepted terms of service', function (hooks) {
    hooks.beforeEach(async () => {
      prescriber = createPrescriberWithPixOrgaTermsOfService({ pixOrgaTermsOfServiceAccepted: true });

      await authenticateSession(prescriber.id);
    });

    test('redirects to campaign list', async function (assert) {
      // when
      await visit('/cgu');

      // then
      assert.strictEqual(currentURL(), '/campagnes/les-miennes');
    });
  });
});

import { clickByName, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { currentSession } from 'ember-simple-auth/test-support';
import { setupMirage } from 'pix-orga/tests/test-support/setup-mirage';
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
      prescriber = createPrescriberWithPixOrgaTermsOfService({ pixOrgaTermsOfServiceStatus: 'requested' });

      await authenticateSession(prescriber.id);
    });

    [
      {
        locale: 'en',
        title: 'Please accept our Terms of service',
      },
      {
        locale: 'fr',
        title: "Veuillez accepter nos Conditions Générales d'Utilisation (CGU)",
      },
    ].forEach(({ locale, title }) => {
      test(`displays the ${locale} language version of cgu page`, async function (assert) {
        // when
        const screen = await visit(`/cgu?lang=${locale}`);

        // then
        assert.ok(screen.getByRole('heading', { name: title }));
      });
    });

    test('redirects to campaign list after saving terms of service acceptance', async function (assert) {
      // given
      await visit('/cgu');

      // when
      await clickByName('Accepter et continuer');

      // then
      assert.strictEqual(currentURL(), '/');
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
      prescriber = createPrescriberWithPixOrgaTermsOfService({ pixOrgaTermsOfServiceStatus: 'accepted' });

      await authenticateSession(prescriber.id);
    });

    test('redirects to campaign list', async function (assert) {
      // when
      await visit('/cgu');

      // then
      assert.strictEqual(currentURL(), '/');
    });
  });
});

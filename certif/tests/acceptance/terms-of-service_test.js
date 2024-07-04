import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupApplicationTest } from 'ember-qunit';
import { currentSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import {
  authenticateSession,
  createCertificationPointOfContactWithTermsOfServiceAccepted,
  createCertificationPointOfContactWithTermsOfServiceNotAccepted,
} from '../helpers/test-init';

module('Acceptance | terms-of-service', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let certificationPointOfContact;

  test('it should redirect certificationPointOfContact to login page if not logged in', async function (assert) {
    // when
    await visit('/cgu');

    // then
    assert.strictEqual(currentURL(), '/connexion');
    assert.notOk(
      currentSession(this.application).get('isAuthenticated'),
      'The certificationPointOfContact is still unauthenticated',
    );
  });

  module(
    'When certificationPointOfContact is authenticated and has not yet accepted terms of service',
    function (hooks) {
      hooks.beforeEach(async () => {
        certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceNotAccepted();

        await authenticateSession(certificationPointOfContact.id);
      });

      test('it should send request for saving Pix-certif terms of service acceptation when submitting', async function (assert) {
        // given
        const previousPixCertifTermsOfServiceVal = certificationPointOfContact.pixCertifTermsOfServiceAccepted;
        const screen = await visit('/cgu');

        // when
        await click(screen.getByRole('button', { name: 'J’accepte les conditions d’utilisation' }));

        // then
        certificationPointOfContact.reload();
        const actualPixCertifTermsOfServiceVal = certificationPointOfContact.pixCertifTermsOfServiceAccepted;
        assert.true(actualPixCertifTermsOfServiceVal);
        assert.false(previousPixCertifTermsOfServiceVal);
      });

      test('it should redirect to session list after saving terms of service acceptation', async function (assert) {
        // given
        const screen = await visit('/cgu');

        // when
        await click(screen.getByRole('button', { name: 'J’accepte les conditions d’utilisation' }));

        // then
        assert.strictEqual(currentURL(), '/sessions/liste');
      });

      test('it should not be possible to visit another page if cgu are not accepted', async function (assert) {
        // given & when
        await visit('/campagnes');

        // then
        assert.strictEqual(currentURL(), '/cgu');
      });

      module('when cgu registration failed', function () {
        test('it should return error message', async function (assert) {
          // given
          const screen = await visit('/cgu');
          this.server.patch('/users/:id/pix-certif-terms-of-service-acceptance', () => {
            return new Response(500, {}, { errors: [{ status: '500' }] });
          });

          // when
          await click(screen.getByRole('button', { name: 'J’accepte les conditions d’utilisation' }));

          // then
          assert
            .dom(
              screen.getByText(
                'Une erreur interne est survenue, nos équipes sont en train de résoudre le problème. Veuillez réessayer ultérieurement.',
              ),
            )
            .exists();
        });
      });
    },
  );

  module('When certificationPointOfContact has already accepted terms of service', function (hooks) {
    hooks.beforeEach(async () => {
      certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();

      await authenticateSession(certificationPointOfContact.id);
    });

    test('it should redirect to session list', async function (assert) {
      // when
      await visit('/cgu');

      // then
      assert.strictEqual(currentURL(), '/sessions/liste');
    });
  });
});

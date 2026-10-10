import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { currentSession } from 'ember-simple-auth/test-support';
import { setupMirage } from 'pix-certif/tests/test-support/setup-mirage';
import { module, test } from 'qunit';
import sinon from 'sinon';

import {
  authenticateSession,
  createCertificationPointOfContactWithTermsOfServiceAccepted,
  createCertificationPointOfContactWithTermsOfServiceNotAccepted,
} from '../helpers/test-init';

module('Acceptance | terms-of-service', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let certificationPointOfContact;

  test('it redirects certificationPointOfContact to login page if not logged in', async function (assert) {
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

      module('When terms of service model has pixCertifTermsOfServiceDocumentPath property ', function () {
        module('When certificationPointOfContact has never accepted the terms of service', function () {
          test('it displays the new tos page', async function (assert) {
            // given
            const domainService = this.owner.lookup('service:currentDomain');
            sinon.stub(domainService, 'getExtension').returns('org');
            certificationPointOfContact.update({ pixCertifTermsOfServiceDocumentPath: 'pix-certif-tos-2027-01-01' });

            // when
            const screen = await visit('/cgu');

            // then
            assert
              .dom(
                screen.getByRole('heading', { name: "Veuillez accepter nos Conditions Générales d'Utilisation (CGU)" }),
              )
              .exists();
            assert.dom(screen.getByRole('button', { name: 'Accepter et continuer' })).exists();
            assert
              .dom(screen.getByRole('link', { name: 'Lire les conditions d’utilisation' }))
              .hasAttribute('href', 'https://pix.org/fr/pix-certif-tos-2027-01-01');
          });
        });
        module('When certificationPointOfContact has to accept an update of the terms of service', function (hooks) {
          hooks.beforeEach(async () => {
            certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceNotAccepted();
            certificationPointOfContact.update({ pixCertifTermsOfServiceStatus: 'update-requested' });

            await authenticateSession(certificationPointOfContact.id);
          });

          test('it should display the update version of the terms of service page', async function (assert) {
            // when
            const screen = await visit('/cgu');

            // then
            assert
              .dom(
                screen.getByRole('heading', {
                  name: "Mise à jour importante des Conditions Générales d'Utilisation (CGU)",
                }),
              )
              .exists();
          });
        });
      });
      module('When there is no document path', function () {
        test('it displays the deprecated tos page', async function (assert) {
          // given
          certificationPointOfContact.update({ pixCertifTermsOfServiceDocumentPath: null });

          // when
          const screen = await visit('/cgu');

          // then
          assert
            .dom(
              screen.getByRole('heading', { name: "Conditions générales d'utilisation de la plateforme Pix Certif" }),
            )
            .exists();
          assert.dom(screen.getByRole('heading', { name: 'Article 1. Préambule' })).exists();
          assert.dom(screen.getByRole('button', { name: 'J’accepte les conditions d’utilisation' })).exists();
        });
      });

      test('it should send request for saving Pix-certif terms of service acceptance when submitting', async function (assert) {
        // given
        const previousPixCertifTermsOfServiceVal = certificationPointOfContact.pixCertifTermsOfServiceStatus;
        const screen = await visit('/cgu');

        // when
        await click(screen.getByRole('button', { name: 'Accepter et continuer' }));

        // then
        certificationPointOfContact.reload();
        const actualPixCertifTermsOfServiceVal = certificationPointOfContact.pixCertifTermsOfServiceStatus;
        assert.strictEqual(previousPixCertifTermsOfServiceVal, 'requested');
        assert.strictEqual(actualPixCertifTermsOfServiceVal, 'accepted');
      });

      test('it should redirect to session list after saving terms of service acceptance', async function (assert) {
        // given
        const screen = await visit('/cgu');

        // when
        await click(screen.getByRole('button', { name: 'Accepter et continuer' }));

        // then
        assert.strictEqual(currentURL(), '/sessions');
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
          await click(screen.getByRole('button', { name: 'Accepter et continuer' }));

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
      assert.strictEqual(currentURL(), '/sessions');
    });
  });
});

import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupApplicationTest } from 'ember-qunit';
import { currentSession, invalidateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import {
  authenticateSession,
  createCertificationPointOfContactWithTermsOfServiceAccepted,
  createCertificationPointOfContactWithTermsOfServiceNotAccepted,
} from '../helpers/test-init';

module('Acceptance | authentication', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let certificationPointOfContact;

  module('When certificationPointOfContact is not logged in', function () {
    test('it should redirect certificationPointOfContact to login page', async function (assert) {
      // given
      await invalidateSession();

      // when
      await visit('/');

      // then
      assert.strictEqual(currentURL(), '/connexion');
      assert.notOk(
        currentSession(this.application).get('isAuthenticated'),
        'The certificationPointOfContact is still unauthenticated',
      );
    });
  });

  module('When certificationPointOfContact is logging in', function () {
    module('when has not accepted terms of service yet', function () {
      test('it should redirect certificationPointOfContact to the terms-of-service page', async function (assert) {
        // given
        await invalidateSession();
        certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceNotAccepted();

        const screen = await visit('/connexion');
        await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail' }), certificationPointOfContact.email);
        await fillIn(screen.getByLabelText('Mot de passe'), 'secret');

        // when
        await click(screen.getByRole('button', { name: 'Je me connecte' }));

        // then
        assert.strictEqual(currentURL(), '/cgu');
        assert.ok(
          currentSession(this.application).get('isAuthenticated'),
          'The certificationPointOfContact is authenticated',
        );
      });
    });

    module('when has accepted terms of service', function () {
      test('it should redirect certificationPointOfContact to the session list', async function (assert) {
        // given
        await invalidateSession();
        certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();

        const screen = await visit('/connexion');
        await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail' }), certificationPointOfContact.email);
        await fillIn(screen.getByLabelText('Mot de passe'), 'secret');

        // when
        await click(screen.getByRole('button', { name: 'Je me connecte' }));

        // then

        assert.strictEqual(currentURL(), '/sessions/liste');
        assert.ok(
          currentSession(this.application).get('isAuthenticated'),
          'The certificationPointOfContact is authenticated',
        );
      });
    });
  });

  module('When certificationPointOfContact is authenticated', function () {
    module('When has accepted terms of service', function () {
      test('it should let certificationPointOfContact access requested page', async function (assert) {
        // given
        certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
        await authenticateSession(certificationPointOfContact.id);

        // when
        await visit('/sessions/liste');

        // then
        assert.strictEqual(currentURL(), '/sessions/liste');
        assert.ok(
          currentSession(this.application).get('isAuthenticated'),
          'The certificationPointOfContact is authenticated',
        );
      });

      test('it should show the user name, the name and externalId of certification center', async function (assert) {
        // given
        certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted('SUP', 'Centre');
        await authenticateSession(certificationPointOfContact.id);

        // when
        const screen = await visit('/sessions/liste');

        // then
        assert
          .dom(
            screen.getByRole('button', {
              name: 'Harry Cover Centre (ABC123) Ouvrir le menu utilisateur',
            }),
          )
          .exists();
      });

      test('it should redirect certificationPointOfContact to the session list on root url', async function (assert) {
        // given
        certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
        await authenticateSession(certificationPointOfContact.id);

        // when
        await visit('/');

        // then
        assert.strictEqual(currentURL(), '/sessions/liste');
      });
    });

    module('when a lang query param is present', function () {
      test('sets and remembers the locale to the lang query param which wins over the user’s lang', async function (assert) {
        // given
        certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
        await authenticateSession(certificationPointOfContact.id);

        // when
        const screen = await visit('/?lang=en');

        // then
        assert.dom(screen.getByRole('link', { name: 'Invigilator’s Portal' })).exists();
      });
    });
  });
});

import { module, test } from 'qunit';
import { currentURL, click, fillIn } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { currentSession, invalidateSession } from 'ember-simple-auth/test-support';
import {
  createCertificationPointOfContactWithTermsOfServiceNotAccepted,
  createCertificationPointOfContactWithTermsOfServiceAccepted,
  authenticateSession,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

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
        'The certificationPointOfContact is still unauthenticated'
      );
    });
  });

  module('When certificationPointOfContact is logging in', function () {
    module('when has not accepted terms of service yet', function () {
      test('it should redirect certificationPointOfContact to the terms-of-service page', async function (assert) {
        // given
        await invalidateSession();
        certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceNotAccepted();

        await visit('/connexion');
        await fillIn('#login-email', certificationPointOfContact.email);
        await fillIn('#login-password', 'secret');

        // when
        await click('button[type=submit]');

        // then
        assert.strictEqual(currentURL(), '/cgu');
        assert.ok(
          currentSession(this.application).get('isAuthenticated'),
          'The certificationPointOfContact is authenticated'
        );
      });

      test('it should not show menu nor top bar', async function (assert) {
        // given
        await invalidateSession();
        certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceNotAccepted();

        await visit('/connexion');
        await fillIn('#login-email', certificationPointOfContact.email);
        await fillIn('#login-password', 'secret');

        // when
        await click('button[type=submit]');

        // then
        assert.ok(
          currentSession(this.application).get('isAuthenticated'),
          'The certificationPointOfContact is authenticated'
        );

        assert.dom('.app__sidebar').doesNotExist();
        assert.dom('.main-content__topbar').doesNotExist();
      });
    });

    module('when has accepted terms of service', function () {
      test('it should redirect certificationPointOfContact to the session list', async function (assert) {
        // given
        await invalidateSession();
        certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();

        await visit('/connexion');
        await fillIn('#login-email', certificationPointOfContact.email);
        await fillIn('#login-password', 'secret');

        // when
        await click('button[type=submit]');

        // then

        assert.strictEqual(currentURL(), '/sessions/liste');
        assert.ok(
          currentSession(this.application).get('isAuthenticated'),
          'The certificationPointOfContact is authenticated'
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
          'The certificationPointOfContact is authenticated'
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
            })
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

        // when
        await visit('/?lang=en');
        await authenticateSession(certificationPointOfContact.id);
        const screen = await visit('/');

        // then
        assert.dom(screen.getByRole('link', { name: 'Invigilator’s Portal' })).exists();
      });
    });
  });
});

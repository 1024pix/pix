import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
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

  module('When certificationPointOfContact is logging in but has not accepted terms of service yet', function () {
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

  module('When certificationPointOfContact is logging in and has accepted terms of service', function () {
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

    test('it should show certificationPointOfContact name', async function (assert) {
      // given
      await invalidateSession();
      certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();

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
      assert.dom('.logged-user-summary__name').hasText('Harry Cover');
    });
  });

  module('When certificationPointOfContact is already authenticated and has accepted terms of service', function () {
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

    test('it should show the name and externalId of certification center', async function (assert) {
      // given
      certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
      await authenticateSession(certificationPointOfContact.id);

      // when
      await visit('/sessions/liste');

      // then
      assert.dom('.logged-user-summary__certification-center').hasText('Centre de certification du pix (ABC123)');
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
});

import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { fillByLabel, clickByName, visit } from '@1024pix/ember-testing-library';
import authenticateSession from '../helpers/authenticate-session';
import { setupApplicationTest } from 'ember-qunit';
import { currentSession } from 'ember-simple-auth/test-support';
import {
  createUserMembershipWithRole,
  createUserWithMembership,
  createUserWithMembershipAndTermsOfServiceAccepted,
  createPrescriberByUser,
  createPrescriberForOrganization,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | authentication', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function () {
    test('it should redirect user to login page', async function (assert) {
      // when
      await visit('/');

      // then
      assert.strictEqual(currentURL(), '/connexion');
      assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is still unauthenticated');
    });
  });

  module('When prescriber is logging in', function () {
    module('when has not accepted terms of service', function (hooks) {
      let user;

      hooks.beforeEach(async () => {
        user = createUserWithMembership();
        createPrescriberByUser(user);
      });

      test('it should redirect prescriber to the terms-of-service page', async function (assert) {
        // given
        await visit('/connexion');
        await fillByLabel('Adresse e-mail', user.email);
        await fillByLabel('Mot de passe', 'secret');

        // when
        await clickByName('Je me connecte');

        // then
        assert.strictEqual(currentURL(), '/cgu');
        assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
      });

      test('it should not show menu nor top bar', async function (assert) {
        // given
        server.create('campaign');

        await visit('/connexion');
        await fillByLabel('Adresse e-mail', user.email);
        await fillByLabel('Mot de passe', 'secret');

        // when
        await clickByName('Je me connecte');

        // then
        assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');

        assert.dom('.sidebar').doesNotExist();
        assert.dom('.topbar').doesNotExist();
      });
    });

    module('when has accepted terms of service', function (hooks) {
      let user;

      hooks.beforeEach(() => {
        user = createUserWithMembershipAndTermsOfServiceAccepted();
        createPrescriberByUser(user);
      });

      test('it should redirect user to the campaigns list', async function (assert) {
        // given
        server.create('campaign');

        await visit('/connexion');
        await fillByLabel('Adresse e-mail', user.email);
        await fillByLabel('Mot de passe', 'secret');

        // when
        await clickByName('Je me connecte');

        // then
        assert.strictEqual(currentURL(), '/campagnes/les-miennes');
        assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
      });

      test('it should show user name', async function (assert) {
        // given
        server.create('campaign');

        const screen = await visit('/connexion');
        await fillByLabel('Adresse e-mail', user.email);
        await fillByLabel('Mot de passe', 'secret');

        // when
        await clickByName('Je me connecte');

        // then
        assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
        assert.ok(screen.getByText('Harry Cover'));
      });
    });
  });

  module('When prescriber is authenticated', function () {
    module('When the organization has no credits and prescriber is ADMIN', function (hooks) {
      hooks.beforeEach(async () => {
        const user = createPrescriberForOrganization(
          { firstName: 'Harry', lastName: 'Cover', email: 'harry@cover.com', lang: 'fr' },
          { name: 'BRO & Evil Associates' },
          'ADMIN',
        );

        await authenticateSession(user.id);
      });

      test('should not show organization credit info', async function (assert) {
        // when
        await visit('/');
        // then

        assert.dom('.organization-credit-info').doesNotExist();
      });
    });

    module('When prescriber has accepted terms of service', function (hooks) {
      let prescriber;
      hooks.beforeEach(async () => {
        const user = createUserWithMembershipAndTermsOfServiceAccepted();
        prescriber = createPrescriberByUser(user);

        await authenticateSession(user.id);
      });

      module('When the prescriber has the missions management feature', function () {
        test('it should redirect prescriber to missions page', async function (assert) {
          prescriber.features = { ...prescriber.features, MISSIONS_MANAGEMENT: true };
          // when
          await visit('/connexion');

          // then
          assert.strictEqual(currentURL(), '/missions');
          assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
        });
      });
      test('it should redirect prescriber to campaign list page', async function (assert) {
        // when
        await visit('/connexion');

        // then
        assert.strictEqual(currentURL(), '/campagnes/les-miennes');
        assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
      });

      test('it should let prescriber access requested page', async function (assert) {
        // when
        await visit('/campagnes/creation');

        // then
        assert.strictEqual(currentURL(), '/campagnes/creation');
        assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
      });

      test('it should display the organization linked to the connected prescriber', async function (assert) {
        // when
        const screen = await visit('/');

        // then
        assert.ok(screen.getByText('BRO & Evil Associates (EXTBRO)'));
      });

      test('it should redirect prescriber to the campaigns list on root url', async function (assert) {
        // when
        await visit('/');

        // then
        assert.strictEqual(currentURL(), '/campagnes/les-miennes');
      });

      module('when a lang query param is present', function () {
        test('sets and remembers the locale to the lang query param which wins over the user’s lang', async function (assert) {
          // when
          await visit('/?lang=en');
          const screen = await visit('/');

          // then
          assert.ok(screen.getByRole('link', { name: 'Team' }));
        });
      });
    });

    module('When the organization has credits and prescriber is ADMIN', function (hooks) {
      hooks.beforeEach(async () => {
        const user = createPrescriberForOrganization(
          { firstName: 'Harry', lastName: 'Cover', email: 'harry@cover.com', lang: 'fr' },
          { name: 'BRO & Evil Associates', credit: 10000 },
          'ADMIN',
        );

        await authenticateSession(user.id);
      });

      test('should show organization credit info', async function (assert) {
        // when
        await visit('/');
        // then
        assert.ok('.organization-credit-info');
      });
    });

    module('When user is member', function (hooks) {
      hooks.beforeEach(async () => {
        const user = createUserMembershipWithRole('MEMBER');
        createPrescriberByUser(user);

        await authenticateSession(user.id);
      });

      module('When the organization has credits and prescriber is MEMBER', function (hooks) {
        hooks.beforeEach(async () => {
          const user = createPrescriberForOrganization(
            { firstName: 'Harry', lastName: 'Cover', email: 'harry@cover.com', lang: 'fr' },
            { name: 'BRO & Evil Associates', credit: 10000 },
            'MEMBER',
          );

          await authenticateSession(user.id);
        });

        test('should not show credit info', async function (assert) {
          // when
          await visit('/');
          // then
          assert.dom('.organization-credit-info').doesNotExist();
        });
      });
    });

    test('should redirect to main page when trying to access /certifications URL', async function (assert) {
      // given
      const user = createPrescriberForOrganization(
        { firstName: 'Harry', lastName: 'Cover', email: 'harry@cover.com', lang: 'fr' },
        { name: 'BRO & Evil Associates' },
        'ADMIN',
      );

      await authenticateSession(user.id);

      // when
      await visit('/certifications');

      // then
      assert.strictEqual(currentURL(), '/campagnes/les-miennes');
    });
  });
});

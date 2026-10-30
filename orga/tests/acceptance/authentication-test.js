import { clickByName, fillByLabel, visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { currentSession } from 'ember-simple-auth/test-support';
import { setupMirage } from 'pix-orga/tests/test-support/setup-mirage';
import { module, test } from 'qunit';
import sinon from 'sinon';

import authenticateSession from '../helpers/authenticate-session';
import setupIntl from '../helpers/setup-intl';
import {
  createPrescriberByUser,
  createPrescriberForOrganization,
  createUserWithMembership,
  createUserWithMembershipAndTermsOfServiceAccepted,
} from '../helpers/test-init';

module('Acceptance | authentication', function (hooks) {
  setupApplicationTest(hooks);
  setupIntl(hooks);
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
        createPrescriberByUser({ user });
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
        createPrescriberByUser({ user });
      });

      test('it should redirect user to the homepage', async function (assert) {
        // given
        server.create('campaign');

        await visit('/connexion');
        await fillByLabel('Adresse e-mail', user.email);
        await fillByLabel('Mot de passe', 'secret');

        // when
        await clickByName('Je me connecte');

        // then
        assert.strictEqual(currentURL(), '/');
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
    module('When prescriber has accepted terms of service', function (hooks) {
      let prescriber;
      hooks.beforeEach(async () => {
        const user = createUserWithMembershipAndTermsOfServiceAccepted();
        prescriber = createPrescriberByUser({ user });

        await authenticateSession(user.id);
      });

      module('When the prescriber has the missions management feature', function () {
        test('it should redirect prescriber to homepage', async function (assert) {
          prescriber.features = { ...prescriber.features, MISSIONS_MANAGEMENT: { active: true, params: null } };
          // when
          await visit('/connexion');

          // then
          assert.strictEqual(currentURL(), '/');
          assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
        });
      });
      test('it should redirect prescriber to homepage', async function (assert) {
        // when
        await visit('/connexion');

        // then
        assert.strictEqual(currentURL(), '/');
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

    module('When organization has places management feature', function (hooks) {
      let user;
      hooks.beforeEach(async () => {
        user = createPrescriberForOrganization({ lang: 'fr' }, {}, 'MEMBER', {
          PLACES_MANAGEMENT: { active: true, params: null },
        });
        await authenticateSession(user.id);
      });

      test('it should display available places in sidebar', async function (assert) {
        // given
        server.create('organization-place-statistic', { id: user.userOrgaSettings.organization.id, available: 120 });

        // when
        const screen = await visit('/');

        // then
        assert.ok(screen.getByText(t('navigation.places.number', { count: 120 })));
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
      assert.strictEqual(currentURL(), '/');
    });

    module('When prescriber can access missions', function (hooks) {
      let clock, now;
      hooks.beforeEach(function () {
        now = new Date(2024, 5, 12, 14);
        clock = sinon.useFakeTimers({ now, toFake: ['Date'], shouldAdvanceTime: true });
      });

      hooks.afterEach(function () {
        clock.restore();
      });

      test('should display session status', async function (assert) {
        const sessionExpirationDate = new Date(2024, 5, 12, 16);
        const user = createPrescriberForOrganization(
          { lang: 'fr' },
          {
            schoolCode: 'AZERTY',
            sessionExpirationDate,
          },
          'MEMBER',
          {
            MISSIONS_MANAGEMENT: { active: true, params: null },
          },
        );
        await authenticateSession(user.id);

        const screen = await visit('/');

        assert.ok(
          screen.getByText(t('navigation.school-sessions.status.active-label', { sessionExpirationDate: '16:00' })),
        );
      });

      test('should handle starting session', async function (assert) {
        const user = createPrescriberForOrganization(
          { lang: 'fr' },
          {
            schoolCode: 'AZERTY',
            sessionExpirationDate: null,
          },
          'MEMBER',
          {
            MISSIONS_MANAGEMENT: { active: true, params: null },
          },
        );
        await authenticateSession(user.id);

        const screen = await visit('/');
        const navigation = await screen.getByRole('complementary');
        const activateButton = await within(navigation).findByRole('button', {
          name: t('navigation.school-sessions.activate-button'),
        });
        await click(activateButton);

        assert.ok(
          await screen.findByText(
            t('navigation.school-sessions.status.active-label', { sessionExpirationDate: '18:00' }),
          ),
        );
      });
    });
  });
});

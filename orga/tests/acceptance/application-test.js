import { visit } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { setupIntl } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import ENV from 'pix-orga/config/environment';
import PlausibleAdapter from 'pix-orga/metrics-adapters/plausible-adapter';
import { setupMirage } from 'pix-orga/tests/test-support/setup-mirage';
import { module, test } from 'qunit';
import sinon from 'sinon';

import authenticateSession from '../helpers/authenticate-session';
import { createPrescriberByUser, createUserWithMembershipAndTermsOfServiceAccepted } from '../helpers/test-init';

module('Application', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'fr');

  module('analytics', function (hooks) {
    hooks.beforeEach(async function () {
      class MetricServiceStub extends Service {
        trackPage = sinon.stub();
        activateAdapters = sinon.stub();
        context = {};
      }

      this.owner.register('service:metrics', MetricServiceStub);
    });

    test('should activate adapters', async function (assert) {
      // given
      const metricService = this.owner.lookup('service:metrics');

      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser({ user });
      await authenticateSession(user.id);

      // when
      await visit('/campagnes/les-miennes');

      // then
      assert.ok(
        metricService.activateAdapters.calledOnceWithExactly([
          {
            name: 'PlausibleAdapter',
            adapter: PlausibleAdapter,
            environments: ENV.ANALYTICS.ENABLED ? ['all'] : [],
            config: {
              scriptUrl: ENV.ANALYTICS.SCRIPT_URL,
            },
          },
        ]),
      );
    });

    test('should trackPage', async function (assert) {
      // given
      const metricService = this.owner.lookup('service:metrics');

      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser({ user });
      await authenticateSession(user.id);

      // when
      await visit('/campagnes/les-miennes');

      // then
      assert.ok(
        metricService.trackPage.calledOnceWithExactly({
          plausibleAttributes: { u: `${new URL(window.location).origin}/campagnes/les-miennes` },
        }),
      );
    });

    test('should not track redirected page', async function (assert) {
      // given
      const metricService = this.owner.lookup('service:metrics');

      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser({ user });
      await authenticateSession(user.id);

      // when
      await visit('/');

      // then
      assert.ok(metricService.trackPage.calledOnce);
    });

    test('should rewrite id in URL', async function (assert) {
      // given
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser({ user });
      await authenticateSession(user.id);

      server.create('campaign', {
        id: 1,
        ownerId: user.id,
        ownerLastName: user.lastName,
        ownerFirstName: user.firstName,
      });

      const metricService = this.owner.lookup('service:metrics');

      await visit('/campagnes/1/parametres');
      sinon.assert.calledOnceWithExactly(metricService.trackPage, {
        plausibleAttributes: { u: `${new URL(window.location).origin}/campagnes/_ID_/parametres` },
      });
      assert.ok(true);
    });

    test('should ignore unknown route', async function (assert) {
      // given
      const metricService = this.owner.lookup('service:metrics');
      // when
      await visit('/unknown-url');

      // then
      sinon.assert.calledOnceWithExactly(metricService.trackPage, {
        plausibleAttributes: { u: `${new URL(window.location).origin}/connexion` },
      });

      assert.ok(true);
    });

    test('should forward query params', async function (assert) {
      // given
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser({ user });
      await authenticateSession(user.id);

      server.create('campaign', {
        id: 1,
        ownerId: user.id,
        ownerLastName: user.lastName,
        ownerFirstName: user.firstName,
      });

      const metricService = this.owner.lookup('service:metrics');
      server.create('campaign', { id: 1 });

      // when
      await visit('/campagnes/1/resultats-evaluation?groups=["1ere A"]');

      // then
      sinon.assert.calledOnceWithExactly(metricService.trackPage, {
        plausibleAttributes: {
          u: `${new URL(window.location).origin}/campagnes/_ID_/resultats-evaluation?groups=["1ere A"]`,
        },
      });

      assert.ok(true);
    });
  });

  module('When there are no information banners', function () {
    test('it should not display any banner', async function (assert) {
      // given
      server.create('information-banner', 'withoutBanners', { id: 'pix-orga-local' });

      // when
      const screen = await visit(`/`);

      // then
      assert.dom(screen.queryByRole('alert')).doesNotExist();
    });
  });

  module('When there is an information banner', function () {
    test('it should display it', async function (assert) {
      // given
      const banner = server.create('banner', {
        id: 'pix-orga-local:1',
        severity: 'info',
        message: '[en]some text[/en][fr]du texte[/fr]',
      });
      server.create('information-banner', { id: 'pix-orga-local', banners: [banner] });

      // when
      const screen = await visit(`/`);

      // then
      assert.dom(screen.getByRole('alert')).exists();
    });
  });
});

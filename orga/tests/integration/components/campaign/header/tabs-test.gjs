import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import Tabs from 'pix-orga/components/campaign/header/tabs';
import ENV from 'pix-orga/config/environment';
import { EVENT_NAME } from 'pix-orga/constants/metrics-event-name';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Header::Tabs', function (hooks) {
  setupIntlRenderingTest(hooks);

  const originalAppHost = ENV.APP.API_HOST;

  hooks.afterEach(function () {
    ENV.APP.API_HOST = originalAppHost;
  });

  let screen, fileSaver, notifications, access_token, currentUser;

  hooks.beforeEach(function () {
    currentUser = this.owner.lookup('service:current-user');
    class sessionService extends Service {
      isAuthenticated = true;
      data = {
        authenticated: {
          access_token,
        },
      };
    }
    this.owner.register('service:session', sessionService);

    const metrics = this.owner.lookup('service:pix-metrics');
    sinon.stub(metrics, 'trackEvent');

    ENV.APP.API_HOST = 'https://myapp.com';
    access_token = Symbol('ACCESS_TOKEN');

    fileSaver = this.owner.lookup('service:file-saver');
    notifications = this.owner.lookup('service:notifications');
    this.owner.setupRouter();

    sinon.stub(fileSaver, 'save');
    sinon.stub(notifications, 'sendError');

    fileSaver.save.resolves();
  });

  module('Common campaign navigation', function () {
    module('settings item', function () {
      test('it should display campaign settings item', async function (assert) {
        const store = this.owner.lookup('service:store');
        const campaign = store.createRecord('campaign', { id: '12' });
        screen = await render(<template><Tabs @campaign={{campaign}} /></template>);
        const settingsLink = screen.getByRole('link', { name: t('pages.campaign.tab.settings') });

        assert.dom(settingsLink).hasAttribute('href', '/campagnes/12/parametres');
      });

      test('should not display campaign settings item on combined course', async function (assert) {
        const store = this.owner.lookup('service:store');
        const campaign = store.createRecord('campaign', { id: '12', isFromCombinedCourse: true });
        screen = await render(<template><Tabs @campaign={{campaign}} /></template>);
        const settingsLink = screen.queryByRole('link', { name: t('pages.campaign.tab.settings') });

        assert.dom(settingsLink).doesNotExist();
      });
    });

    test('it should display activity item', async function (assert) {
      const store = this.owner.lookup('service:store');
      const campaign = store.createRecord('campaign', { id: '12' });
      screen = await render(<template><Tabs @campaign={{campaign}} /></template>);

      const activityLink = screen.getByRole('link', { name: t('pages.campaign.tab.activity') });
      assert.dom(activityLink).hasAttribute('href', '/campagnes/12');
    });

    test('it should display export button result', async function (assert) {
      const store = this.owner.lookup('service:store');
      const campaign = store.createRecord('campaign', { id: '12' });
      screen = await render(<template><Tabs @campaign={{campaign}} /></template>);

      assert.ok(screen.getByRole('button', { name: t('pages.campaign.actions.export-results') }));
    });

    test('dipslay notification error on data export', async function (assert) {
      const store = this.owner.lookup('service:store');
      const campaign = store.createRecord('campaign', { id: '12' });
      screen = await render(<template><Tabs @campaign={{campaign}} /></template>);

      fileSaver.save.rejects();
      await click(screen.getByRole('button', { name: t('pages.campaign.actions.export-results') }));

      assert.ok(notifications.sendError.calledWithExactly(t('api-error-messages.global')));
    });
  });

  module('When campaign type is ASSESSMENT', function () {
    test('it should display evaluation results item', async function (assert) {
      const store = this.owner.lookup('service:store');
      const campaign = store.createRecord('campaign', {
        id: '13',
        sharedParticipationsCount: 10,
        type: 'ASSESSMENT',
      });
      screen = await render(<template><Tabs @campaign={{campaign}} /></template>);
      const resultsLink = screen.getByRole('link', { name: t('pages.campaign.tab.results', { count: 10 }) });

      assert.dom(resultsLink).hasAttribute('href', '/campagnes/13/resultats-evaluation');
    });

    test('it should display campaign analyse item', async function (assert) {
      const store = this.owner.lookup('service:store');
      const campaign = store.createRecord('campaign', {
        id: '13',
        sharedParticipationsCount: 10,
        type: 'ASSESSMENT',
      });
      screen = await render(<template><Tabs @campaign={{campaign}} /></template>);
      const resultsLink = screen.getByRole('link', { name: t('pages.campaign.tab.review') });

      assert.dom(resultsLink).hasAttribute('href', '/campagnes/13/analyse');
    });

    test('it should call export result with right context', async function (assert) {
      const store = this.owner.lookup('service:store');
      const campaign = store.createRecord('campaign', {
        id: '13',
        sharedParticipationsCount: 10,
        type: 'ASSESSMENT',
      });
      screen = await render(<template><Tabs @campaign={{campaign}} /></template>);
      await click(screen.getByRole('button', { name: t('pages.campaign.actions.export-results') }));

      assert.ok(notifications.sendError.notCalled);
      assert.ok(
        fileSaver.save.calledWithExactly({
          url: `${ENV.APP.API_HOST}/api/campaigns/13/csv-assessment-results`,
          token: access_token,
        }),
      );
    });

    module('when has reached maximum places limit is true', function (hooks) {
      hooks.beforeEach(function () {
        sinon.stub(currentUser, 'organizationPlaceStatistics').value({ hasReachedMaximumPlacesLimit: true });
      });

      test('it should display disabled evaluation results item', async function (assert) {
        const store = this.owner.lookup('service:store');
        const campaign = store.createRecord('campaign', {
          id: '13',
          sharedParticipationsCount: 10,
          type: 'ASSESSMENT',
        });
        screen = await render(<template><Tabs @campaign={{campaign}} /></template>);
        const resultsLink = screen.getByRole('link', { name: t('pages.campaign.tab.results', { count: 10 }) });

        assert.dom(resultsLink).hasAttribute('href', '/campagnes/13/resultats-evaluation');
        assert.dom(resultsLink).hasClass('disabled');
      });

      test('it should display disabled campaign analyse item', async function (assert) {
        const store = this.owner.lookup('service:store');
        const campaign = store.createRecord('campaign', {
          id: '13',
          sharedParticipationsCount: 10,
          type: 'ASSESSMENT',
        });
        screen = await render(<template><Tabs @campaign={{campaign}} /></template>);
        const resultsLink = screen.getByRole('link', { name: t('pages.campaign.tab.review') });

        assert.dom(resultsLink).hasAttribute('href', '/campagnes/13/analyse');
        assert.dom(resultsLink).hasClass('disabled');
      });

      test('it should disable download campaign result button', async function (assert) {
        const store = this.owner.lookup('service:store');
        const campaign = store.createRecord('campaign', {
          id: '13',
          sharedParticipationsCount: 10,
          type: 'ASSESSMENT',
        });
        screen = await render(<template><Tabs @campaign={{campaign}} /></template>);
        const downloadResultButton = screen.getByRole('button', { name: t('pages.campaign.actions.export-results') });

        assert.dom(downloadResultButton).hasAttribute('aria-disabled', 'true');
      });
    });
  });

  module('When campaign type is PROFILES_COLLECTION', function () {
    test('it should display  profile results item', async function (assert) {
      const store = this.owner.lookup('service:store');
      const campaign = store.createRecord('campaign', {
        id: '13',
        type: 'PROFILES_COLLECTION',
        sharedParticipationsCount: 6,
      });
      screen = await render(<template><Tabs @campaign={{campaign}} /></template>);
      const resultsLink = screen.getByRole('link', { name: t('pages.campaign.tab.results', { count: 6 }) });

      assert.dom(resultsLink).hasAttribute('href', '/campagnes/13/profils');
    });

    test('it should not display analyse item', async function (assert) {
      const store = this.owner.lookup('service:store');
      const campaign = store.createRecord('campaign', {
        id: '13',
        type: 'PROFILES_COLLECTION',
        sharedParticipationsCount: 6,
      });
      screen = await render(<template><Tabs @campaign={{campaign}} /></template>);
      assert.notOk(screen.queryByRole('link', { name: t('pages.campaign.tab.review') }));
    });

    test('it should call export result with right context', async function (assert) {
      const store = this.owner.lookup('service:store');
      const campaign = store.createRecord('campaign', {
        id: '13',
        type: 'PROFILES_COLLECTION',
        sharedParticipationsCount: 6,
      });
      screen = await render(<template><Tabs @campaign={{campaign}} /></template>);
      await click(screen.getByRole('button', { name: t('pages.campaign.actions.export-results') }));

      assert.ok(notifications.sendError.notCalled);
      assert.ok(
        fileSaver.save.calledWithExactly({
          url: `${ENV.APP.API_HOST}/api/campaigns/13/csv-profiles-collection-results`,
          token: access_token,
        }),
      );
    });

    test('it should push analytic event when user clicks on export button', async function (assert) {
      const pixMetrics = this.owner.lookup('service:pix-metrics');

      const store = this.owner.lookup('service:store');
      const campaign = store.createRecord('campaign', {
        id: '13',
        type: 'PROFILES_COLLECTION',
        sharedParticipationsCount: 6,
      });
      const screen = await render(<template><Tabs @campaign={{campaign}} /></template>);

      // when
      await click(screen.getByRole('button', { name: t('pages.campaign.actions.export-results') }));

      sinon.assert.calledWithExactly(pixMetrics.trackEvent, EVENT_NAME.CAMPAIGN.EXPORT_DATA_CLICK);
      assert.ok(true);
    });

    module('when has reach maximum places is true', function (hooks) {
      hooks.beforeEach(function () {
        sinon.stub(currentUser, 'organizationPlaceStatistics').value({ hasReachedMaximumPlacesLimit: true });
      });

      test('it should display disabled profile results item', async function (assert) {
        const store = this.owner.lookup('service:store');
        const campaign = store.createRecord('campaign', {
          id: '13',
          type: 'PROFILES_COLLECTION',
          sharedParticipationsCount: 6,
        });
        screen = await render(<template><Tabs @campaign={{campaign}} /></template>);
        const resultsLink = screen.getByRole('link', { name: t('pages.campaign.tab.results', { count: 6 }) });

        assert.dom(resultsLink).hasAttribute('href', '/campagnes/13/profils');
        assert.dom(resultsLink).hasClass('disabled');
      });

      test('it should display a disabled download campaign result button', async function (assert) {
        const store = this.owner.lookup('service:store');
        const campaign = store.createRecord('campaign', {
          id: '13',
          type: 'PROFILES_COLLECTION',
          sharedParticipationsCount: 6,
        });
        screen = await render(<template><Tabs @campaign={{campaign}} /></template>);
        const downloadResultButton = screen.getByRole('button', { name: t('pages.campaign.actions.export-results') });

        assert.dom(downloadResultButton).hasAttribute('aria-disabled', 'true');
      });
    });
  });
});

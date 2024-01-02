import { module, test } from 'qunit';
import { click } from '@ember/test-helpers';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import ENV from 'pix-orga/config/environment';
import Service from '@ember/service';

module('Integration | Component | Campaign::Header::Tabs', function (hooks) {
  setupIntlRenderingTest(hooks);

  const originalAppHost = ENV.APP.API_HOST;

  hooks.afterEach(function () {
    ENV.APP.API_HOST = originalAppHost;
  });

  let store, screen, fileSaver, notifications, access_token;

  hooks.beforeEach(function () {
    class sessionService extends Service {
      isAuthenticated = true;
      data = {
        authenticated: {
          access_token,
        },
      };
    }
    this.owner.register('service:session', sessionService);

    ENV.APP.API_HOST = 'https://myapp.com';
    access_token = Symbol('ACCESS_TOKEN');
    store = this.owner.lookup('service:store');
    this.owner.lookup('service:current-user');
    fileSaver = this.owner.lookup('service:file-saver');
    notifications = this.owner.lookup('service:notifications');
    this.owner.setupRouter();

    sinon.stub(fileSaver, 'save');
    sinon.stub(notifications, 'sendError');

    fileSaver.save.resolves();
  });

  module('Common campaign navigation', function (hooks) {
    hooks.beforeEach(async function () {
      this.campaign = store.createRecord('campaign', { id: 12 });
      screen = await render(hbs`<Campaign::Header::Tabs @campaign={{this.campaign}} />`);
    });

    test('it should display campaign settings item', async function (assert) {
      const settingsLink = screen.getByRole('link', { name: this.intl.t('pages.campaign.tab.settings') });

      assert.dom(settingsLink).hasAttribute('href', '/campagnes/12/parametres');
    });

    test('it should display activity item', async function (assert) {
      const activityLink = screen.getByRole('link', { name: this.intl.t('pages.campaign.tab.activity') });
      assert.dom(activityLink).hasAttribute('href', '/campagnes/12');
    });

    test('it should display export button result', async function (assert) {
      assert.ok(screen.getByRole('button', { name: this.intl.t('pages.campaign.actions.export-results') }));
    });

    test('dipslay notification error on data export', async function (assert) {
      fileSaver.save.rejects();
      await click(screen.getByRole('button', { name: this.intl.t('pages.campaign.actions.export-results') }));

      assert.ok(notifications.sendError.calledWithExactly(this.intl.t('api-error-messages.global')));
    });
  });

  module('When campaign type is ASSESSMENT', function (hooks) {
    hooks.beforeEach(async function () {
      this.campaign = store.createRecord('campaign', {
        id: 13,
        sharedParticipationsCount: 10,
        type: 'ASSESSMENT',
      });

      screen = await render(hbs`<Campaign::Header::Tabs @campaign={{this.campaign}} />`);
    });

    test('it should display evaluation results item', async function (assert) {
      const resultsLink = screen.getByRole('link', { name: this.intl.t('pages.campaign.tab.results', { count: 10 }) });

      assert.dom(resultsLink).hasAttribute('href', '/campagnes/13/resultats-evaluation');
    });

    test('it should display campaign analyse item', async function (assert) {
      const resultsLink = screen.getByRole('link', { name: this.intl.t('pages.campaign.tab.review') });

      assert.dom(resultsLink).hasAttribute('href', '/campagnes/13/analyse');
    });

    test('it should call export result with right context', async function (assert) {
      await click(screen.getByRole('button', { name: this.intl.t('pages.campaign.actions.export-results') }));

      assert.ok(notifications.sendError.notCalled);
      assert.ok(
        fileSaver.save.calledWithExactly({
          url: `${ENV.APP.API_HOST}/api/campaigns/13/csv-assessment-results`,
          token: access_token,
        }),
      );
    });
  });

  module('When campaign type is PROFILES_COLLECTION', function (hooks) {
    hooks.beforeEach(async function () {
      // given
      this.campaign = store.createRecord('campaign', {
        id: 13,
        type: 'PROFILES_COLLECTION',
        sharedParticipationsCount: 6,
      });

      screen = await render(hbs`<Campaign::Header::Tabs @campaign={{this.campaign}} />`);
    });

    test('it should display  profile results item', async function (assert) {
      const resultsLink = screen.getByRole('link', { name: this.intl.t('pages.campaign.tab.results', { count: 6 }) });

      assert.dom(resultsLink).hasAttribute('href', '/campagnes/13/profils');
    });

    test('it should not display analyse item', async function (assert) {
      assert.notOk(screen.queryByRole('link', { name: this.intl.t('pages.campaign.tab.review') }));
    });

    test('it should call export result with right context', async function (assert) {
      await click(screen.getByRole('button', { name: this.intl.t('pages.campaign.actions.export-results') }));

      assert.ok(notifications.sendError.notCalled);
      assert.ok(
        fileSaver.save.calledWithExactly({
          url: `${ENV.APP.API_HOST}/api/campaigns/13/csv-profiles-collection-results`,
          token: access_token,
        }),
      );
    });
  });
});

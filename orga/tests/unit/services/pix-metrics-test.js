import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | PixMetrics', function (hooks) {
  setupTest(hooks);

  let pixMetricsService;
  let metricsService;
  let routerService;

  hooks.beforeEach(function () {
    pixMetricsService = this.owner.lookup('service:pix-metrics');
    metricsService = this.owner.lookup('service:metrics');
    routerService = this.owner.lookup('service:router');
    sinon.stub(metricsService, 'trackPage');
    sinon.stub(metricsService, 'trackEvent');
  });

  module('trackPage', function () {
    test('it should redact id from url', function (assert) {
      // given
      const currentURL = '/campagnes/SCOASSMUL/presentation';
      const currentRoute = {
        name: 'campaigns.campaign-landing-page',
        params: {},
        parent: {
          name: 'campaigns',
          params: {
            id: 'SCOASSMUL',
          },
          parent: {
            name: 'application',
            params: {},
            parent: null,
          },
        },
      };
      sinon.stub(routerService, 'currentRoute').value(currentRoute);
      sinon.stub(routerService, 'currentURL').value(currentURL);

      // when
      pixMetricsService.trackPage({ params: 1 });

      // then
      sinon.assert.calledOnceWithExactly(metricsService.trackPage, {
        plausibleAttributes: { u: `${new URL(window.location).origin}/campagnes/_ID_/presentation` },
        params: 1,
      });
      assert.ok(true);
    });
    test('it should forward query parameters', function (assert) {
      // given
      const currentURL = '/assessments/1234/checkpoint?finalCheckpoint=true';
      const currentRoute = {
        name: 'assessments.checkpoint',
        params: {},
        parent: {
          name: 'assessments',
          params: {
            id: '1234',
          },

          parent: {
            name: 'application',
            params: {},
            parent: null,
          },
        },
      };
      sinon.stub(routerService, 'currentRoute').value(currentRoute);
      sinon.stub(routerService, 'currentURL').value(currentURL);

      // when
      pixMetricsService.trackPage({ params: 1 });

      // then
      sinon.assert.calledOnceWithExactly(metricsService.trackPage, {
        plausibleAttributes: {
          u: `${new URL(window.location).origin}/assessments/_ID_/checkpoint?finalCheckpoint=true`,
        },
        params: 1,
      });
      assert.ok(true);
    });
  });
  module('trackEvent', function () {
    test('it should redact id from url', function (assert) {
      // given
      const currentURL = '/campagnes/SCOASSMUL/presentation';
      const currentRoute = {
        name: 'campaigns.campaign-landing-page',
        params: {},
        parent: {
          name: 'campaigns',
          params: {
            id: 'SCOASSMUL',
          },
          parent: {
            name: 'application',
            params: {},
            parent: null,
          },
        },
      };
      sinon.stub(routerService, 'currentRoute').value(currentRoute);
      sinon.stub(routerService, 'currentURL').value(currentURL);

      // when
      pixMetricsService.trackEvent('mon-event', { params: 1 });

      // then
      sinon.assert.calledOnceWithExactly(metricsService.trackEvent, {
        eventName: 'mon-event',
        plausibleAttributes: { u: `${new URL(window.location).origin}/campagnes/_ID_/presentation` },
        params: 1,
      });
      assert.ok(true);
    });

    test('it should forward query parameters', function (assert) {
      // given
      const currentURL = '/assessments/1234/checkpoint?finalCheckpoint=true';
      const currentRoute = {
        name: 'assessments.checkpoint',
        params: {},
        parent: {
          name: 'assessments',
          params: {
            id: '1234',
          },

          parent: {
            name: 'application',
            params: {},
            parent: null,
          },
        },
      };
      sinon.stub(routerService, 'currentRoute').value(currentRoute);
      sinon.stub(routerService, 'currentURL').value(currentURL);

      // when
      pixMetricsService.trackEvent('mon-event', { params: 1 });

      // then
      sinon.assert.calledOnceWithExactly(metricsService.trackEvent, {
        eventName: 'mon-event',
        plausibleAttributes: {
          u: `${new URL(window.location).origin}/assessments/_ID_/checkpoint?finalCheckpoint=true`,
        },
        params: 1,
      });
      assert.ok(true);
    });
  });
});

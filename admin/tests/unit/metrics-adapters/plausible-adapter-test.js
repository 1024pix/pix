import { setupTest } from 'ember-qunit';
import PlausibleAdapter from 'pix-admin/metrics-adapters/plausible-adapter';
import { module, test } from 'qunit';
import sinon from 'sinon';
module('Unit | MetricsAdapter | plausible-adapter', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    const config = {
      scriptUrl: 'https://plausible.io/js/script.manual.js',
      siteId: 'review.pix.fr',
    };

    this.adapter = new PlausibleAdapter(config);
    this.adapter.install();
  });

  hooks.afterEach(function () {
    sinon.restore(); // must restore before uninstall, which deletes window.plausible
    this.adapter.uninstall();
  });

  test('#install installs container correctly', function (assert) {
    const script = document.querySelector('script[src*="plausible"]');
    assert.strictEqual(script.getAttribute('src'), 'https://plausible.io/js/script.manual.js');
    assert.strictEqual(script.getAttribute('data-domain'), 'review.pix.fr');
  });

  test('#trackEvent calls Plausible with the right arguments', function (assert) {
    const stub = sinon.stub(window, 'plausible').callsFake(() => {
      return true;
    });

    this.adapter.trackEvent({
      'pix-event-category': 'button',
      'pix-event-action': 'click',
      eventName: 'nav buttons',
      'pix-event-value': 4,
    });
    assert.ok(
      stub.calledWith('nav buttons', {
        props: {
          'pix-event-category': 'button',
          'pix-event-action': 'click',
          'pix-event-value': 4,
        },
      }),
      'it sends the correct arguments',
    );
  });

  test('#trackEvent calls Plausible with the overriden plausible props', function (assert) {
    const stub = sinon.stub(window, 'plausible').callsFake(() => {
      return true;
    });

    this.adapter.trackEvent({
      'pix-event-category': 'button',
      'pix-event-action': 'click',
      eventName: 'nav buttons',
      'pix-event-value': 4,
      plausibleAttributes: { u: 'hello' },
    });
    assert.ok(
      stub.calledWith('nav buttons', {
        u: 'hello',
        props: {
          'pix-event-category': 'button',
          'pix-event-action': 'click',
          'pix-event-value': 4,
        },
      }),
      'it sends the correct arguments',
    );
  });

  test('#trackPage calls Plausible with the right arguments', function (assert) {
    const stub = sinon.stub(window, 'plausible').callsFake(() => {
      return true;
    });

    this.adapter.trackPage({
      page: '/my-overridden-page?id=1',
    });
    sinon.assert.calledOnceWithExactly(stub, 'pageview', { props: { page: '/my-overridden-page?id=1' } });
    assert.ok(
      stub.calledWith('pageview', { props: { page: '/my-overridden-page?id=1' } }),
      'it sends the correct arguments',
    );
  });

  test('#trackPage calls Plausible with the overriden plausible props', function (assert) {
    const stub = sinon.stub(window, 'plausible').callsFake(() => {
      return true;
    });

    this.adapter.trackPage({ plausibleAttributes: { u: '/page/_ID_/test?id=1' }, page: 'page' });
    assert.ok(
      stub.calledWith('pageview', { u: '/page/_ID_/test?id=1', props: { page: 'page' } }),
      'it sends the correct arguments',
    );
  });
});

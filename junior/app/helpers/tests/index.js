import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest as upstreamSetupRenderingTest, setupTest as upstreamSetupTest } from 'ember-qunit';

// This file exists to provide wrappers around ember-qunit's / ember-mocha's
// test setup functions. This way, you can easily extend the setup that is
// needed per test type.

function setupRenderingTest(hooks, options) {
  upstreamSetupRenderingTest(hooks, options);

  setupIntl(hooks, 'fr');
}

function setupTest(hooks, options) {
  upstreamSetupTest(hooks, options);
}

export { setupRenderingTest, setupTest, t };

import { setupRenderingTest as upstreamSetupRenderingTest, setupTest as upstreamSetupTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';

// This file exists to provide wrappers around ember-qunit's / ember-mocha's
// test setup functions. This way, you can easily extend the setup that is
// needed per test type.

function setupRenderingTest(hooks, options) {
  upstreamSetupRenderingTest(hooks, options);

  // Additional setup for rendering tests can be done here.
  setupIntl(hooks); // ember-intl
}

function setupTest(hooks, options) {
  upstreamSetupTest(hooks, options);

  // Additional setup for unit tests can be done here.
}

export { setupRenderingTest, setupTest };

import { getContext } from '@ember/test-helpers';
import { setupIntl } from 'ember-intl/test-support';
import {
  setupApplicationTest as upstreamSetupApplicationTest,
  setupRenderingTest,
  setupTest as upstreamSetupTest,
} from 'ember-qunit';
import { setupMirage } from 'junior/tests/test-support/setup-mirage';
import translationsForFr from 'virtual:ember-intl/translations/fr';

// This file exists to provide wrappers around ember-qunit's
// test setup functions. This way, you can easily extend the setup that is
// needed per test type.

function setupTranslations(hooks) {
  hooks.beforeEach(function () {
    const intl = this.owner.lookup('service:intl');
    intl.addTranslations('fr', translationsForFr);
  });
  setupIntl(hooks, 'fr'); // ember-intl
}

function setupApplicationTest(hooks, options) {
  upstreamSetupApplicationTest(hooks, options);

  // Additional setup for application tests can be done here.
  //
  // For example, if you need an authenticated session for each
  // application test, you could do:
  //
  // hooks.beforeEach(async function () {
  //   await authenticateSession(); // ember-simple-auth
  // });
  //
  // This is also a good place to call test setup functions coming
  // from other addons:
  setupTranslations(hooks);
  setupMirage(hooks); // ember-cli-mirage
}

function setupTest(hooks, options) {
  upstreamSetupTest(hooks, options);

  // Additional setup for unit tests can be done here.
}

export default function setupIntlRenderingTest(hooks) {
  setupRenderingTest(hooks);
  setupTranslations(hooks);
}

export function t(key, options) {
  const intl = getContext().owner.lookup('service:intl');
  if (!intl.exists(key)) {
    throw new Error(`Missing translation for key "${key}"`);
  }
  return intl.t(key, options);
}

export { setupApplicationTest, setupIntlRenderingTest, setupRenderingTest, setupTest };

import { setApplication } from '@ember/test-helpers';
import { clearAllCookies } from 'ember-cookies/test-support';
import { start as startEmberExam } from 'ember-exam/addon-test-support';
import { setupEmberOnerrorValidation } from 'ember-qunit';
import Application from 'pix-orga/app';
import config from 'pix-orga/config/environment';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';
import sinon from 'sinon';

export async function start(options) {
  // Set default browser locale
  const BROWSER_LOCALE = 'fr';
  Object.defineProperty(window.navigator, 'language', { value: BROWSER_LOCALE, configurable: true });
  Object.defineProperty(window.navigator, 'languages', { value: [BROWSER_LOCALE], configurable: true });

  // Reset all cookies before each test to avoid side-effects
  QUnit.hooks.beforeEach(function () {
    clearAllCookies();
  });

  // Restore all sinon stubs after each test to avoid side-effects
  QUnit.hooks.afterEach(function () {
    sinon.restore();
  });

  setApplication(Application.create(config.APP));

  setup(QUnit.assert);
  setupEmberOnerrorValidation();
  // Options passed to `start` will be passed-through to ember-qunit
  await startEmberExam(options);
}

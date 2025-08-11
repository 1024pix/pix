import { setApplication } from '@ember/test-helpers';
import { clearAllCookies } from 'ember-cookies/test-support';
import start from 'ember-exam/test-support/start';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';

import Application from '../app';
import config from '../config/environment';

// Set default browser locale
const BROWSER_LOCALE = 'fr';
Object.defineProperty(window.navigator, 'language', { value: BROWSER_LOCALE, configurable: true });
Object.defineProperty(window.navigator, 'languages', { value: [BROWSER_LOCALE], configurable: true });

// Reset all cookies before each test to avoid side-effects
QUnit.hooks.beforeEach(function () {
  clearAllCookies();
});

setApplication(Application.create(config.APP));
setup(QUnit.assert);
start();

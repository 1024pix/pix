import { setApplication } from '@ember/test-helpers';
import { clearAllCookies } from 'ember-cookies/test-support';
import { start as startEmberExam } from 'ember-exam/test-support';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';

import Application from 'pix-certif/app';
import config from 'pix-certif/config/environment';

const BROWSER_LOCALE = 'fr';
Object.defineProperty(window.navigator, 'language', { value: BROWSER_LOCALE, configurable: true });
Object.defineProperty(window.navigator, 'languages', { value: [BROWSER_LOCALE], configurable: true });

QUnit.hooks.beforeEach(function () {
  clearAllCookies();
});

export async function start() {
  setApplication(Application.create(config.APP));
  setup(QUnit.assert);
  await startEmberExam();
}
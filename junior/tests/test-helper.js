import { setApplication } from '@ember/test-helpers';
import { start as startEmberExam } from 'ember-exam/addon-test-support';
import { setupEmberOnerrorValidation } from 'ember-qunit';
import Application from 'junior/app';
import config from 'junior/config/environment';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';
import sinon from 'sinon';

export async function start(options) {
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

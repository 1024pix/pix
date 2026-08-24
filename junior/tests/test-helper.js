import '@warp-drive/ember/install';

import { setApplication } from '@ember/test-helpers';
import start from 'ember-exam/test-support/start';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';
import sinon from 'sinon';

import Application from '../app';
import config from '../config/environment';

QUnit.hooks.afterEach(function () {
  sinon.restore();
});

setApplication(Application.create(config.APP));
setup(QUnit.assert);
start();

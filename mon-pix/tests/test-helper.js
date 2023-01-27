import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import * as QUnit from 'qunit';
import start from 'ember-exam/test-support/start';
import { setup } from 'qunit-dom';

setApplication(Application.create(config.APP));
setup(QUnit.assert);
start();

import Application from 'pix-admin/app';
import config from 'pix-admin/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';
import loadEmberExam from 'ember-exam/test-support/load';

loadEmberExam();

setup(QUnit.assert);

setApplication(Application.create(config.APP));

start();

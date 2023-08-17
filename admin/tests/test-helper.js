import { setApplication } from '@ember/test-helpers';
import loadEmberExam from 'ember-exam/test-support/load';
import { start } from 'ember-qunit';
import Application from 'pix-admin/app';
import config from 'pix-admin/config/environment';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';

loadEmberExam();

setup(QUnit.assert);

setApplication(Application.create(config.APP));

start();

import Application from 'pix-admin/app';
import config from 'pix-admin/config/environment';
import { setApplication } from '@ember/test-helpers';
import start from 'ember-exam/test-support/start';

setApplication(Application.create(config.APP));

start();


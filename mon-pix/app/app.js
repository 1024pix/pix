import './deprecation-workflow';
import '@1024pix/epreuves-components';
import '@formatjs/intl-durationformat/polyfill.js';

import Application from '@ember/application';
import setupInspector from '@embroider/legacy-inspector-support/ember-source-4.12';
import { init as initSentry } from '@sentry/ember';
import loadInitializers from 'ember-load-initializers';
import Resolver from 'ember-resolver';
import config from 'mon-pix/config/environment';

if (config.sentry.enabled) {
  initSentry();
}

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;

  inspector = setupInspector(this);
}

loadInitializers(App, config.modulePrefix);

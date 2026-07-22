import './deprecation-workflow.js';

import Application from '@ember/application';
import setupInspector from '@embroider/legacy-inspector-support/ember-source-4.12';
import loadInitializers from 'ember-load-initializers';
import config from 'pix-admin/config/environment';

import Resolver from './resolver';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;

  inspector = setupInspector(this);
}

loadInitializers(App, config.modulePrefix);

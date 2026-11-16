import './deprecation-workflow.js';
import '@warp-drive/ember/install';

import Application from '@ember/application';
import setupInspector from '@embroider/legacy-inspector-support/ember-source-4.12';
import compatModules from '@embroider/virtual/compat-modules';
import { setBuildURLConfig } from '@warp-drive/utilities/json-api';
import loadInitializers from 'ember-load-initializers';

import config from './config/environment';
import Resolver from './resolver';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver.withModules(compatModules);

  inspector = setupInspector(this);
}

setBuildURLConfig({
  namespace: 'api/admin',
});

loadInitializers(App, config.modulePrefix, compatModules);

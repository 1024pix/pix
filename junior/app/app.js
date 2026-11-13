import '@1024pix/epreuves-components';
import '@warp-drive/ember/install';
import './deprecation-workflow.js';

import Application from '@ember/application';
import setupInspector from '@embroider/legacy-inspector-support/ember-source-4.12';
import compatModules from '@embroider/virtual/compat-modules';
import { setBuildURLConfig } from '@warp-drive/utilities/json-api';
import loadInitializers from 'ember-load-initializers';
import Resolver from 'ember-resolver';

import config from './config/environment';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  Resolver = Resolver.withModules(compatModules);
  inspector = setupInspector(this);
}

setBuildURLConfig({
  namespace: 'api/pix1d',
});

loadInitializers(App, config.modulePrefix, compatModules);

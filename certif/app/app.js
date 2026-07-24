import './deprecation-workflow';
import '@warp-drive/ember/install';

import Application from '@ember/application';
import { setBuildURLConfig } from '@warp-drive/utilities/json-api';
import loadInitializers from 'ember-load-initializers';
import Resolver from 'ember-resolver';
import config from 'pix-certif/config/environment';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

setBuildURLConfig({
  namespace: 'api',
});

loadInitializers(App, config.modulePrefix);

import '@1024pix/epreuves-components';
import '@warp-drive/ember/install';

import Application from '@ember/application';
import { setBuildURLConfig } from '@warp-drive/utilities/json-api';
import loadInitializers from 'ember-load-initializers';
import Resolver from 'ember-resolver';
import config from 'junior/config/environment';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  Resolver = Resolver;
}

setBuildURLConfig({
  namespace: 'api/pix1d',
});

loadInitializers(App, config.modulePrefix);

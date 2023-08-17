import Application from '@ember/application';
import { dom, library } from '@fortawesome/fontawesome-svg-core';
import Inflector from 'ember-inflector';
import loadInitializers from 'ember-load-initializers';
import config from 'pix-admin/config/environment';

import { fapixPersonExport, fapixTachometer } from './custom-icons';
import Resolver from './resolver';

class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

Inflector.inflector.irregular('badge-criterion', 'badge-criteria');

library.add(fapixTachometer, fapixPersonExport);
dom.watch();

loadInitializers(App, config.modulePrefix);

export default App;

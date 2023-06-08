import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from 'pix-admin/config/environment';
import Inflector from 'ember-inflector';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { fapixTachometer, fapixPersonExport } from './custom-icons';

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

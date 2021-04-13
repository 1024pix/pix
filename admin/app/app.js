import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from 'pix-admin/config/environment';
import Inflector from 'ember-inflector';

class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

Inflector.inflector.irregular('badge-criterion', 'badge-criteria');

loadInitializers(App, config.modulePrefix);

export default App;

import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

export default class App extends Application {
  constructor() {
    super(...arguments);
    this.modulePrefix = config.modulePrefix;
    this.podModulePrefix = config.podModulePrefix;
    this.Resolver = Resolver;
  }
}

loadInitializers(App, config.modulePrefix);

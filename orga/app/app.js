import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { fapixTachometer, fapixPersonExport, fapixInboxIn, fapixTicket } from './custom-icons';
import '@formatjs/intl-locale/polyfill';
import '@formatjs/intl-pluralrules/polyfill';
import '@formatjs/intl-pluralrules/locale-data/en';
import '@formatjs/intl-pluralrules/locale-data/fr';
import '@formatjs/intl-getcanonicallocales/polyfill';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

library.add(fapixTachometer, fapixPersonExport, fapixInboxIn, fapixTicket);
dom.watch();

loadInitializers(App, config.modulePrefix);

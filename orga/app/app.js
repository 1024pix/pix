import '@formatjs/intl-locale/polyfill';
import '@formatjs/intl-pluralrules/polyfill';
import '@formatjs/intl-pluralrules/locale-data/en';
import '@formatjs/intl-pluralrules/locale-data/fr';
import '@formatjs/intl-getcanonicallocales/polyfill';

import Application from '@ember/application';
import { dom, library } from '@fortawesome/fontawesome-svg-core';
import loadInitializers from 'ember-load-initializers';
import Resolver from 'ember-resolver';

import config from './config/environment';
import { fapixInboxIn, fapixPersonExport, fapixTachometer } from './custom-icons';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

library.add(fapixTachometer, fapixPersonExport, fapixInboxIn);
dom.watch();

loadInitializers(App, config.modulePrefix);

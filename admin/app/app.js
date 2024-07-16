import 'flatpickr';
import 'flatpickr/dist/l10n';

import Application from '@ember/application';
import { dom, library } from '@fortawesome/fontawesome-svg-core';
import loadInitializers from 'ember-load-initializers';
import config from 'pix-admin/config/environment';

import { fapixPersonExport, fapixTachometer } from './custom-icons';
import Resolver from './resolver';

class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

library.add(fapixTachometer, fapixPersonExport);
dom.watch();

loadInitializers(App, config.modulePrefix);

export default App;

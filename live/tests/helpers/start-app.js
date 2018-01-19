import Application from '../../app';
import config from '../../config/environment';
import { run } from '@ember/runloop';
import { merge } from '@ember/polyfills';
import './responsive';

export default function startApp(attrs) {
  let attributes = merge({}, config.APP);
  attributes.autoboot = true;
  attributes = merge(attributes, attrs); // use defaults, but you can override;

  return run(() => {
    const application = Application.create(attributes);
    application.setupForTesting();
    application.injectTestHelpers();
    return application;
  });
}


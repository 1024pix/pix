import Ember from 'ember';
import Application from '../../app';
import config from '../../config/environment';

export default function startApp(attrs) {
  let application = {};

  let attributes = Ember.merge({}, config.APP);
  attributes = Ember.merge(attributes, attrs); // use defaults, but you can override;

  Ember.run(() => {
    application.app = Application.create(attributes);
    application.app.setupForTesting();
    application.app.injectTestHelpers();
  });

  return application;
}

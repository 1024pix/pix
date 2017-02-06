import ApplicationAdapter from './application';
import Ember from 'ember';

export default ApplicationAdapter.extend({
  // XXX : can't find in the docs why query params are in 3rd position
  // XXX : need the small 'if' for production. Hacky, icky, ugly.
  queryRecord(modelName, clazz, query) {
    let prefix = '/';
    if (this.host !== '/') {
      prefix = this.host + ('/');
    }
    return Ember.$.getJSON( prefix + this.namespace + '/assessments/' + query.assessmentId +  '/solutions/' + query.answerId);
  }
});

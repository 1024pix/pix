import ApplicationAdapter from './application';
import Ember from 'ember';
import RSVP from 'rsvp';

export default ApplicationAdapter.extend({

  queryRecord(modelName, clazz, query) {
    return Ember.$.getJSON( `${this.host}/${this.namespace}/assessments/${query.assessmentId}/solutions/${query.answerId}`, (data) => {
      return RSVP.resolve(data);
    });
  }
});

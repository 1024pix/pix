import ApplicationAdapter from './application';
import $ from 'jquery';
import RSVP from 'rsvp';

export default ApplicationAdapter.extend({

  queryRecord(modelName, clazz, query) {
    return $.getJSON(`${this.host}/${this.namespace}/assessments/${query.assessmentId}/solutions/${query.answerId}`, (data) => {
      return RSVP.resolve(data);
    });
  },
  // refresh cache
  refreshRecord(modelName, clazz) {
    return $.post(`${this.host}/${this.namespace}/challenges/${clazz.challengeId}/solution`, (data) => {
      return RSVP.resolve(data);
    });
  }
});

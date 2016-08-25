
import ApplicationSerializer from './application';
import Ember from 'ember';

export default ApplicationSerializer.extend({
  serialize(result) {

    if (Ember.isArray(result.models)) {
      return {
        records: result.models.map((challenge) => this.serialize(challenge))
      }
    } else {
      return result.attrs;
    }
  }
});

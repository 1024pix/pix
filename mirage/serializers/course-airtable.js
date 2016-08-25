
import ApplicationSerializer from './application';
import Ember from 'ember';

export default ApplicationSerializer.extend({
  serialize(result) {

    if (Ember.isArray(result.models)) {
      return {
        records: result.models.map((course) => this.serialize(course))
      }
    } else {
      return result.attrs
    }
  }
});

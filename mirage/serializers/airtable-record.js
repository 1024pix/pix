
import ApplicationSerializer from './application';
import Ember from 'ember';

export default ApplicationSerializer.extend({
  serialize(result) {

    if (Ember.isArray(result.models)) {
      return {
        records: result.models.map((record) => this.serialize(record))
      }
    } else {
      return result.toJSON();
    }
  }
});

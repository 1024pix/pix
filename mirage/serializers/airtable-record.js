import { RestSerializer } from 'ember-cli-mirage';
import Ember from 'ember';

export default RestSerializer.extend({

  serialize(result) {

    if (Ember.isArray(result.models)) {

      return {
        records: result.models.map((record) => this.serialize(record))
      }
    }
    return result.toJSON();
  }
});


import ApplicationSerializer from './application';
import Ember from 'ember';

export default ApplicationSerializer.extend({
  serialize(result) {

    if (Ember.isArray(result.models)) {
      return {
        records: result.models.map((course) => this.serialize(course))
      }
    } else {

      if (result.attrs.fields['Épreuves']) {
        result.attrs.fields['Épreuves'] = result.attrs.fields['Épreuves'].map((challenge) => {
          return challenge.toJSON ? challenge.toJSON().id : challenge;
        });
      }

      return result.toJSON();
    }
  }
});

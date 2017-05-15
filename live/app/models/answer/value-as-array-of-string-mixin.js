/* global jsyaml */
import Ember from 'ember';

export default Ember.Mixin.create({

  _valuesAsMap: Ember.computed('value', function() {
    try {
      return jsyaml.load(this.get('value'));
    } catch (e) {
      return undefined;
    }
  })

});

import Ember from 'ember';

export default Ember.Component.extend({

  organization: null,
  snapshots: null,
  _hasSnapshots: Ember.computed('snapshots', function() {
    return Ember.isPresent(this.get('snapshots.length')) && this.get('snapshots.length') > 0;
  })

});

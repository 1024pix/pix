import Ember from 'ember';

export default Ember.Component.extend({

  assessment: null,

  hasATrophy: Ember.computed.gt('assessment.estimatedLevel', 0)

});

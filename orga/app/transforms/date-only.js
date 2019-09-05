import DS from 'ember-data';
import moment from 'moment';

export default DS.Transform.extend({
  serialize: function(date) {
    return moment(date).format('YYYY-MM-DD');
  },
  deserialize: function(date) {
    return moment(date).format('YYYY-MM-DD');
  }
});

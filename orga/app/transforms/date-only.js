import DS from 'ember-data';

export default DS.Transform.extend({

  serialize: function(date) {
    return date;
  },

  deserialize: function(date) {
    const dateRegex = '^[0-9]{4}-[0-9]{2}-[0-9]{2}$';
    if (date && date.search(dateRegex) === 0) {
      return date;
    }
    return null;
  }
});

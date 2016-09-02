import { Model, belongsTo, hasMany } from 'ember-cli-mirage';
import attr from 'ember-data/attr';

export default Model.extend({
  id: attr('string'),
  createdTime: attr('string'),
  fields: {},

  attachMany(what, models) {
    this.attrs.fields[what] = models.map((model) => model.attrs.id);
  },

  attachOne(what, model) {
    this.attachMany(what, [model]);
  }
});

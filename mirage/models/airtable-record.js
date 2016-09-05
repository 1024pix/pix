import { Model, belongsTo, hasMany } from 'ember-cli-mirage';
import attr from 'ember-data/attr';

export default Model.extend({
  id: attr('string'),
  createdTime: attr('string'),
  fields: {},

  attachMany(modelName, modelObjects) {
    this.attrs.fields[modelName] = modelObjects.map((model) => model.attrs.id);
  },

  attachOne(modelName, modelObject) {
    this.attachMany(modelName, [modelObject]);
  }
});

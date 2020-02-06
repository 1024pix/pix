import Model, { hasMany } from '@ember-data/model';

export default Model.extend({
  areas: hasMany('area', { inverse: null }),
});

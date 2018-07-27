import DS from 'ember-data';

const { hasMany, Model } = DS;

export default Model.extend({
  areas: hasMany('area', { inverse: null }),
});

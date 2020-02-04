import Model, { attr } from '@ember-data/model';

export default Model.extend({
  competenceName: attr(),
  level: attr(),
});

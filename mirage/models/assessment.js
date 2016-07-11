import { Model, hasMany } from 'ember-cli-mirage';
import attr from 'ember-data/attr';

export default Model.extend({
  title: attr(),
  description: attr(),
  challenges: hasMany()
});

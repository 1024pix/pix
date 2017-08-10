import { Model, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  competences: hasMany('competence'),
  organizations: hasMany('organization'),
});

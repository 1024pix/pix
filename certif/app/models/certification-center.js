import DS from 'ember-data';

const { Model, attr, hasMany } = DS;

export default class CertificationCenter extends Model {
  @attr('string') name;
  @attr('string') type;
  @hasMany('session') sessions;
}

import DS from 'ember-data';

const { Model, attr, hasMany } = DS;

export default class CertificationCenter extends Model {
  @attr('string') name;
  @hasMany('session') sessions;
}

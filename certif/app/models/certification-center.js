import DS from 'ember-data';
import { equal } from '@ember/object/computed';

const { Model, attr, hasMany } = DS;

export default class CertificationCenter extends Model {
  @attr('string') name;
  @attr('string') type;
  @hasMany('session') sessions;

  @equal('type', 'SCO') isSco;
}

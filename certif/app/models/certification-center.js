import Model, { attr, hasMany } from '@ember-data/model';
import { equal } from '@ember/object/computed';

export default class CertificationCenter extends Model {
  @attr('string') name;
  @attr('string') type;
  @hasMany('session') sessions;

  @equal('type', 'SCO') isSco;
}

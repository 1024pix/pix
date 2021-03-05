import Model, { attr } from '@ember-data/model';

export default class CertifiedArea extends Model {
  @attr('string') name;
  @attr('string') color;
}

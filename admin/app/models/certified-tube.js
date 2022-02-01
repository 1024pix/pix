import Model, { attr } from '@ember-data/model';

export default class CertifiedTube extends Model {
  @attr('string') name;
  @attr('string') competenceId;
}

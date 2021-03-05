import Model, { attr } from '@ember-data/model';

export default class CertifiedCompetence extends Model {
  @attr('string') name;
  @attr('string') areaId;
}

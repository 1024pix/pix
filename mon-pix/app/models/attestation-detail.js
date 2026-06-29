import Model, { attr } from '@ember-data/model';

export default class AttestationDetail extends Model {
  @attr('string') type;
  @attr('date') obtainedAt;
  @attr('string') label;
  @attr('string') key;
}

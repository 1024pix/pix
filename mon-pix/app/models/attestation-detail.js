import Model, { attr } from '@warp-drive/legacy/model';

export default class AttestationDetail extends Model {
  @attr('string') type;
  @attr('date') obtainedAt;
  @attr('string') label;
  @attr('string') key;
}

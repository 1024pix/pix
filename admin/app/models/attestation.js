import Model, { attr } from '@warp-drive/legacy/model';

export default class Attestation extends Model {
  @attr('string') templateName;
  @attr('string') key;
  @attr() file;
  @attr('string') label;
}

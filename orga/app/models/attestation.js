import Model, { attr } from '@warp-drive/legacy/model';

export default class Attestations extends Model {
  @attr('string') label;
  @attr('string') key;
}

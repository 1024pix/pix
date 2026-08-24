import Model, { attr } from '@warp-drive/legacy/model';

export default class Division extends Model {
  @attr('string') name;
}

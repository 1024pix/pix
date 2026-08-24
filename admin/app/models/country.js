import Model, { attr } from '@warp-drive/legacy/model';

export default class Country extends Model {
  @attr('string') code;
  @attr('string') name;
}

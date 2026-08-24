import Model, { attr } from '@warp-drive/legacy/model';

export default class Skill extends Model {
  @attr('number') difficulty;
}

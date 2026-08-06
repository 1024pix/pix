import Model, { attr } from '@warp-drive/legacy/model';

export default class Levelup extends Model {
  // attributes
  @attr('string') competenceName;
  @attr('number') level;
}

import Model, { attr } from '@warp-drive/legacy/model';

export default class Module extends Model {
  @attr('string') shortId;
  @attr('string') title;
  @attr() details;
}

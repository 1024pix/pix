import Model, { attr } from '@warp-drive/legacy/model';

export default class Banner extends Model {
  @attr() severity;
  @attr() message;
}

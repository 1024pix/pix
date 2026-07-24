import Model, { attr } from '@warp-drive/legacy/model';

export default class Banner extends Model {
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() severity;
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() message;
}

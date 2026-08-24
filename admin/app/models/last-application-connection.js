import Model, { attr } from '@warp-drive/legacy/model';

export default class LastApplicationConnection extends Model {
  @attr() application;
  @attr() lastLoggedAt;
}

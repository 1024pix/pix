import Model, { attr } from '@warp-drive/legacy/model';

export default class AdministrationTeam extends Model {
  @attr('string') name;
}

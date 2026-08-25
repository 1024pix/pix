import Model, { attr } from '@warp-drive/legacy/model';

export default class CalibrationScoringConfiguration extends Model {
  @attr('number') calibrationId;
  @attr() globalScoringConfiguration;

  /**
   * The API only exposes the meshes of a validated set, so an empty configuration means Data has
   * not delivered or not validated them yet — two cases the form has nothing to tell apart.
   */
  get hasProposal() {
    return Boolean(this.globalScoringConfiguration?.length);
  }
}

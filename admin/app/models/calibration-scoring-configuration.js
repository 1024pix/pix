import Model, { attr } from '@warp-drive/legacy/model';

export default class CalibrationScoringConfiguration extends Model {
  @attr('number') calibrationId;
  @attr() globalScoringConfiguration;
  @attr() competencesScoringConfiguration;
}

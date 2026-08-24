import Model, { attr } from '@warp-drive/legacy/model';

export default class CalibrationReport extends Model {
  @attr('date') generatedAt;
  @attr('number') calibrationId;
  @attr() reportLines;
}

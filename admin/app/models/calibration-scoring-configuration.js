import Model, { attr } from '@warp-drive/legacy/model';

export const SCORING_MESH_AVAILABILITIES = {
  AVAILABLE: 'AVAILABLE',
  PENDING: 'PENDING',
  NOT_VALIDATED: 'NOT_VALIDATED',
};

export default class CalibrationScoringConfiguration extends Model {
  @attr('number') calibrationId;
  @attr('string') availability;
  @attr() globalScoringConfiguration;

  get isAvailable() {
    return this.availability === SCORING_MESH_AVAILABILITIES.AVAILABLE;
  }
}

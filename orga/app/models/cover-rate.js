import Model, { attr } from '@ember-data/model';

export default class CoverRate extends Model {
  @attr({ defaultValue: () => [] }) byAreas;
  @attr({ defaultValue: () => [] }) byCompetences;
  @attr({ defaultValue: () => [] }) byTubes;
}

import Model, { attr } from '@warp-drive/legacy/model';

export default class PlaceStatistics extends Model {
  @attr('number') available;
  @attr('number') total;
  @attr('number') occupied;
  @attr('number') anonymousSeat;
  @attr('boolean') hasReachedMaximumPlacesLimit;

  get hasAnonymousSeat() {
    return this.anonymousSeat > 0;
  }
}

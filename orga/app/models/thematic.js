import Model, { attr, hasMany } from '@warp-drive/legacy/model';

export default class Tube extends Model {
  @attr('string') name;
  @attr('number') index;

  @hasMany('tube', { async: true, inverse: null }) tubes;

  get sortedTubes() {
    return this.hasMany('tubes')
      .value()
      .slice()
      .sort((a, b) => {
        return a.practicalTitle.localeCompare(b.practicalTitle);
      });
  }
}
